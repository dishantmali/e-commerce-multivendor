import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access');
      if (token) {
        try {
          const res = await api.get('/auth/me/');
          setUser(res.data);
        } catch (error) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (access, refresh) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    const res = await api.get('/auth/me/');
    setUser(res.data);
    return res.data; // <-- Added this line so we can route smartly after login
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);