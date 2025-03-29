import Bull from 'bull';
import { executeCpp } from './executeCpp.js';
import { executeJava } from './executeJava.js';
import { executePython } from './executePython.js';
import { generateFile } from './generateFile.js';
import { generateInputFile } from './generateInputFile.js';
import moment from 'moment';
import mongoose from 'mongoose';

// Determine if running in Docker
const isDocker = process.env.DOCKER_ENV === 'true';

// Configure Redis connection
const redisConfig = {
  host: isDocker ? 'redis' : (process.env.REDIS_HOST || 'localhost'),
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: isDocker ? undefined : process.env.REDIS_PASSWORD,
  tls: !isDocker && process.env.REDIS_TLS === 'true' ? {} : undefined,
  maxRetriesPerRequest: 3
};

// Create a job queue with optimized settings
const jobQueue = new Bull('code-execution-queue', {
  redis: redisConfig,
  limiter: {
    max: 5, // Max number of jobs processed in parallel
    duration: 5000 // Time window in milliseconds
  },
  defaultJobOptions: {
    attempts: 2,
    timeout: 30000, // 30 seconds timeout
    removeOnComplete: true
  }
});

// Process jobs in the queue
jobQueue.process(5, async ({ data }) => {
  const { code, language, input, compileOnly } = data;
  
  try {
    console.log(`Processing ${language} code execution${compileOnly ? ' (compile only)' : ''}`);
    
    const filePath = await generateFile(language, code);
    
    // If compile-only mode, just check if it compiles
    if (compileOnly) {
      if (language === "java") {
        await executeJava(filePath, null, true);
      } else if (language === "cpp") {
        await executeCpp(filePath, null, true);
      } else if (language === "python") {
        // Python doesn't need compilation, but we can check for syntax errors
        await executePython(filePath, null, true);
      }
      return { success: true };
    }
    
    const inputPath = await generateInputFile(input);
    
    let output;
    const start = moment(new Date());
    
    if (language === "java") {
      output = await executeJava(filePath, inputPath);
    } else if (language === "python") {
      output = await executePython(filePath, inputPath);
    } else {
      output = await executeCpp(filePath, inputPath);
    }
    
    const end = moment(new Date());
    const executionTime = end.diff(start, "seconds", true);
    
    return { 
      success: true,
      output, 
      executionTime 
    };
  } catch (error) {
    console.error('Job execution error:', error);
    return { 
      success: false,
      error: error.stderr || error.message || "Error executing code" 
    };
  }
});

// Add error handling for the queue
jobQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

jobQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled`);
});

// Export the jobQueue so it can be imported in other files
export { jobQueue, addJobToQueue };

// Add a function to add jobs to the queue
const addJobToQueue = async (code, language, input, compileOnly = false) => {
  try {
    const job = await jobQueue.add({
      code,
      language,
      input,
      compileOnly
    });
    
    return job.id;
  } catch (error) {
    console.error('Error adding job to queue:', error);
    throw error;
  }
};

// Create a submission queue
const submissionQueue = new Bull('submission-queue', {
  redis: { host: process.env.REDIS_HOST || 'localhost', port: 6379 },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

// Process jobs in the submission queue
submissionQueue.process(async ({ data }) => {
  const { code, language, problemId, userId, submissionId } = data;
  
  try {
    console.log(`Processing submission for problemId=${problemId}, userId=${userId}, language=${language}`);
    
    // Update submission status to "Processing"
    if (submissionId) {
      const Submission = mongoose.model('Submission');
      await Submission.findByIdAndUpdate(submissionId, {
        'verdict.status': 'Processing',
        'verdict.details': 'Submission is being evaluated'
      });
    }
    
    // Get verdict for the submission
    const verdictResult = await getVerdict(problemId, code, language);
    
    // Update submission with final result
    if (submissionId) {
      await Submission.findByIdAndUpdate(submissionId, {
        verdict: verdictResult.verdict, // Store the complete verdict object
        results: verdictResult.results,
        status: 'completed',
        completedAt: new Date()
      });
    }
    
    return verdictResult;
  } catch (error) {
    console.error('Error processing submission:', error);
    
    // Update submission with error status
    if (submissionId) {
      const Submission = mongoose.model('Submission');
      await Submission.findByIdAndUpdate(submissionId, {
        'verdict.status': 'Error',
        'verdict.details': error.message || 'An error occurred during processing'
      });
    }
    
    throw error;
  }
});

// Add error handling for the submission queue
submissionQueue.on('failed', (job, error) => {
  console.error(`Submission job ${job.id} failed:`, error);
});

submissionQueue.on('stalled', (job) => {
  console.warn(`Submission job ${job.id} stalled`);
});

// Make sure this function is properly defined
export const addJobToSubmissionQueue = async (code, language, problemId, userId) => {
  try {
    console.log(`Adding submission job to queue: problemId=${problemId}, userId=${userId}, language=${language}`);
    
    // Create a job in the submission queue
    const job = await submissionQueue.add({
      code,
      language,
      problemId,
      userId,
      timestamp: new Date()
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
    
    console.log(`Created submission job with ID: ${job.id}`);
    return job.id;
  } catch (error) {
    console.error('Error adding job to submission queue:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

export default {addJobToQueue};






