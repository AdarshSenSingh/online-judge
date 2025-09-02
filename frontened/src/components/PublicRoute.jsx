import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../token/auth';

export default function PublicRoute({ children }) {
  const { isLogin, user } = useContext(AuthContext);
  const location = useLocation();

  // Determine last-known user role (store in AuthContext or localStorage)
  let role = (user && user.role)
    || localStorage.getItem('userRole');

  if (isLogin) {
    // Redirect based on current path
    if (location.pathname.startsWith('/student')) {
      return <Navigate to="/student/dashboard" replace />;
    } else if (location.pathname.startsWith('/instructor')) {
      return <Navigate to="/instructor" replace />;
    } else if (role === 'instructor') {
      return <Navigate to="/instructor" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }
  return children;
}
