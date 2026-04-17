import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login/', formData);
      const userData = await login(res.data.access, res.data.refresh);
      toast.success('Welcome back!');
      
      // Smart Redirect based on user role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/'); // Buyers go to home page
      }

    } catch (error) {
      console.error(error);
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#f5f5f5] flex items-center justify-center py-12 px-4">
      <div className="bg-white p-10 shadow-lg w-full max-w-md animate-fade-in border-t-4 border-[#fe4c50]">
        <h2 className="text-3xl font-bold text-[#1e1e27] mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-500 text-center mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input 
            type="email" 
            placeholder="Email Address" 
            required 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            className="w-full p-3 bg-gray-50 border border-gray-200 outline-none focus:border-[#fe4c50] transition-colors" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            className="w-full p-3 bg-gray-50 border border-gray-200 outline-none focus:border-[#fe4c50] transition-colors" 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#1e1e27] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#fe4c50] transition-colors mt-4"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-center text-gray-500 mt-6">
          Don't have an account? <Link to="/signup" className="text-[#1e1e27] font-semibold hover:text-[#fe4c50]">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};