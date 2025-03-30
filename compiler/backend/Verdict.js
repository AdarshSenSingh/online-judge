import axios from 'axios';
import { validateTestCases } from './testCaseValidator.js';
import moment from 'moment';
import { addJobToQueue, jobQueue } from './jobQueue.js';
import mongoose from 'mongoose';
import { generateFile } from './generateFile.js';
import { generateInputFile } from './generateInputFile.js';
import { executeCpp } from './executeCpp.js';
import { executeJava } from './executeJava.js';
import { executePython } from './executePython.js';
import { CRUD_URL } from './config.js';

// Define timeLimit if it's not already defined
const timeLimit = 5; // 5 seconds time limit

// Helper function to normalize output for comparison
const normalize = (output) => {
  return output.replace(/\r\n/g, '\n').trim();
};

// Helper function to prepare input
const prepareInput = (input) => {
  return input.trim();
};

// 1. Fetch test cases from the crud backend
const fetchTestCases = async (problemId) => {
  const MAX_RETRIES = 3;
  let retries = 0;
  
  // Try multiple CRUD URLs
  const possibleCrudUrls = [
    CRUD_URL,
    'http://localhost:2000',
    process.env.BACKEND_2_URL || 'http://localhost:2000'
  ];
  
  while (retries < MAX_RETRIES) {
    // Try each URL
    for (const baseUrl of possibleCrudUrls) {
      try {
        console.log(`Fetching test cases from ${baseUrl} for problem ID: ${problemId} (attempt ${retries + 1})`);
        
        const endpoint = `${baseUrl}/crud/getOne/${problemId}`;
        console.log(`Making request to: ${endpoint}`);
        
        const response = await axios.get(endpoint, {
          timeout: 5000, // 5 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.data) {
          console.error(`No data returned for problem ID: ${problemId}`);
          continue; // Try next URL
        }
        
        console.log(`Problem data received from ${baseUrl}`);
        
        if (!response.data.testCases || response.data.testCases.length === 0) {
          console.error(`No test cases found for problem ID: ${problemId}`);
          continue; // Try next URL
        }
        
        console.log(`Successfully fetched ${response.data.testCases.length} test cases from ${baseUrl}`);
        return response.data.testCases;
      } catch (error) {
        console.error(`Error fetching test cases from ${baseUrl}:`, error.message);
      }
    }
    
    // If we get here, all URLs failed for this retry
    retries++;
    if (retries < MAX_RETRIES) {
      console.log(`All URLs failed, retrying (${retries}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
  
  // If we get here, all retries failed
  console.error(`Failed to fetch test cases after ${MAX_RETRIES} retries`);
  
  // Return empty array as fallback
  return [];
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
    
    // Check if Redis is available
    const skipRedis = process.env.SKIP_REDIS === 'TRUE';
    
    // Always process directly for now to ensure functionality
    console.log('Processing test cases directly');
    
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
          expectedOutput: testCase.output,
          actualOutput: output,
          passed,
          status,
          executionTime
        });
      } catch (error) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: null,
          passed: false,
          status: "Runtime Error",
          error: error.message || "Error executing code"
        });
      }
    }
    
    // Make sure we're returning an array of results
    console.log(`Returning ${results.length} test case results`);
    return results;
  } catch (error) {
    console.error(`Error running code against test cases:`, error);
    // Return a single error result instead of throwing
    return [{
      input: "Error occurred before test cases could be run",
      expectedOutput: "",
      actualOutput: "",
      passed: false,
      status: "System Error",
      error: error.message || "Error running test cases"
    }];
  }
};

// 3. Determine the overall verdict - ensure proper structure
const determineVerdict = (results) => {
  console.log(`Determining verdict from ${results.length} test case results`);
  
  // Check if any test case failed
  const failedTestCase = results.find(r => !r.passed);
  
  if (failedTestCase) {
    // Return the status of the first failed test case
    return {
      status: failedTestCase.status,
      message: `Failed on test case: ${failedTestCase.input.substring(0, 50)}...`,
      details: failedTestCase.error || `Expected: ${failedTestCase.expectedOutput}, Got: ${failedTestCase.actualOutput}`,
      results: results  // Include all results
    };
  }
  
  // All test cases passed
  return {
    status: "Accepted",
    message: "All test cases passed",
    details: `Passed ${results.length} test cases`,
    results: results  // Include all results
  };
};

// Add a function to create mock test cases when needed
const createMockTestCases = () => {
  return [
    {
      input: "",
      output: "Hello World",
      explanation: "Basic test case"
    }
  ];
};

// 4. Main verdict function to be used by API endpoint
const getVerdict = async (problemId, code, language = 'cpp', submissionId = null) => {
  console.log(`[DEBUG] Getting verdict for problem: ${problemId}, language: ${language}`);
  
  try {
    // Try to fetch test cases
    let testCases;
    try {
      testCases = await fetchTestCases(problemId);
    } catch (fetchError) {
      console.error(`Error fetching test cases:`, fetchError);
      testCases = [];
    }
    
    // If no test cases were found, use mock test cases in development
    if (!testCases || testCases.length === 0) {
      console.log(`No test cases found, using mock test cases for development`);
      testCases = createMockTestCases();
    }
    
    // If submissionId is provided, we should update the existing submission
    if (submissionId) {
      try {
        const Submission = mongoose.model('Submission');
        
        // Update submission status to Processing
        await Submission.findByIdAndUpdate(
          submissionId,
          {
            'verdict.status': 'Processing',
            'verdict.message': 'Submission is being evaluated'
          }
        );
        console.log(`[DEBUG] Updated submission ${submissionId} to Processing status`);
      } catch (updateError) {
        console.error(`Error updating submission ${submissionId} to Processing:`, updateError);
        // Continue processing even if update fails
      }
    }
    
    // Run code against test cases
    console.log(`[DEBUG] Running code against test cases for problem ${problemId}`);
    const results = await runCodeAgainstTestCases(problemId, code, language);
    console.log(`[DEBUG] Received ${results.length} test case results`);
    
    // Determine verdict
    const verdict = determineVerdict(results);
    console.log(`[DEBUG] Verdict determined: ${verdict.status}`);
    
    // Update submission in database if submissionId is provided
    if (submissionId) {
      try {
        const Submission = mongoose.model('Submission');
        const updateResult = await Submission.findByIdAndUpdate(
          submissionId,
          {
            verdict: verdict,
            results: results,
            status: 'completed',
            completedAt: new Date()
          },
          { new: true } // Return the updated document
        );
        console.log(`[DEBUG] Updated submission ${submissionId} with verdict: ${JSON.stringify(verdict)}`);
        console.log(`[DEBUG] Update result: ${updateResult ? 'Success' : 'Failed'}`);
      } catch (updateError) {
        console.error(`Error updating submission ${submissionId} with verdict:`, updateError);
      }
    }
    
    return {
      verdict,
      results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[DEBUG] Error in getVerdict:`, error);
    // If there's a submissionId, update the submission with the error
    if (submissionId) {
      try {
        const Submission = mongoose.model('Submission');
        await Submission.findByIdAndUpdate(submissionId, {
          verdict: {
            status: 'Error',
            message: error.message || 'An error occurred during processing',
            details: error.stack
          },
          status: 'error',
          completedAt: new Date()
        });
        console.log(`[DEBUG] Updated submission ${submissionId} with error status`);
      } catch (updateError) {
        console.error(`Error updating submission ${submissionId} with error:`, updateError);
      }
    }
    
    throw error;
  }
};

export { getVerdict };








