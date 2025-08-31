import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider.jsx';

export default function PublicRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  if (isAuthenticated) {
    // User is logged in, so don't allow viewing login/signup etc
    return <Navigate to="/" replace />;
  }
  return children;
}
