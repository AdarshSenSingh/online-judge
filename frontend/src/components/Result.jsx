import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Result = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [problemsMap, setProblemsMap] = useState({});
  const navigate = useNavigate();
  
  const url_2 = import.meta.env.VITE_BACKEND_2_URL || 'http://localhost:2000';
  const url_3 = import.meta.env.VITE_BACKEND_3_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchSubmissions();
    fetchProblems();
  }, []);

  // Add this function to test different endpoints
  const testEndpoints = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    console.log("Testing different endpoints...");
    
    // Test endpoints
    const endpoints = [
      '/submissions',
      '/api/submissions',
      '/test/all-submissions'  // This is an open endpoint from your backend
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${url_3}${endpoint}`);
        const response = await axios.get(`${url_3}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`Success for ${endpoint}:`, response.status);
        return endpoint; // Return the first working endpoint
      } catch (error) {
        console.error(`Failed for ${endpoint}:`, error.response?.status, error.response?.data);
      }
    }
    
    return null;
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching all submissions");
      
      // Simple request without authentication
      const response = await axios.get(`${url_3}/submissions`);
      
      console.log("Submissions response:", response.data);
      
      if (Array.isArray(response.data)) {
        setSubmissions(response.data);
      } else if (response.data.submissions && Array.isArray(response.data.submissions)) {
        setSubmissions(response.data.submissions);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      try {
        const response = await axios.get(`${url_2}/crud/getAll`);
        const problems = {};
        response.data.forEach(problem => {
          problems[problem._id] = problem.title || 'Unknown Problem';
        });
        setProblemsMap(problems);
      } catch (firstError) {
        console.log("First attempt failed, trying alternative endpoint");
        const response = await axios.get(`${url_3}/problems`);
        const problems = {};
        response.data.forEach(problem => {
          problems[problem._id] = problem.title || 'Unknown Problem';
        });
        setProblemsMap(problems);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const viewSubmission = (submission) => {
    localStorage.setItem('viewSubmissionCode', submission.code);
    localStorage.setItem('viewSubmissionLanguage', submission.language);
    navigate(`/compiler/${submission.problemId}`);
  };

  return (
    <div className="result-container">
      <h2>Your Submissions</h2>
      
      {loading ? (
        <p>Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p>No submissions found. Try solving some problems!</p>
      ) : (
        <div className="submissions-list">
          {submissions.map(submission => (
            <div key={submission._id} className="submission-card">
              <h3>{problemsMap[submission.problemId] || submission.problemTitle || 'Unknown Problem'}</h3>
              <div className="submission-details">
                <p>Language: {submission.language}</p>
                <p>Status: <span className={`status-${submission.verdict?.status?.toLowerCase()}`}>
                  {submission.verdict?.status || 'Processing'}
                </span></p>
                <p>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
              </div>
              <button onClick={() => viewSubmission(submission)}>View Code</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Result;














