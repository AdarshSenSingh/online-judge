import React, { createContext, useEffect, useState, useCallback } from 'react';

export const AuthContext = createContext();
export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('auth_token');
    return { token, isAuthenticated: !!token };
  });

  // Sync logout/login across tabs using localStorage 'storage' event
  useEffect(() => {
    function syncLogout(e) {
      if (e.key === 'auth_token') {
        setAuth({ token: e.newValue, isAuthenticated: !!e.newValue });
      }
    }
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, []);

  const login = useCallback((token) => {
    localStorage.setItem('auth_token', token);
    setAuth({ token, isAuthenticated: true });
  }, []);
  
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setAuth({ token: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
