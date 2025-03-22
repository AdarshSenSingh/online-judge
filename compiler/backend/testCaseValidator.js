import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateFile } from './generateFile.js';
import { generateInputFile } from './generateInputFile.js';
import { executeCpp } from './executeCpp.js';
import { executeJava } from './executeJava.js';
import { executePython } from './executePython.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate a single test case
const validateTestCase = async (testCase, index) => {
  const { input, output } = testCase;
  const issues = [];
  
  // Check if input and output are defined
  if (!input) issues.push(`Test case #${index}: Input is missing`);
  if (!output) issues.push(`Test case #${index}: Output is missing`);
  
  // Check for common formatting issues
  if (input && typeof input === 'string') {
    if (input.includes('\t')) issues.push(`Test case #${index}: Input contains tab characters`);
    if (input.startsWith(' ') || input.endsWith(' ')) 
      issues.push(`Test case #${index}: Input has leading/trailing spaces`);
  }
  
  if (output && typeof output === 'string') {
    if (output.includes('\t')) issues.push(`Test case #${index}: Output contains tab characters`);
    if (output.startsWith(' ') || output.endsWith(' ')) 
      issues.push(`Test case #${index}: Output has leading/trailing spaces`);
  }
  
  return {
    testCase,
    index,
    issues,
    isValid: issues.length === 0
  };
};

// Validate test cases for a problem
export const validateTestCases = async (problemId) => {
  try {
    // Fetch test cases from CRUD backend
    const response = await axios.get(`${process.env.CRUD_URL || 'http://localhost:2000'}/crud/getOne/${problemId}`);
    const problem = response.data;
    const testCases = problem.testCases || [];
    
    console.log(`Validating ${testCases.length} test cases for problem ${problemId}: ${problem.title}`);
    
    // Validate each test case
    const validationResults = await Promise.all(
      testCases.map((testCase, index) => validateTestCase(testCase, index + 1))
    );
    
    // Count issues
    const invalidTestCases = validationResults.filter(result => !result.isValid);
    const totalIssues = validationResults.reduce((sum, result) => sum + result.issues.length, 0);
    
    return {
      problemId,
      problemTitle: problem.title,
      testCaseCount: testCases.length,
      invalidTestCaseCount: invalidTestCases.length,
      totalIssues,
      validationResults,
      isValid: invalidTestCases.length === 0
    };
  } catch (error) {
    console.error(`Error validating test cases for problem ${problemId}:`, error);
    return {
      problemId,
      error: error.message,
      isValid: false
    };
  }
};

// Test a solution against test cases
export const testSolution = async (problemId, language, code) => {
  try {
    const testCases = await fetchTestCases(problemId);
    if (!testCases || testCases.length === 0) {
      return { error: "No test cases found for this problem" };
    }
    
    const results = [];
    
    for (const testCase of testCases) {
      try {
        const filePath = await generateFile(language, code);
        const inputPath = await generateInputFile(testCase.input);
        
        let output;
        if (language === 'java') {
          output = await executeJava(filePath, inputPath);
        } else if (language === 'python') {
          output = await executePython(filePath, inputPath);
        } else {
          output = await executeCpp(filePath, inputPath);
        }
        
        const expectedOutput = normalize(testCase.output);
        const actualOutput = normalize(output);
        
        results.push({
          input: testCase.input,
          expectedOutput,
          actualOutput,
          passed: expectedOutput === actualOutput
        });
      } catch (error) {
        results.push({
          input: testCase.input,
          error: error.message || "Execution error"
        });
      }
    }
    
    return {
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => r.passed === false).length,
        errors: results.filter(r => r.error).length
      }
    };
  } catch (error) {
    return { error: error.message || "Error testing solution" };
  }
};

// If this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2];
  const problemId = process.argv[3];
  
  if (!problemId) {
    console.error('Problem ID is required');
    process.exit(1);
  }
  
  if (command === 'validate') {
    validateTestCases(problemId).then(result => {
      console.log(JSON.stringify(result, null, 2));
      if (!result.isValid) process.exit(1);
    });
  } else if (command === 'test') {
    const language = process.argv[4] || 'cpp';
    const codePath = process.argv[5];
    
    if (!codePath) {
      console.error('Code path is required');
      process.exit(1);
    }
    
    fs.readFile(codePath, 'utf8')
      .then(code => testSolution(problemId, language, code))
      .then(result => {
        console.log(JSON.stringify(result, null, 2));
        if (result.passedCount !== result.testCaseCount) process.exit(1);
      });
  } else {
    console.error('Unknown command. Use "validate" or "test"');
    process.exit(1);
  }
}