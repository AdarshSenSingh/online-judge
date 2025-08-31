import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) {
    return <Navigate to="/student/login" replace />;
  }
  return children;
}
