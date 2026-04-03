import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cloudmind-token');
      if (token) {
        try {
          const storedUser = localStorage.getItem('cloudmind-user');
          if (storedUser) setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('cloudmind-token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: loggedInUser } = response.data;
    
    setUser(loggedInUser);
    localStorage.setItem('cloudmind-token', token);
    localStorage.setItem('cloudmind-user', JSON.stringify(loggedInUser));
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/signup', { name, email, password });
    const { token, user: signedUpUser } = response.data;
    
    setUser(signedUpUser);
    localStorage.setItem('cloudmind-token', token);
    localStorage.setItem('cloudmind-user', JSON.stringify(signedUpUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cloudmind-token');
    localStorage.removeItem('cloudmind-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
