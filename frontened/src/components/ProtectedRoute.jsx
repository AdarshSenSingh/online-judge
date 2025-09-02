import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../token/auth';

export default function ProtectedRoute({ children }) {
  const { isLogin } = useContext(AuthContext);
  const location = useLocation();

  if (!isLogin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
