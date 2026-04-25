import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAdmin: boolean;
  fetchMe: () => Promise<void>;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  fetchMe: async () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (phoneNumber: string, password: string) => {
    const res = await api.post('/api/auth/login', { phoneNumber, password });
    if (res.data.token) {
      localStorage.setItem('apc_portal_token', res.data.token);
    }
    // Synchronize state with server immediately
    await fetchMe();
  };

  const register = async (data: any) => {
    await api.post('/api/auth/register', data);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('apc_portal_token');
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, fetchMe, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
