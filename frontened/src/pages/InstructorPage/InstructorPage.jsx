import React from "react";
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

const InstructorPage = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear auth (adjust if storing tokens, etc.)
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Logged out!');
    setTimeout(() => navigate('/instructor/login'), 900);
  };
  return (
    <div className="instructor-page">
      <Toaster position="top-right" />
      <h1>Welcome, Instructor!</h1>
      <p>This is your dedicated instructor dashboard.</p>
      <button className="btn primary-btn" onClick={handleLogout} style={{marginTop:'2rem'}}>Logout</button>
    </div>
  );
};

export default InstructorPage;
