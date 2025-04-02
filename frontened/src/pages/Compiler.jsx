import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Compiler.css';
import toast from 'react-hot-toast';

function Compiler() {
  const { id } = useParams();
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
  cout << "Hello World";
  return 0;
}
`);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [problem, setProblem] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [language, setLanguage] = useState('cpp');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const url_2 = `${import.meta.env.VITE_BACKEND_2_URL}/crud`;
  const url_3 = import.meta.env.VITE_BACKEND_3_URL;

  // Add a new state to track if a submission has been made
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Add state for showing test case details
  const [showTestCaseDetails, setShowTestCaseDetails] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(null);

  // Add a function to show test case details
  const showFailedTestCase = () => {
    if (verdict && verdict.results && verdict.results.length > 0) {
      // Find the first failed test case
      const failedCase = verdict.results.find(r => !r.passed);
      if (failedCase) {
        setSelectedTestCase(failedCase);
        setShowTestCaseDetails(true);
      }
    }
  };

  // Add a template for Python code
  const codeTemplates = {
    cpp: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello World";
  return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
    python: `def main():
    print("Hello World")

if __name__ == "__main__":
    main()`
  };

  // Update language change handler
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(codeTemplates[newLanguage]);
  };

  useEffect(() => {
    // Log the environment variables to verify they're loaded correctly
    // console.log("Backend URLs:", {
    //   backend: import.meta.env.VITE_BACKEND_URL,
    //   backend2: import.meta.env.VITE_BACKEND_2_URL,
    //   backend3: import.meta.env.VITE_BACKEND_3_URL
    // });
    
    // Check if backend is accessible
    const checkBackendConnection = async () => {
      try {
        // Try to ping the backend
        await axios.get(`${url_3}/health`);
        console.log("Backend connection successful");
      } catch (error) {
        console.error("Backend connection failed:", error);
        // Show a toast notification about connection issues
        toast.error("Cannot connect to the code execution server. Please try again later.");
      }
    };
    
    checkBackendConnection();
    
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`${url_2}/getOne/${id}`);
        setProblem(response.data);
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    };

    fetchProblem();
  }, [id, url_2, url_3]);

  useEffect(() => {
    // Check if there's code to view from a submission
    const viewCode = localStorage.getItem('viewSubmissionCode');
    const viewLanguage = localStorage.getItem('viewSubmissionLanguage');
    
    if (viewCode) {
      // Set the code and language
      setCode(viewCode);
      if (viewLanguage) {
        setLanguage(viewLanguage);
      }
      
      // Clear the localStorage items to prevent reloading on future visits
      localStorage.removeItem('viewSubmissionCode');
      localStorage.removeItem('viewSubmissionLanguage');
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setOutput("");
    
    try {
      // console.log("Submitting payload:", { language, code, input });
      
      // Use the /run endpoint
      const response = await axios.post(`${url_3}/run`, {
        language,
        code,
        input
      });
      
      // console.log("Response:", response.data);
      
      if (response.data.success) {
        setOutput(response.data.output);
        setExecutionTime(response.data.executionTime || 0);
      } else {
        setOutput(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error running the code:", error);
      setOutput(`Error running the code: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    autoResizeTextarea(inputRef.current);
  };

  const autoResizeTextarea = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Update the submitCode function to not include authentication
  const handleFinal = async () => {
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      // Show a loading toast that will be dismissed when result arrives
      const loadingToastId = toast.loading("Submitting your solution...");
      
      // Change from verdict endpoint to submit endpoint
      const submitUrl = `${url_3}/submit`;
      
      const response = await axios.post(
        submitUrl,
        {
          language: language,
          code: code,
          problemId: problem?._id || 'development',
          problemTitle: problem?.title || 'Development Problem'
        }
      );
      
      // Dismiss the loading toast
      toast.dismiss(loadingToastId);
      
      if (response.data.success) {
        const receivedVerdict = response.data.result?.verdict || { status: "Processing" };
        setVerdict(receivedVerdict);
        
        // Set hasSubmitted to true on successful submission
        setHasSubmitted(true);
        
        if (response.data.warning) {
          toast.warning(response.data.warning);
        }
        
        toast.success("Solution submitted successfully!");
      } else {
        setVerdict({ 
          status: "Error", 
          message: response.data.error || "Unknown error occurred" 
        });
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast.error("Failed to submit solution: " + (error.message || "Unknown error"));
      
      // If we're in development mode, create a mock verdict
      if (process.env.NODE_ENV === 'development') {
        console.log("Creating mock verdict for development due to error");
        
        const mockVerdict = {
          status: "Wrong Answer",
          message: "Development mode: Mock verdict provided due to error.",
          time: 100,
          memory: 5000,
          results: [
            {
              status: "Wrong Answer",
              input: "",
              expectedOutput: "Hello World",
              actualOutput: "Different output",
              time: 100,
              memory: 5000
            }
          ]
        };
        
        setVerdict(mockVerdict);
        toast.warning("Development mode: Using mock verdict due to error.");
        setHasSubmitted(true);
        
        // Save mock submission to localStorage for history
        const submissionHistory = JSON.parse(localStorage.getItem('submissionHistory') || '[]');
        const newSubmission = {
          id: Date.now(),
          problemId: problem?._id || 'development',
          problemTitle: problem?.title || 'Development Problem',
          language: language,
          code: code,
          verdict: mockVerdict.status,
          timestamp: new Date().toISOString(),
        };
        
        submissionHistory.push(newSubmission);
        localStorage.setItem('submissionHistory', JSON.stringify(submissionHistory));
        
        return;
      }
      
      setVerdict({
        status: "Error",
        message: error.response?.data?.error || error.message || "Unknown error occurred"
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    autoResizeTextarea(inputRef.current);
  }, [input]);

  // Update the getVerdictStatus function to better detect compilation errors
  const getVerdictStatus = () => {
    if (!verdict) return '';
    
    // If we have results, determine status based on all test cases
    if (verdict.results && verdict.results.length > 0) {
      const allPassed = verdict.results.every(r => 
        r.status === 'Accepted' || r.passed === true
      );
      return allPassed ? 'accepted' : 'wrong-answer';
    }
    
    if (typeof verdict.status === 'string') {
      const status = verdict.status.toLowerCase();
      if (status.includes('compilation') || status.includes('compiler')) return 'compilation-error';
      if (status.includes('wrong')) return 'wrong-answer';
      if (status.includes('accept')) return 'accepted';
      if (status.includes('time limit')) return 'time-limit-exceeded';
      if (status.includes('error')) return 'error';
    }
    return '';
  };

  return (
    <div className="compiler-page">
      <div className="problem-container">
        {problem ? (
          <>
            <div className="problem-header">
              <h1 className="problem-title">{problem.title}</h1>
              <span className={`problem-difficulty ${problem.difficulty?.toLowerCase() || 'medium'}`}>
                {problem.difficulty || 'Medium'}
              </span>
            </div>
            <p className="problem-description">{problem.description}</p>
          </>
        ) : (
          <div className="loading"></div>
        )}
      </div>
      <div className="compiler-container">
        <div className="editor" data-language={language}>
          <div className="editor-header">
            <h2>Code Editor</h2>
            <select 
              className="select-box"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value='cpp'>C++</option>
              <option value='java'>Java</option>
              <option value='python'>Python</option>
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
          />
        </div>
        <div className="input-output">
          <div className="io-header">
            <h2>Input & Output</h2>
          </div>
          <textarea
            ref={inputRef}
            className="input"
            placeholder="Custom Input (optional)"
            value={input}
            onChange={handleInputChange}
          />
          <button onClick={handleSubmit}>Run Code</button>
          <textarea
            className="output"
            value={output}
            readOnly
            placeholder='Output will display here'
          />
          <div className="button-group">
            <button 
              className={`submit-btn ${isSubmitting ? 'loading' : ''}`} 
              onClick={handleFinal}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  <span>Submitting...</span>
                </>
              ) : (
                "Submit Solution"
              )}
            </button>
            
            {hasSubmitted && (
              <button 
                className="submissions-btn"
                onClick={() => navigate('/result')}
              >
                View Submissions
              </button>
            )}
          </div>
          {verdict && (
            <div className="verdict-container">
              <h3>Verdict</h3>
              <div className={`verdict-details ${getVerdictStatus()}`}>
                <p className="font-medium"><strong>Status:</strong> {verdict.status || 'Processing'}</p>
                {/* {verdict.message && <p><strong>Message:</strong> {verdict.message}</p>} */}
                {verdict.time && <p><strong>Time:</strong> {verdict.time} ms</p>}
                {verdict.memory && <p><strong>Memory:</strong> {verdict.memory} KB</p>}
                
                {/* Add button to show test case details if there's a failed test case */}
                {verdict.status !== 'Accepted' && verdict.results && verdict.results.some(r => !r.passed) && (
                  <button 
                    className="view-testcase-btn" 
                    onClick={showFailedTestCase}
                  >
                    View Failed Test Case
                  </button>
                )}
              </div>
              
              {/* Test case details modal/section */}
              {showTestCaseDetails && selectedTestCase && (
                <div className="test-case-details">
                  <div className="test-case-header">
                    <h4>Failed Test Case Details</h4>
                    <button 
                      className="close-btn"
                      onClick={() => setShowTestCaseDetails(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="test-case-content">
                    <div className="test-case-section">
                      <h5>Input:</h5>
                      <pre>{selectedTestCase.input}</pre>
                    </div>
                    <div className="test-case-section">
                      <h5>Expected Output:</h5>
                      <pre>{selectedTestCase.expectedOutput}</pre>
                    </div>
                    <div className="test-case-section">
                      <h5>Your Output:</h5>
                      <pre>{selectedTestCase.actualOutput}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Compiler;






