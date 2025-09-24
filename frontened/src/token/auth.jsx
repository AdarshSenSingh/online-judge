/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Function to store token in local storage and update state
    const storeTokenInLS = (serverToken) => {
        localStorage.setItem('token', serverToken);
        setToken(serverToken); // Update the state with the new token
    };
    
    let isLogin = !!token;

    const LogoutUser = () => {
        setToken("");
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        // Notify other tabs immediately
        try {
            window.localStorage.setItem('token', "");
            window.localStorage.removeItem('token');
        } catch {}
    };

    // Sync auth state across tabs and windows
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'token') {
                setToken(localStorage.getItem('token'));
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    return (
        <AuthContext.Provider value={{ isLogin, storeTokenInLS, LogoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error('AuthProvider is not used in main.jsx');
    }

    return authContextValue;
};
