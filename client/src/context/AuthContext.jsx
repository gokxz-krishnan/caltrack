import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('caltrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('caltrack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('caltrack_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('caltrack_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('caltrack_token', newToken);
      localStorage.setItem('caltrack_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async ({ name, email, password, confirmPassword, timezone }) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    });
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('caltrack_token', newToken);
      localStorage.setItem('caltrack_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('caltrack_token');
    localStorage.removeItem('caltrack_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('caltrack_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
