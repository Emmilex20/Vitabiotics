// /client/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import type { User, AuthContextType } from '../types/Auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL (match your backend port) - prefer Vite env var
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users'; 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to indicate initialization
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    if (userJson) {
      try {
        const parsed = JSON.parse(userJson);
        // Ensure token is attached to the user object for callers using `user.token`
        if (token) parsed.token = token;
        setUser(parsed);
      } catch (e) {
        console.warn('Failed to parse stored user', e);
        localStorage.removeItem('user');
      }
    }
    // Mark initialization complete
    setIsLoading(false);
  }, []);

  // --- API Handlers ---

  const login = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, formData);
      const { token, ...userData } = response.data;

      const userWithToken = { ...userData, token } as User;

      // Store both user data and token
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('authToken', token);
      
      setUser(userWithToken);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      const { token, ...userData } = response.data;

      const userWithToken = { ...userData, token } as User;

      // Store both user data and token
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('authToken', token);
      
      setUser(userWithToken);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const updateProfile = async (data: any) => {
    // Accepts { firstName, lastName, healthGoals }
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');
    try {
      const response = await axios.put((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updated = response.data;
      // Store persisted user and token
      const tokenNew = updated.token || token;
      const userWithToken = { ...updated, token: tokenNew } as User;
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('authToken', tokenNew);
      setUser(userWithToken);
      return userWithToken;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile';
      throw new Error(errMsg);
    }
  };

  const value = { user, isLoading, error, login, register, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};