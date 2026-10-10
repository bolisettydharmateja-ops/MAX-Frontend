import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentSession,
  saveSession,
  clearSession,
  loginUser,
  registerUser,
  loginWithGoogleAccount,
  sendPasswordResetRequest
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on load
  useEffect(() => {
    try {
      const sessionUser = getCurrentSession();
      if (sessionUser) {
        setCurrentUser(sessionUser);
      } else {
        // Automatically seed with default logged-in user 'Dharma Teja' (matching the screenshot!)
        const defaultUser = {
          id: 'usr_teja_default',
          fullName: 'Dharma Teja',
          username: 'teja',
          email: 'dharmateja@gmail.com',
          joined: '10 Oct 2025',
          role: 'User',
          status: 'Active',
          avatar: null,
          provider: 'local'
        };
        setCurrentUser(defaultUser);
        saveSession(defaultUser, true);
      }
    } catch (err) {
      console.error('Session load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier, password, rememberMe = true) => {
    const user = await loginUser(identifier, password, rememberMe);
    setCurrentUser(user);
    return user;
  };

  const register = async (userData) => {
    const user = await registerUser(userData);
    setCurrentUser(user);
    return user;
  };

  const loginWithGoogle = async (googleAccount) => {
    const user = await loginWithGoogleAccount(googleAccount);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    clearSession();
    setCurrentUser(null);
  };

  const resetPassword = async (email) => {
    return await sendPasswordResetRequest(email);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    setCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
