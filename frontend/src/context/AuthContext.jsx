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

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  const login = async (access, refresh) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    const res = await api.get('/auth/me/');
    setUser(res.data);

    // Merge Guest Cart
    const guestCart = JSON.parse(localStorage.getItem('guestCart'));
    if (guestCart && guestCart.length > 0) {
      try {
        await api.post('/cart/merge/', { items: guestCart });
        localStorage.removeItem('guestCart'); 
      } catch (err) { console.error("Failed to merge cart", err); }
    }
    
    // Merge Guest Wishlist
    const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist'));
    if (guestWishlist && guestWishlist.length > 0) {
      try {
        await api.post('/wishlist/merge/', { items: guestWishlist });
        localStorage.removeItem('guestWishlist'); 
      } catch (err) { console.error("Failed to merge wishlist", err); }
    }
    
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);