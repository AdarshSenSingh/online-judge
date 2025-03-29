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
  const [executionTime, setExecutionTime] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const url_2 = `${import.meta.env.VITE_BACKEND_2_URL}/crud`;
  const url_3 = `${import.meta.env.VITE_BACKEND_3_URL}`;

  // Add a new state to track if a submission has been made
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
    console.log("Backend URLs:", {
      backend: import.meta.env.VITE_BACKEND_URL,
      backend2: import.meta.env.VITE_BACKEND_2_URL,
      backend3: import.meta.env.VITE_BACKEND_3_URL
    });
    
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
      console.log("Submitting payload:", { language, code, input });
      
      // Use the /run endpoint
      const response = await axios.post(`${url_3}/run`, {
        language,
        code,
        input
      });
      
      console.log("Response:", response.data);
      
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

  // Update the handleFinal function to correctly handle the verdict
  const handleFinal = async () => {
    try {
      setLoading(true);
      setVerdict(null);
      
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      
      // Use the environment variable with the correct URL
      const verdictUrl = `${url_3}/verdict/${problem._id}`;
      console.log("Calling verdict endpoint:", verdictUrl);
      console.log("Token available:", !!token);
      
      // First check if the server is reachable
      try {
        await axios.get(`${url_3}/health`);
      } catch (connectionError) {
        throw new Error("Cannot connect to the code execution server. Please check your connection and try again.");
      }
      
      // Remove the Authorization header for now
      const response = await axios.post(
        verdictUrl,
        {
          language: language,
          code: code,
        }
        // Remove the headers object completely
      );
      
      console.log("Submission response:", response.data);
      
      if (response.data.success && response.data.result) {
        // Extract the verdict from the response
        const verdictData = response.data.result.verdict;
        console.log("Verdict data:", verdictData);
        
        // Set the verdict state
        setVerdict(verdictData);
        console.log("Setting verdict to:", verdictData);
        
        // Set hasSubmitted to true
        setHasSubmitted(true);
        
        // Set a flag to refresh submissions on the result page
        localStorage.setItem('refreshSubmissions', 'true');
        
        // Check if the submissions server is reachable before redirecting
        try {
          // Update this URL to match the correct port for your submissions service
          const submissionsUrl = `${url_3}/health`;
          await axios.get(submissionsUrl);
          
          // Only navigate if the submissions server is reachable
          setTimeout(() => {
            navigate('/result');
          }, 5);
        } catch (error) {
          console.log("Submissions server not reachable, showing verdict on this page");
          toast.success("Submission successful! Verdict is shown below.");
          // Display the verdict on this page instead
        }
      } else {
        const errorVerdict = {
          status: "Error",
          message: response.data.error || "Unknown error",
          results: []
        };
        setVerdict(errorVerdict);
        console.log("Setting error verdict:", errorVerdict);
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      const errorVerdict = {
        status: "Error",
        message: error.message || "Network error. Please check your connection.",
        results: []
      };
      setVerdict(errorVerdict);
      toast.error(error.message || "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    autoResizeTextarea(inputRef.current);
  }, [input]);

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
            <button className="submit-btn" onClick={handleFinal}>Submit Solution</button>
            <button 
              className="debug-btn" 
              onClick={async () => {
                try {
                  const debugUrl = `${url_3}/debug-execution/${problem?._id}`;
                  toast.loading("Debugging execution...", { id: "debug" });
                  const response = await axios.post(debugUrl, {
                    language: language,
                    code: code
                  });
                  toast.dismiss("debug");
                  console.log("Debug results:", response.data);
                  toast.success("Debug info logged to console", { duration: 3000 });
                } catch (error) {
                  toast.dismiss("debug");
                  toast.error(`Debug error: ${error.message}`, { duration: 3000 });
                  console.error("Debug error:", error);
                }
              }}
            >
              Debug Execution
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
            <div className={`verdict-container ${verdict.status.toLowerCase().replace(/\s+/g, '-')}`}>
              <h3>Verdict: {verdict.status}</h3>
              <p>{verdict.message}</p>
              {verdict.details && <p className="verdict-details">{verdict.details}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Compiler;






















