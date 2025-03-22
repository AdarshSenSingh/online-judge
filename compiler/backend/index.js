import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateFile } from './generateFile.js';
import { generateInputFile } from './generateInputFile.js';
import { executeCpp } from './executeCpp.js';
import { getVerdict } from './Verdict.js';
import jwt from 'jsonwebtoken';
import Submission from './models/Submission.js';
import axios from 'axios';
import { validateTestCases, testSolution } from './testCaseValidator.js';
import { executeJava } from './executeJava.js';
import { executePython } from './executePython.js';
import Bull from 'bull';
import moment from 'moment';
import { promisify } from 'util';
import { exec } from 'child_process';
import os from 'os';
import fs from 'fs/promises';
import { jobQueue } from './jobQueue.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();
console.log('Environment variables loaded');

// Check if required environment variables are defined
if (process.env.JWT_SECRET_KEY) {
  console.log('JWT_SECRET_KEY: defined');
} else {
  console.log('JWT_SECRET_KEY: not defined');
}

if (process.env.MONGODB_URI) {
  console.log('MONGODB_URI: defined');
} else {
  console.log('MONGODB_URI: not defined');
}

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis and Bull queue variables
// let redisAvailable = false;
let jobRunnerQueue = null;
let submissionQueue = null;

// Make sure Redis is available before using the queue
const checkRedisAvailability = async () => {
  try {
    // Create a simple Redis client to check connection
    const Redis = (await import('ioredis')).default;
    const client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      connectTimeout: 5000,
      maxRetriesPerRequest: 1
    });
    
    // Try to ping Redis
    await client.ping();
    await client.quit();
    console.log('Redis is available');
    return true;
  } catch (error) {
    console.error('Redis is not available:', error.message);
    return false;
  }
};

// Initialize Redis connection status (only declare once)
let redisAvailable = false;

// Check Redis availability on startup
(async () => {
  redisAvailable = await checkRedisAvailability();
  console.log(`Redis availability: ${redisAvailable}`);
})();

// Initialize Bull queues only if Redis is available
const initializeQueues = async () => {
  try {
    redisAvailable = await checkRedisAvailability();
    
    if (redisAvailable) {
      console.log('Initializing Bull queues with Redis');
      
      // Fix the Redis configuration for Bull
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        // Remove problematic options that might cause connection issues
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        connectTimeout: 5000
      };
      
      try {
        jobRunnerQueue = new Bull('job-runner-queue', {
          redis: redisConfig,
          limiter: { max: 5, duration: 5000 },
          defaultJobOptions: {
            attempts: 2,
            timeout: 30000,
            removeOnComplete: true
          }
        });
        
        submissionQueue = new Bull('submission-queue', {
          redis: redisConfig,
          limiter: { max: 3, duration: 5000 },
          defaultJobOptions: {
            attempts: 2,
            timeout: 60000,
            removeOnComplete: true
          }
        });
        
        console.log('Bull queues initialized successfully');
        return true;
      } catch (error) {
        console.error('Failed to initialize Bull queues:', error);
        redisAvailable = false;
        return false;
      }
    } else {
      console.log('Redis is not available, skipping Bull queue initialization');
      return false;
    }
  } catch (error) {
    console.error('Error in queue initialization:', error);
    redisAvailable = false;
    return false;
  }
};

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB for Compiler service...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is defined' : 'URI is not defined');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB for Compiler service');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Add job to queue
const addJobToRunnerQueue = async (code, language, input, problemId) => {
  if (!redisAvailable || !jobRunnerQueue) {
    throw new Error('Queue not available');
  }
  
  const job = await jobRunnerQueue.add({
    code,
    language,
    input,
    problemId
  });
  
  return job.id;
};

// Add submission to queue
const addJobToSubmissionQueue = async (code, language, problemId, userId, submissionId) => {
  if (!redisAvailable || !submissionQueue) {
    throw new Error('Queue not available');
  }
  
  const job = await submissionQueue.add({
    code,
    language,
    problemId,
    userId,
    submissionId
  });
  
  return job.id;
};

