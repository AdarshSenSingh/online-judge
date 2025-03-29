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
const PORT = process.env.PORT || 8000;

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
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis and Bull queue variables
let jobRunnerQueue = null;
let submissionQueue = null;
let redisAvailable = false;

// Check if Redis should be skipped
const skipRedis = process.env.SKIP_REDIS === 'TRUE';
const isDocker = process.env.DOCKER_ENV === 'true';

if (!skipRedis) {
  try {
    // Only import Bull if Redis is not skipped
    const Bull = (await import('bull')).default;
    
    const redisConfig = {
      host: isDocker ? 'redis' : (process.env.REDIS_HOST || 'localhost'),
      port: parseInt(process.env.REDIS_PORT || '6379'),
      // Only use password if it's in Docker or explicitly required
      password: isDocker ? undefined : (process.env.REDIS_PASSWORD_REQUIRED === 'true' ? process.env.REDIS_PASSWORD : undefined),
      tls: process.env.REDIS_TLS === 'true' ? {} : false,
      maxRetriesPerRequest: 3
    };
    
    console.log('Initializing Bull queues with Redis config:', 
      { host: redisConfig.host, port: redisConfig.port, tls: redisConfig.tls ? 'enabled' : 'disabled' });
    
    // Initialize Bull queues with error handling
    jobRunnerQueue = new Bull('code-runner-queue', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 2,
        timeout: 30000,
        removeOnComplete: true
      }
    });
    
    submissionQueue = new Bull('submission-queue', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 2,
        timeout: 60000,
        removeOnComplete: true
      }
    });
    
    // Add error handlers to queues
    jobRunnerQueue.on('error', (error) => {
      console.error('Job runner queue error:', error);
      redisAvailable = false;
    });
    
    submissionQueue.on('error', (error) => {
      console.error('Submission queue error:', error);
      redisAvailable = false;
    });
    
    redisAvailable = true;
    console.log('Bull queues initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Bull queues:', error.message);
    redisAvailable = false;
  }
} else {
  console.log('Redis is skipped by configuration, not initializing queues');
}

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB for Compiler service...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is defined' : 'URI is not defined');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Connected to MongoDB for Compiler service');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Add job to queue
const addJobToRunnerQueue = async (code, language, input, problemId) => {
  if (!redisAvailable) {
    console.log('Redis not available, processing job directly');
    // Process the job directly instead of using a queue
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
      throw new Error(error.stderr || error.message || "Error executing code");
    }
  }
  
  // Only try to use the queue if Redis is available
  if (!jobRunnerQueue) {
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
  if (!redisAvailable) {
    console.log('Redis not available, processing submission directly');
    // Process the submission directly
    try {
      // Get verdict for the submission
      const verdictResult = await getVerdict(problemId, code, language, submissionId);
      console.log(`Direct processing result for submission ${submissionId}:`, verdictResult);
      return verdictResult;
    } catch (error) {
      console.error(`Error in direct processing for submission ${submissionId}:`, error);
      throw new Error(error.message || "Error processing submission");
    }
  }
  
  if (!submissionQueue) {
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
  // Remove the call to initializeQueues since it doesn't exist
  
  // Process jobs in the queue if Redis is available
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
  
  console.log('Application initialized successfully');
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided or invalid format');
      return res.status(401).json({ error: 'No token provided or invalid format' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token.substring(0, 10) + '...');
    
    // Use the correct secret key
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || 'your_jwt_secret';
    console.log('Using secret key:', secret ? 'Secret is defined' : 'Secret is not defined');
    
    const decoded = jwt.verify(token, secret);
    console.log('Token decoded successfully:', decoded);
    
    // Set userId from the decoded token
    req.userId = decoded.userId || decoded._id || decoded.id;
    console.log('User ID set in request:', req.userId);
    
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Define routes
app.get('/', (req, res) => {
  res.json({ message: 'Compiler service is running' });
});

// Route to execute code
app.post('/run', async (req, res) => {
  console.log('Received /run request:', req.body);
  
  try {
    const { language = 'cpp', code, input = '' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // Execute the code
    try {
      const result = await addJobToRunnerQueue(code, language, input);
      
      // Check if result is a job ID (when using Redis) or direct output
      if (typeof result === 'string' && redisAvailable) {
        // It's a job ID, so we need to wait for the job to complete
        const job = await jobRunnerQueue.getJob(result);
        const jobResult = await job.finished();
        
        if (jobResult.error) {
          return res.status(400).json({ 
            success: false, 
            error: jobResult.error 
          });
        }
        
        return res.json({
          success: true,
          output: jobResult.output,
          executionTime: jobResult.executionTime
        });
      } else {
        // Direct result when not using Redis
        return res.json({
          success: true,
          output: result.output,
          executionTime: result.executionTime
        });
      }
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message || "Error executing code" 
      });
    }
  } catch (error) {
    console.error('Error in /run endpoint:', error);
    return res.status(500).json({ error: error.message || "Server error" });
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

// Route to submit a solution - modified to not require authentication
app.post('/submit', async (req, res) => {
  const { language = 'cpp', code, problemId, problemTitle = 'Unknown Problem' } = req.body;
  
  console.log(`[DEBUG] Submit request received: problemId=${problemId}, language=${language}`);
  
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  
  if (!problemId) {
    return res.status(400).json({ error: 'Problem ID is required' });
  }
  
  try {
    // Create a new submission with anonymous user
    const submission = new Submission({
      userId: 'anonymous', // Use anonymous instead of requiring a user ID
      problemId,
      problemTitle: problemTitle,
      code,
      language,
      verdict: { status: 'Processing' },
      status: 'pending',
      submittedAt: new Date()
    });
    
    // Save the submission
    const savedSubmission = await submission.save();
    console.log(`[DEBUG] Submission saved with ID: ${savedSubmission._id}`);
    
    // Process the submission
    let result;
    try {
      // Get verdict for the submission
      result = await getVerdict(problemId, code, language, savedSubmission._id);
      console.log(`[DEBUG] Verdict result:`, result);
      
      // Update the submission with the verdict result
      await Submission.findByIdAndUpdate(savedSubmission._id, {
        verdict: result.verdict,
        status: 'completed',
        completedAt: new Date()
      });
      
      console.log(`[DEBUG] Submission updated with verdict`);
    } catch (verdictError) {
      console.error(`[ERROR] Error getting verdict:`, verdictError);
      result = { 
        verdict: { 
          status: 'Error', 
          message: verdictError.message || 'Error processing submission' 
        } 
      };
    }
    
    // Return the result
    res.json({
      success: true,
      submissionId: savedSubmission._id,
      result
    });
  } catch (error) {
    console.error(`[ERROR] Error in submission:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get all submissions - no authentication required
app.get('/submissions', async (req, res) => {
  try {
    console.log(`[DEBUG] Fetching all submissions`);
    
    // Get all submissions, sorted by newest first
    const submissions = await Submission.find().sort({ submittedAt: -1 }).limit(100);
    console.log(`[DEBUG] Found ${submissions.length} submissions`);
    
    // Return the submissions
    res.json({
      submissions,
      total: submissions.length,
      limit: 100,
      skip: 0
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

// Route to handle verdict requests
app.post('/verdict/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const { language, code } = req.body;
    
    // Get user ID from token if available
    let userId = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        userId = decoded.userId || decoded._id;
        console.log("User ID from token:", userId);
      } else {
        // Try to get userId from localStorage if it's in the request
        userId = req.body.userId || null;
        console.log("User ID from request body:", userId);
      }
    } catch (error) {
      console.error("Error extracting user ID:", error);
    }
    
    // Create a new submission record
    const submission = new Submission({
      problemId,
      userId: userId || 'anonymous',
      language,
      code,
      submittedAt: new Date(),
      status: 'pending'
    });
    
    await submission.save();
    console.log("Created submission:", submission._id, "for user:", userId);
    
    let result;
    try {
      // Process the submission
      if (redisAvailable && submissionQueue) {
        // Add to queue if Redis is available
        const jobId = await addJobToSubmissionQueue(code, language, problemId, userId, submission._id);
        console.log("Added submission to queue with job ID:", jobId);
        result = { jobId };
      } else {
        // Process directly if Redis is not available
        console.log("Processing submission directly (Redis not available)");
        result = await getVerdict(problemId, code, language, submission._id);
        console.log("Direct processing complete, result:", result);
      }
      
      // Force a final check of the submission status
      const finalSubmission = await Submission.findById(submission._id);
      console.log("Final submission state:", finalSubmission.verdict);
      
      res.json({
        success: true,
        message: 'Submission processed',
        submissionId: submission._id,
        result: finalSubmission.verdict ? { verdict: finalSubmission.verdict } : result
      });
    } catch (error) {
      console.error("Error processing submission:", error);
      
      // Update the submission with the error
      await Submission.findByIdAndUpdate(submission._id, {
        'verdict.status': 'Error',
        'verdict.details': error.message || 'An error occurred during processing',
        status: 'error',
        completedAt: new Date()
      });
      
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred during processing',
        submissionId: submission._id
      });
    }
  } catch (error) {
    console.error("Error in verdict endpoint:", error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred'
    });
  }
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    jwtSecretConfigured: !!process.env.JWT_SECRET_KEY,
    mongodbConnected: mongoose.connection.readyState === 1,
    redisAvailable
  });
});

// Debug route to check submission model
app.get('/debug/submission-model', async (req, res) => {
  try {
    // Get the Submission model schema
    const schema = Submission.schema.obj;
    
    // Get a sample submission if available
    const sampleSubmission = await Submission.findOne({});
    
    res.json({
      schema,
      sampleSubmission: sampleSubmission || null,
      collectionName: Submission.collection.name
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to create a submission
app.post('/test/create-submission', async (req, res) => {
  try {
    const { userId, problemId, code, language } = req.body;
    
    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create a test submission
    const submission = new Submission({
      userId,
      problemId,
      code,
      language,
      verdict: { status: 'Test' },
      status: 'completed',
      submittedAt: new Date(),
      completedAt: new Date()
    });
    
    // Save the submission
    const savedSubmission = await submission.save();
    console.log(`[TEST] Created test submission: ${savedSubmission._id}`);
    
    // Return the saved submission
    res.json({
      success: true,
      submission: savedSubmission
    });
  } catch (error) {
    console.error('[ERROR] Error creating test submission:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to get all submissions
app.get('/test/all-submissions', async (req, res) => {
  try {
    // Get all submissions in the database
    const submissions = await Submission.find({});
    console.log(`[TEST] Found ${submissions.length} total submissions in database`);
    
    // Return all submissions
    res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('[ERROR] Error fetching all submissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add an endpoint to get a submission by ID
app.get('/submission/:id', async (req, res) => {
  try {
    const submissionId = req.params.id;
    
    // Find the submission in the database
    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        error: 'Submission not found' 
      });
    }
    
    // Return the submission data
    return res.json({
      success: true,
      submission: {
        _id: submission._id,
        problemId: submission.problemId,
        language: submission.language,
        status: submission.status,
        verdict: submission.verdict,
        createdAt: submission.createdAt,
        completedAt: submission.completedAt
      }
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Function to start the server with port fallback
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Server URL: http://localhost:${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is busy, trying port ${PORT + 1}`);
      app.listen(PORT + 1, () => {
        console.log(`Server is listening on ${PORT + 1}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
};

// Initialize the application and start the server
initializeApp().then(() => {
  startServer();
}).catch(error => {
  console.error('Failed to initialize application:', error);
});

// Export for testing
export { app };
