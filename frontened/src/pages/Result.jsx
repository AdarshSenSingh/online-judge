
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Result.css';
import { toast } from 'react-hot-toast';
// Import the environment variable
const url_3 = import.meta.env.VITE_BACKEND_3_URL;

const Result = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [submissionsPerPage] = useState(10);
  // Add sorting state
  const [sortOrder, setSortOrder] = useState('newest');
  // Add problems map state
  const [problemsMap, setProblemsMap] = useState({});
  // Add submission loading state
  const [submissionLoading, setSubmissionLoading] = useState({});

  const navigate = useNavigate();

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token) {
        console.log("No token found, redirecting to login");
        navigate('/login');
        return;
      }
      
      // Log the token format for debugging
      console.log("Token being used:", token.substring(0, 10) + "...");
      console.log("User ID being used:", userId);
      
      // Request submissions from the correct endpoint
      const response = await axios.get(`${url_3}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 100,
          skip: 0,
          userId: userId // Add userId as a query parameter as well
        }
      });
      
      console.log("Submissions response:", response.data);
      
      const submissionsData = response.data.submissions || response.data;
      
      if (Array.isArray(submissionsData) && submissionsData.length > 0) {
        console.log("Processing submissions data:", submissionsData);
        // Create a map using submissionId as key to identify unique submissions
        const uniqueSubmissions = {};
        
        submissionsData.forEach(sub => {
          // Ensure each submission has a properly formatted verdict
          const processedSub = {
            ...sub,
            verdict: !sub.verdict ? { status: 'Processing' } :
                     typeof sub.verdict === 'string' ? { status: sub.verdict } :
                     sub.verdict
          };
          
          // Use _id as the unique key
          uniqueSubmissions[sub._id] = processedSub;
        });
        
        // Convert the object to an array
        setSubmissions(Object.values(uniqueSubmissions));
        console.log("Set submissions:", Object.values(uniqueSubmissions).length);
      } else {
        console.log("No submissions found in response");
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      
      // If unauthorized, try to refresh token or redirect to login
      if (error.response && error.response.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        // Wait a moment before redirecting
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 2000);
      } else {
        // Show a more specific error message
        toast.error(`Failed to fetch submissions: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Backend URL being used:", url_3);
    console.log("User ID from localStorage:", localStorage.getItem('userId'));
    console.log("Token exists:", !!localStorage.getItem('token'));

    fetchSubmissions();
    
    // Set up polling for submissions in processing state
    const pollingInterval = setInterval(() => {
      // Check if we have any submissions in processing state
      if (submissions.some(sub => 
          sub.verdict?.status === 'Processing' || 
          sub.status === 'pending')) {
        console.log("Polling for updates on processing submissions");
        fetchSubmissions();
      }
    }, 3000); // Poll every 3 seconds
    
    // Clear the refresh flag if it exists
    if (localStorage.getItem('refreshSubmissions') === 'true') {
      localStorage.removeItem('refreshSubmissions');
      fetchSubmissions();
    }
    
    // Set up an interval to check for the refresh flag
    const refreshInterval = setInterval(() => {
      if (localStorage.getItem('refreshSubmissions') === 'true') {
        console.log("Refresh flag detected, fetching new submissions");
        localStorage.removeItem('refreshSubmissions');
        fetchSubmissions();
      }
    }, 2000); // Check every 2 seconds
    
    return () => {
      clearInterval(pollingInterval);
      clearInterval(refreshInterval);
    }; // Clean up on unmount
  }, [navigate]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        // Try the CRUD backend URL first
        try {
          const problemsUrl = import.meta.env.VITE_BACKEND_2_URL;
          const response = await axios.get(`${problemsUrl}/crud/getAll`);
          const problems = {};
          response.data.forEach(problem => {
            problems[problem._id] = problem.title || 'Unknown Problem';
          });
          setProblemsMap(problems);
          console.log("Problems map:", problems);
        } catch (firstError) {
          console.log("First attempt failed, trying alternative endpoint");
          // If that fails, try the compiler service URL
          const response = await axios.get(`${url_3}/problems`);
          const problems = {};
          response.data.forEach(problem => {
            problems[problem._id] = problem.title || 'Unknown Problem';
          });
          setProblemsMap(problems);
          console.log("Problems map from alternative endpoint:", problems);
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        toast.error("Failed to load problem details");
        // Set a fallback map with unknown problems
        setProblemsMap({});
      }
    };

    fetchProblems();
  }, [url_3]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Sort submissions based on selected criteria
  const sortedSubmissions = [...submissions].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.submittedAt || a.createdAt);
    const dateB = new Date(b.timestamp || b.submittedAt || b.createdAt);
    
    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else if (sortOrder === 'oldest') {
      return dateA - dateB;
    }
    
    // For verdict-based sorting
    const verdictA = a.verdict?.status || '';
    const verdictB = b.verdict?.status || '';
    
    if (sortOrder === 'accepted') {
      // Put Accepted at the top
      if (verdictA === 'Accepted' && verdictB !== 'Accepted') return -1;
      if (verdictA !== 'Accepted' && verdictB === 'Accepted') return 1;
      return dateB - dateA; // If both are accepted or not accepted, sort by date
    } else if (sortOrder === 'wrong') {
      // Put Wrong Answer at the top
      if (verdictA === 'Wrong Answer' && verdictB !== 'Wrong Answer') return -1;
      if (verdictA !== 'Wrong Answer' && verdictB === 'Wrong Answer') return 1;
      return dateB - dateA; // If both are wrong or not wrong, sort by date
    }
    
    return 0;
  });

  // Filter submissions based on sort order
  const filteredSubmissions = sortOrder === 'accepted' 
    ? sortedSubmissions.filter(sub => sub.verdict?.status === 'Accepted')
    : sortOrder === 'wrong'
    ? sortedSubmissions.filter(sub => sub.verdict?.status === 'Wrong Answer')
    : sortedSubmissions;

  // Get current submissions for pagination
  const indexOfLastSubmission = currentPage * submissionsPerPage;
  const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
  const currentSubmissions = filteredSubmissions.slice(indexOfFirstSubmission, indexOfLastSubmission);
  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);

  // Change page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortOrder(value);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setLoading(true);
    fetchSubmissions();
  };

  // Add this function before the return statement
  const handleRetry = async (problemId) => {
    navigate(`/compiler/${problemId}`);
  };

  return (
    <div className="submission-history-page">
      <div className="submission-header">
        <h1><span>Submission History</span></h1>
        <div className="header-buttons">
          <button 
            onClick={handleRefresh}
            className="refresh-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
          <button 
            onClick={() => navigate('/problems')} 
            className="back-button"
          >
            Back to Problems
          </button>
        </div>
      </div>
      
      {/* Sort controls */}
      <div className="sort-controls">
        <label htmlFor="submission-sort" className="sort-label">Sort by:</label>
        <select 
          id="submission-sort"
          className="sort-select"
          value={sortOrder}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="accepted">Accepted Solutions</option>
          <option value="wrong">Wrong Answers</option>
        </select>
      </div>

      {/* Submission History Table */}
      <div className="submission-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <p>No previous submissions found.</p>
            <button 
              onClick={() => navigate('/problems')} 
              className="action-button primary"
            >
              Solve Problems
            </button>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="empty-state">
            <p>No submissions found matching the selected filter.</p>
            <button 
              onClick={() => setSortOrder('newest')} 
              className="action-button primary"
            >
              Show All Submissions
            </button>
          </div>
        ) : (
          <>
            <table className="submission-table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Status</th>
                  <th>Verdict</th>
                  <th>Submission Time</th>
                  <th>Language</th>
                  <th>Problem ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSubmissions.map((submission, index) => {
                  console.log("Processing submission:", submission);
                  console.log("Verdict:", submission.verdict);
                  
                  // Safely access problemsMap
                  const problemId = submission.problemId;
                  const problemTitle = (problemsMap && problemsMap[problemId]) 
                    ? problemsMap[problemId] 
                    : (submission.problemTitle || 'Unknown Problem');
                  
                  // Determine verdict status safely
                  let verdictStatus = 'Processing';
                  if (submission.verdict) {
                    if (typeof submission.verdict === 'string') {
                      verdictStatus = submission.verdict;
                    } else if (submission.verdict.status) {
                      verdictStatus = submission.verdict.status;
                    }
                  }
                  
                  return (
                    <tr key={submission._id || index}>
                      <td>
                        <div className="problem-title">{problemTitle}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${verdictStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                          {verdictStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`verdict-badge ${verdictStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                          {verdictStatus === 'Accepted' ? 'AC' : 
                           verdictStatus === 'Wrong Answer' ? 'WA' :
                           verdictStatus === 'Compilation Error' ? 'CE' :
                           verdictStatus === 'Compiler Error' ? 'CE' :
                           verdictStatus === 'Time Limit Exceeded' ? 'TLE' :
                           verdictStatus === 'Runtime Error' ? 'RE' :
                           verdictStatus === 'In Queue' ? 'IQ' :
                           verdictStatus || 'Processing'}
                        </span>
                      </td>
                      <td>
                        {formatDate(submission.timestamp || submission.submittedAt || submission.createdAt)}
                      </td>
                      <td>
                        <span className="language-badge">
                          {submission.language}
                        </span>
                      </td>
                      <td>
                        {submission.problemId}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {submissionLoading[submission._id] ? (
                            <div className="loading-spinner small"></div>
                          ) : (
                            <button 
                              onClick={() => {
                                setSubmissionLoading(prev => ({...prev, [submission._id]: true}));
                                handleRetry(submission.problemId);
                              }}
                              className="action-button retry"
                              title="Try Again"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {filteredSubmissions.length > submissionsPerPage && (
              <div className="pagination-controls">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  &laquo; Previous
                </button>
                
                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Result;


































