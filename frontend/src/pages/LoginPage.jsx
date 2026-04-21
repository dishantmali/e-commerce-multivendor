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
      if (userData.role === 'admin') navigate('/admin');
      else if (userData.role === 'vendor') navigate('/vendor');
      else navigate('/');
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#FAF8F5] flex items-center justify-center py-12 px-4 font-sans">
      <div className="bg-white p-10 shadow-lg rounded-2xl w-full max-w-md animate-fade-in border-t-4 border-[#5A3825] hover:shadow-2xl transition-shadow duration-500">
        <h2 className="text-3xl font-bold text-[#2C1E16] mb-2 text-center animate-fade-in-up delay-1">Welcome Back</h2>
        <p className="text-gray-500 text-center mb-8 animate-fade-in-up delay-2">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-fade-in-up delay-2">
            <input
              type="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="input-animated w-full p-4 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 hover:border-[#A87C51]/50"
            />
          </div>
          <div className="animate-fade-in-up delay-3">
            <input
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="input-animated w-full p-4 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 hover:border-[#A87C51]/50"
            />
          </div>
          <div className="animate-fade-in-up delay-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full bg-[#5A3825] text-white py-4 rounded-full font-bold uppercase tracking-wider hover:bg-[#3E2723] transition-all duration-200 mt-4 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className={`inline-block transition-all duration-200 ${loading ? 'opacity-70' : ''}`}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Login'}
              </span>
            </button>
          </div>
        </form>

        <p className="text-center text-gray-500 mt-6 animate-fade-in-up delay-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#A87C51] font-bold hover:underline transition-colors duration-200 hover:text-[#5A3825]">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};