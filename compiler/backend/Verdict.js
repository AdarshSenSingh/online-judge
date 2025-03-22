import axios from 'axios';
import { validateTestCases } from './testCaseValidator.js';
import moment from 'moment';
import { addJobToQueue, jobQueue } from './jobQueue.js';
import mongoose from 'mongoose';

// 1. Fetch test cases from the crud backend
const fetchTestCases = async (problemId) => {
  try {
    const response = await axios.get(`${process.env.CRUD_URL || 'http://localhost:2000'}/crud/getOne/${problemId}`);
    return response.data.testCases;
  } catch (error) {
    console.error('Error fetching test cases:', error);
    return [];
  }
};

// Enhanced normalization function that preserves exact format but handles line endings
const normalize = (str) => {
  if (!str) return '';
  // Only normalize line endings and trim trailing/leading whitespace
  return str
    .toString()
    .replace(/\r\n/g, '\n')  // Normalize Windows line endings
    .trim();
};

// Function to prepare input for the compiler
const prepareInput = (input) => {
  // Remove any formatting that might confuse the compiler
  return input.trim();
};

// Validate test cases before running code against them
const validateBeforeRunning = async (problemId) => {
  try {
    const validationResult = await validateTestCases(problemId);
    if (!validationResult.isValid) {
      console.warn(`Test cases for problem ${problemId} have validation issues:`, 
        validationResult.totalIssues, 'issues found');
      return validationResult;
    }
    return validationResult;
  } catch (error) {
    console.error('Error validating test cases:', error);
    return { isValid: false, error: error.message };
  }
};

// 2. Run code against all test cases using job queue
const runCodeAgainstTestCases = async (problemId, code, language = 'cpp') => {
  try {
    // First validate the test cases
    const validationResult = await validateBeforeRunning(problemId);
    if (!validationResult.isValid) {
      console.warn('Proceeding with invalid test cases, results may be unreliable');
    }
    
    // Fetch test cases
    const testCases = await fetchTestCases(problemId);
    console.log(`Fetched ${testCases.length} test cases for problem ${problemId}`);
    
    if (testCases.length === 0) {
      throw new Error('No test cases found for this problem');
    }
    
    const results = [];
    const timeLimit = 5; // 5 seconds time limit
    
    // Check if Bull queue is available
    const useQueue = typeof jobQueue !== 'undefined' && jobQueue !== null;
    
    // If queue is not available, process directly
    if (!useQueue) {
      console.log('Queue not available, processing test cases directly');
      
      // First check if code compiles at all (for compiled languages)
      if (language === 'cpp' || language === 'java') {
        try {
          console.log('Processing direct compilation check');
          const filePath = await generateFile(language, code);
          
          if (language === 'cpp') {
            await executeCpp(filePath, null, true); // compile only
          } else if (language === 'java') {
            await executeJava(filePath, null, true); // compile only
          }
        } catch (compileError) {
          console.error('Compilation error:', compileError.message);
          return testCases.map(testCase => ({
            input: testCase.input,
            expectedOutput: testCase.output,
            actualOutput: null,
            passed: false,
            status: "Compiler Error",
            error: compileError.message || "Compilation failed"
          }));
        }
      }
      
      // Process each test case directly
      for (const testCase of testCases) {
        try {
          const preparedInput = prepareInput(testCase.input);
          console.log(`Processing test case with input: ${preparedInput}`);
          
          const filePath = await generateFile(language, code);
          const inputPath = await generateInputFile(preparedInput);
          
          const start = moment(new Date());
          let output;
          
          if (language === "java") {
            output = await executeJava(filePath, inputPath);
          } else if (language === "python") {
            output = await executePython(filePath, inputPath);
          } else {
            output = await executeCpp(filePath, inputPath);
          }
          
          const end = moment(new Date());
          const executionTime = end.diff(start, "seconds", true);
          
          const expectedOutput = normalize(testCase.output);
          const actualOutput = normalize(output);
          
          let passed = expectedOutput === actualOutput;
          let status = passed ? "Accepted" : "Wrong Answer";
          
          // Check for TLE
          if (executionTime > timeLimit) {
            passed = false;
            status = "Time Limit Exceeded";
          }
          
          results.push({
            input: testCase.input,
            expectedOutput,
            actualOutput,
            passed,
            status,
            executionTime,
            error: null
          });
        } catch (error) {
          results.push({
            input: testCase.input,
            expectedOutput: testCase.output,
            actualOutput: null,
            passed: false,
            status: "Runtime Error",
            error: error.message || error.stderr || "Runtime error"
          });
        }
      }
      
      return results;
    }
    
    // Process each test case using the job queue
    const jobPromises = [];
    
    for (const testCase of testCases) {
      try {
        const preparedInput = prepareInput(testCase.input);
        console.log(`Processing test case with input: ${preparedInput}`);
        
        // Add job to queue
        const jobId = await addJobToQueue(code, language, preparedInput);
        const job = await jobQueue.getJob(jobId);
        
        // Create a promise that will resolve with the job result or reject after timeout
        const jobPromise = new Promise(async (resolve, reject) => {
          try {
            // Set a timeout based on the problem's time limit plus a small buffer
            const timeoutMs = (timeLimit * 1000) + 2000;
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Time Limit Exceeded")), timeoutMs)
            );
            
            // Wait for either job completion or timeout
            const result = await Promise.race([job.finished(), timeoutPromise]);
            resolve({ testCase, result });
          } catch (error) {
            reject({ testCase, error });
          }
        });
        
        jobPromises.push(jobPromise);
      } catch (error) {
        console.error('Error adding job to queue:', error);
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: null,
          passed: false,
          status: "System Error",
          error: error.message
        });
      }
    }
    
    // Wait for all jobs to complete
    const jobResults = await Promise.allSettled(jobPromises);
    
    // Process results
    for (const jobResult of jobResults) {
      if (jobResult.status === 'fulfilled') {
        const { testCase, result } = jobResult.value;
        
        if (!result.success) {
          // Runtime error
          results.push({
            input: testCase.input,
            expectedOutput: testCase.output,
            actualOutput: null,
            passed: false,
            status: "Runtime Error",
            error: result.error
          });
          continue;
        }
        
        const expectedOutput = normalize(testCase.output);
        const actualOutput = normalize(result.output);
        
        let passed = expectedOutput === actualOutput;
        let status = passed ? "Accepted" : "Wrong Answer";
        
        // Check for TLE
        if (result.executionTime > timeLimit) {
          passed = false;
          status = "Time Limit Exceeded";
        }
        
        results.push({
          input: testCase.input,
          expectedOutput,
          actualOutput,
          passed,
          status,
          executionTime: result.executionTime,
          error: null
        });
      } else {
        // Job failed or timed out
        const { testCase, error } = jobResult.reason;
        const isTimeLimit = error.message === "Time Limit Exceeded";
        
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: null,
          passed: false,
          status: isTimeLimit ? "Time Limit Exceeded" : "Runtime Error",
          error: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error running code against test cases:', error);
    throw error;
  }
};

