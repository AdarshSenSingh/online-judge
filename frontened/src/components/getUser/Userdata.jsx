import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Userdata.css';

const Userdata = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage] = useState(5);
  // Add sorting state
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'easiest', 'hardest'

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const url_2 = import.meta.env.VITE_BACKEND_2_URL;
        const response = await axios.get(`${url_2}/crud/getAll`);
        setProblems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Sort problems based on difficulty
  const sortedProblems = [...problems].sort((a, b) => {
    if (sortOrder === 'default') return 0; // No sorting
    
    const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
    const diffA = difficultyOrder[a.difficulty.toLowerCase()];
    const diffB = difficultyOrder[b.difficulty.toLowerCase()];
    
    return sortOrder === 'easiest' ? diffA - diffB : diffB - diffA;
  });

  // Handle sort change
  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Calculate pagination values
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = sortedProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(sortedProblems.length / problemsPerPage);

  // Change page
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className='problems-page'>
      <div className='problems-header'>
        <h1>Practice Problems</h1>
        <div className="problem-actions-container">
          <Link to={'/add'} className='add-problem-button'>
            <span className="add-icon">+</span> Add New Problem
          </Link>
          <Link to={'/result'} className='history-button'>
            <span className="history-icon">📋</span> View Submission History
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : problems.length === 0 ? (
        <div className="no-problems-container">
          <p>No problems found. Add your first problem to get started!</p>
          <Link to={'/add'} className='add-problem-button large'>
            <span className="add-icon">+</span> Add New Problem
          </Link>
        </div>
      ) : (
        <>
          {/* Sort controls */}
          <div className="sort-controls">
            <label htmlFor="difficulty-sort" className="sort-label">Sort by difficulty:</label>
            <select 
              id="difficulty-sort"
              className="sort-select"
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="default">Default Order</option>
              <option value="easiest">Easiest First</option>
              <option value="hardest">Hardest First</option>
            </select>
          </div>

          <div className='problems-table-container'>
            <table className='problems-table'>
              <thead>
                <tr>
                  <th className="sn-column">S.No</th>
                  <th>Problem</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProblems.map((problem, index) => (
                  <tr key={problem._id}>
                    <td className="sn-column">{indexOfFirstProblem + index + 1}</td>
                    <td>
                      <span className='problem-title'>{problem.title}</span>
                    </td>
                    <td>
                      <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className='problem-actions'>
                        <Link to={`/compiler/${problem._id}`} className='action-button solve'>
                          Solve
                        </Link>
                        <Link to={`/edit/${problem._id}`} className='action-button edit'>
                          Edit
                        </Link>
                        <button className='action-button delete'>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {problems.length > problemsPerPage && (
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
  );
};

export default Userdata;