// Initialize the application
const initializeApp = async () => {
  await connectToMongoDB();
  await initializeQueues();
  
  // Process jobs in the queue
  if (redisAvailable && jobRunnerQueue) {
    jobRunnerQueue.process(async (job) => {
      const { code, language, input } = job.data;
      
      try {
        const filePath = await generateFile(language, code);
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
        
        return { output, executionTime };
      } catch (error) {
        return { 
          error: error.stderr || error.message || "Error executing code" 
        };
      }
    });
  }
  
  // Process jobs in the submission queue
  if (redisAvailable && submissionQueue) {
    submissionQueue.process(async (job) => {
      const { code, language, problemId, userId, submissionId } = job.data;
      
      try {
        // Get verdict for the submission
        const verdictResult = await getVerdict(problemId, code, language);
        
        // Update submission in database
        if (submissionId) {
          await Submission.findByIdAndUpdate(submissionId, {
            verdict: verdictResult.verdict,
            results: verdictResult.results,
            status: 'completed',
            completedAt: new Date()
          });
        } else {
          // Create new submission if ID not provided
          const submission = new Submission({
            userId,
            problemId,
            code,
            language,
            verdict: verdictResult.verdict,
            results: verdictResult.results,
            status: 'completed',
            completedAt: new Date()
          });
          await submission.save();
        }
        
        return verdictResult;
      } catch (error) {
        console.error('Error processing submission:', error);
        
        // Update submission with error
        if (submissionId) {
          await Submission.findByIdAndUpdate(submissionId, {
            status: 'error',
            error: error.message,
            completedAt: new Date()
          });
        }
        
        throw error;
      }
    });
  }
  
  // Start the server
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Compiler server running on port ${PORT}`);
  });
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.userID || decoded.userId || decoded.sub;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Define routes
app.get('/', (req, res) => {
  res.json({ message: 'Compiler service is running' });
});

// Route to execute code
app.post('/run', async (req, res) => {
  const { language = 'cpp', code, input = '' } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  
  try {
    let filePath = await generateFile(language, code);
    let inputPath = await generateInputFile(input);
    
    // Execute based on language
    let output;
    let startTime = Date.now();
    try {
      if (language === 'java') {
        output = await executeJava(filePath, inputPath);
      } else if (language === 'python') {
        output = await executePython(filePath, inputPath);
      } else {
        output = await executeCpp(filePath, inputPath);
      }
      let executionTime = Date.now() - startTime;
      
      res.json({ 
        success: true,
        output,
        executionTime 
      });
    } catch (execError) {
      // Handle compilation/execution errors gracefully
      console.error("Code execution error:", execError);
      
      // Return a 200 response with error details
      res.status(200).json({ 
        success: false, 
        error: execError.stderr || execError.message || "Error executing code",
        output: execError.stderr || execError.message || "Compilation failed"
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Server error processing your request",
      output: "Server error: Unable to process your code"
    });
  }
});

// Route to test code against a test case
app.post('/test/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'cpp', code, testCaseId } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }
    
    // Get test case from database
    const testCase = await TestCase.findById(testCaseId);
    if (!testCase) {
      return res.status(404).json({ error: "Test case not found" });
    }
    
    // Generate file and input
    let filePath = await generateFile(language, code);
    let inputPath = await generateInputFile(testCase.input);
    
    // Execute based on language
    let output;
    try {
      if (language === 'java') {
        output = await executeJava(filePath, inputPath);
      } else if (language === 'python') {
        output = await executePython(filePath, inputPath);
      } else {
        output = await executeCpp(filePath, inputPath);
      }
    } catch (error) {
      return res.status(500).json({
        error: "Execution error",
        message: error.message || "Unknown execution error",
        details: error
      });
    }
    
    // Compare outputs
    const expectedOutput = testCase.output.replace(/\r\n/g, '\n').trim();
    const actualOutput = output.replace(/\r\n/g, '\n').trim();
    
    res.json({
      testCase: {
        input: testCase.input,
        expectedOutput,
        actualOutput,
        passed: expectedOutput === actualOutput
      },
      debug: {
        expectedHex: Buffer.from(expectedOutput).toString('hex'),
        actualHex: Buffer.from(actualOutput).toString('hex'),
        filePath,
        inputPath
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this endpoint to validate test cases
app.get("/validate-testcases/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await validateTestCases(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this endpoint to test a solution against test cases
app.post("/test-solution/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, language = 'cpp' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }
    
    const result = await testSolution(id, language, code);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this endpoint to debug submissions
app.get("/debug-submissions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Debugging submissions for userId: ${userId}`);
    console.log(`userId type: ${typeof userId}`);
    
    // Count total submissions in the database
    const totalCount = await Submission.countDocuments();
    console.log(`Total submissions in database: ${totalCount}`);
    
    // Count submissions for this user
    const userCount = await Submission.countDocuments({ userId });
    console.log(`Total submissions for user ${userId}: ${userCount}`);
    
    // Get a sample of submissions to check userId format
    const sampleSubmissions = await Submission.find().limit(5);
    if (sampleSubmissions.length > 0) {
      console.log('Sample submission userIds:');
      sampleSubmissions.forEach(sub => {
        console.log(`- ${sub.userId} (type: ${typeof sub.userId})`);
      });
    }
    
    // Get recent submissions for this user
    const submissions = await Submission.find({ userId })
      .sort({ timestamp: -1 })
      .limit(5);
    
    // Check MongoDB connection state
    const connectionState = mongoose.connection.readyState;
    console.log(`MongoDB connection state: ${connectionState}`);
    
    res.json({
      success: true,
      connectionState,
      totalCount,
      userCount,
      userId: {
        value: userId,
        type: typeof userId
      },
      sampleUserIds: sampleSubmissions.map(sub => ({
        value: sub.userId,
        type: typeof sub.userId
      })),
      submissions
    });
  } catch (error) {
    console.error('Error debugging submissions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add a new endpoint to check if code compiles without running it
app.post("/compiler/:id/compile", async (req, res) => {
  try {
    const { language = "cpp", code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }
    
    let filePath = await generateFile(language, code);
    
    try {
      if (language === "java") {
        // For Java, just compile without running
        await executeJava(filePath, null, true);
      } else if (language === "cpp") {
        // For C++, just compile without running
        await executeCpp(filePath, null, true);
      } else if (language === "python") {
        // Python is interpreted, so we do a syntax check
        await executePython(filePath, null, true);
      }
      
      return res.json({ success: true, message: "Compilation successful" });
    } catch (error) {
      console.error("Compilation error:", error);
      return res.status(400).json({ 
        error: error.stderr || error.message || "Compilation failed" 
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add endpoint to check job status
app.get("/job-status/:queue/:id", async (req, res) => {
  try {
    const { queue, id } = req.params;
    
    let job;
    if (queue === 'runner') {
      job = await jobRunnerQueue.getJob(id);
    } else if (queue === 'submission') {
      job = await submissionQueue.getJob(id);
    } else {
      return res.status(400).json({ error: "Invalid queue type" });
    }
    
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    const state = await job.getState();
    const progress = job._progress;
    const result = job.returnvalue;
    
    res.json({
      id: job.id,
      state,
      progress,
      result: state === 'completed' ? result : null,
      createdAt: job.timestamp
    });
  } catch (error) {
    console.error("Error checking job status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Define executeCode function
const execPromise = promisify(exec);
const executeCode = async (language, code, input) => {
  try {
    // Create a temporary directory for the code
    const dirPath = path.join(os.tmpdir(), `code-${Date.now()}`);
    await fs.mkdir(dirPath, { recursive: true });
    
    let fileName, command;
    
    // Set up file and command based on language
    if (language === 'cpp') {
      fileName = 'main.cpp';
      await fs.writeFile(path.join(dirPath, fileName), code);
      await fs.writeFile(path.join(dirPath, 'input.txt'), input || '');
      
      // Compile and run
      await execPromise(`g++ ${fileName} -o main`, { cwd: dirPath });
      const { stdout, stderr } = await execPromise('./main < input.txt', { cwd: dirPath });
      
      return { output: stdout || stderr };
    } else if (language === 'python') {
      fileName = 'main.py';
      await fs.writeFile(path.join(dirPath, fileName), code);
      await fs.writeFile(path.join(dirPath, 'input.txt'), input || '');
      
      // Run Python code
      const { stdout, stderr } = await execPromise(`python ${fileName} < input.txt`, { cwd: dirPath });
      
      return { output: stdout || stderr };
    } else if (language === 'java') {
      fileName = 'Main.java';
      await fs.writeFile(path.join(dirPath, fileName), code);
      await fs.writeFile(path.join(dirPath, 'input.txt'), input || '');
      
      // Compile and run Java code
      await execPromise(`javac ${fileName}`, { cwd: dirPath });
      const { stdout, stderr } = await execPromise(`java Main < input.txt`, { cwd: dirPath });
      
      return { output: stdout || stderr };
    }
    
    return { error: 'Unsupported language' };
  } catch (error) {
    console.error('Execution error:', error);
    return { error: error.message };
  }
};

// Route to submit a solution
app.post('/submit', verifyToken, async (req, res) => {
  const { language = 'cpp', code, problemId } = req.body;
  const userId = req.userId;
  
  console.log(`[DEBUG] Submit request received: problemId=${problemId}, userId=${userId}, language=${language}`);
  
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  
  if (!problemId) {
    return res.status(400).json({ error: 'Problem ID is required' });
  }
  
  try {
    // Create a new submission
    const submission = new Submission({
      userId,
      problemId,
      problemTitle: req.body.problemTitle || 'Unknown Problem',
      code,
      language,
      verdict: { status: 'Processing' },
      status: 'pending',
      submittedAt: new Date()
    });
    
    // Save the submission to get an ID
    const savedSubmission = await submission.save();
    console.log(`[DEBUG] Submission created with ID: ${savedSubmission._id}`);
    
    // Send immediate response with submission ID
    res.json({
      success: true,
      message: 'Submission received and processing',
      submissionId: savedSubmission._id
    });
    
    // Process after sending response (don't wait for processing to complete)
    try {
      console.log(`[DEBUG] Processing submission ${savedSubmission._id}`);
      
      // Pass the submissionId to getVerdict so it can update the existing submission
      const verdictResult = await getVerdict(
        problemId, 
        code, 
        language, 
        savedSubmission._id.toString() // Ensure it's a string
      );
      
      console.log(`[DEBUG] Verdict result for ${savedSubmission._id}:`, 
        JSON.stringify(verdictResult.verdict));
      
      // No need to update the submission here as getVerdict already does it
    } catch (error) {
      console.error(`[DEBUG] Error processing submission ${savedSubmission._id}:`, error);
      
      // Update submission with error
      await Submission.findByIdAndUpdate(
        savedSubmission._id,
        {
          verdict: { status: 'Error', message: error.message },
          status: 'error',
          completedAt: new Date()
        }
      );
    }
  } catch (error) {
    console.error('[DEBUG] Submission creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get submission details
app.get('/submissions/:id', verifyToken, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    // Check if user has permission to view this submission
    if (submission.userId.toString() !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to view this submission' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get user submissions
app.get('/submissions', verifyToken, async (req, res) => {
  try {
    const { problemId, limit = 50, skip = 0 } = req.query;
    const query = { userId: req.userId };
    
    if (problemId) {
      query.problemId = problemId;
    }
    
    // Increased default limit to 50
    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    const total = await Submission.countDocuments(query);
    
    res.json({
      submissions,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this endpoint for debugging Redis connection
app.get('/debug-redis', async (req, res) => {
  try {
    const redisStatus = await checkRedisAvailability();
    res.json({
      redisAvailable: redisStatus,
      queueStatus: {
        jobRunnerQueue: jobRunnerQueue ? 'initialized' : 'not initialized',
        submissionQueue: submissionQueue ? 'initialized' : 'not initialized'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Add a fallback route for verdict when Redis is unavailable
app.post('/verdict/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { language = 'cpp', code } = req.body;
  const userId = req.userId;
  
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  
  try {
    // Create a new submission record
    const submission = new Submission({
      userId,
      problemId: id,
      problemTitle: req.body.problemTitle || 'Unknown Problem',
      code,
      language,
      verdict: { status: 'Processing' },
      status: 'pending',
      submittedAt: new Date()
    });
    
    const savedSubmission = await submission.save();
    console.log(`[DEBUG] Submission created with ID: ${savedSubmission._id}`);
    
    // Always process immediately to avoid Redis issues
    // Pass the submissionId as the fourth parameter
    const verdictResult = await getVerdict(id, code, language, savedSubmission._id.toString());
    
    res.json({
      success: true,
      message: 'Submission processed',
      submissionId: savedSubmission._id,
      result: verdictResult
    });
  } catch (error) {
    console.error('[DEBUG] Submission creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize the application (only once)
initializeApp().catch(error => {
  console.error('Failed to initialize application:', error);
  process.exit(1);
});

// Export for testing
export { app };










