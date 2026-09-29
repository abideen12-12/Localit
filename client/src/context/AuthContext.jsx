import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('localit_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored token
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        localStorage.setItem('localit_user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Failed to restore authentication session:', error.message);
        localStorage.removeItem('localit_token');
        localStorage.removeItem('localit_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token: newToken } = response.data;
    localStorage.setItem('localit_token', newToken);
    localStorage.setItem('localit_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    const { user: userData, token: newToken } = response.data;
    localStorage.setItem('localit_token', newToken);
    localStorage.setItem('localit_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('localit_token');
    localStorage.removeItem('localit_user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const updateProfile = async (payload) => {
    const response = await api.put('/auth/profile', payload);
    setUser((prev) => ({ ...prev, ...response.data }));
    localStorage.setItem('localit_user', JSON.stringify({ ...user, ...response.data }));
    return response.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', { currentPassword, newPassword });
    return response;
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      localStorage.setItem('localit_user', JSON.stringify(response.data));
    } catch (e) {
      console.warn('Could not refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
