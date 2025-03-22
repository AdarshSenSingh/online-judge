/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react";

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
    };

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
