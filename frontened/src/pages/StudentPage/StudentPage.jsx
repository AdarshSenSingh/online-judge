import React from "react";
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

const StudentPage = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear auth (adjust if storing tokens, etc.)
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Logged out!');
    setTimeout(() => navigate('/student/login'), 900);
  };
  return (
    <div className="student-page">
      <Toaster position="top-right" />
      <h1>Welcome, Student!</h1>
      <p>This is your dedicated student dashboard.</p>
      <button className="btn primary-btn" onClick={handleLogout} style={{marginTop:'2rem'}}>Logout</button>
    </div>
  );
};

export default StudentPage;