// 3. Determine the overall verdict - ensure proper structure
const determineVerdict = (results, validationResult) => {
  if (!results || results.length === 0) {
    return {
      status: "Error",
      message: "No test cases were executed"
    };
  }
  
  // Log the results for debugging
  console.log('[DEBUG] Results for verdict determination:', 
    results.map(r => ({ status: r.status, passed: r.passed, error: r.error ? 'Has error' : 'No error' })));
  
  // Check if any test case failed
  const failedTestCase = results.find(r => !r.passed);
  
  if (failedTestCase) {
    // Return the status of the first failed test case
    return {
      status: failedTestCase.status,
      message: `Failed on test case: ${failedTestCase.input.substring(0, 50)}...`,
      details: failedTestCase.error || `Expected: ${failedTestCase.expectedOutput}, Got: ${failedTestCase.actualOutput}`
    };
  }
  
  // All test cases passed
  return {
    status: "Accepted",
    message: "All test cases passed",
    details: `Passed ${results.length} test cases`
  };
};

// 4. Main verdict function to be used by API endpoint
const getVerdict = async (problemId, code, language = 'cpp', submissionId = null) => {
  try {
    console.log(`[DEBUG] getVerdict called for problem ${problemId}, language ${language}, submissionId ${submissionId || 'null'}`);
    
    // If submissionId is provided, we should update the existing submission, not create a new one
    if (submissionId) {
      const Submission = mongoose.model('Submission');
      
      // First check if submission exists
      const existingSubmission = await Submission.findById(submissionId);
      
      if (!existingSubmission) {
        console.error(`[DEBUG] Submission ${submissionId} not found`);
        throw new Error(`Submission with ID ${submissionId} not found`);
      }
      
      // Update submission status to Processing
      await Submission.findByIdAndUpdate(
        submissionId,
        {
          'verdict.status': 'Processing',
          'verdict.message': 'Submission is being evaluated'
        }
      );
    }
    
    // First validate the test cases
    const validationResult = await validateBeforeRunning(problemId);
    
    // Run code against test cases using job queue
    const results = await runCodeAgainstTestCases(problemId, code, language);
    
    // Determine verdict
    const verdict = determineVerdict(results, validationResult);
    console.log(`[DEBUG] Verdict determined: ${verdict.status}`);
    
    // Update submission in database if submissionId is provided
    if (submissionId) {
      console.log(`[DEBUG] Updating submission ${submissionId} with verdict: ${verdict.status}`);
      const Submission = mongoose.model('Submission');
      try {
        const updatedSubmission = await Submission.findByIdAndUpdate(
          submissionId,
          {
            verdict: verdict,
            results: results,
            status: 'completed',
            completedAt: new Date()
          },
          { new: true }
        );
        
        console.log(`[DEBUG] Submission ${submissionId} updated successfully:`, 
          updatedSubmission ? `status=${updatedSubmission.status}` : 'Not found');
      } catch (updateError) {
        console.error(`[DEBUG] Error updating submission ${submissionId}:`, updateError);
        throw updateError;
      }
    }
    
    // Include validation info in the response
    return {
      verdict,
      results,
      testCaseValidation: validationResult ? {
        isValid: validationResult.isValid,
        issueCount: validationResult.totalIssues || 0
      } : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[DEBUG] Error in getVerdict:`, error);
    // If there's a submissionId, update the submission with the error
    if (submissionId) {
      const Submission = mongoose.model('Submission');
      await Submission.findByIdAndUpdate(submissionId, {
        'verdict.status': 'Error',
        'verdict.details': error.message || 'An error occurred during processing',
        status: 'error',
        completedAt: new Date()
      });
    }
    
    throw error;
  }
};

export { getVerdict };






