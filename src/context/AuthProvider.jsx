// src/context/AuthProvider.jsx
import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { login as authLogin } from '../services/auth';
import { parseJwt } from '../utils/jwtUtils';

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Nuevo estado para manejar carga inicial

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const decoded = parseJwt(storedToken);
          if (decoded) {
            setToken(storedToken);
            setIsAuthenticated(true);
            setUser(decoded);
          }
        } catch (error) {
          console.error('Error parsing token:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authLogin(credentials);
      const decoded = parseJwt(data.token);
      if (decoded) {
        setToken(data.token);
        setIsAuthenticated(true);
        setUser(decoded);
        localStorage.setItem('authToken', data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      isAuthenticated, 
      user,
      loading, // Exponer estado de carga
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;