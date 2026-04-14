import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../components/Input'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login/', { email, password })
      const { access, refresh } = res.data

      const userData = await login(access, refresh)
      toast.success(`Welcome back, ${userData.name}!`)
      navigate('/home')
    } catch (err) {
      const msg = err.response?.data
      if (msg?.detail) {
        setError(msg.detail)
      } else if (typeof msg === 'object') {
        const errors = Object.values(msg).flat().join(' ')
        setError(errors || 'Login failed. Please try again.')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafbfb] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-[440px] bg-white shadow-sm border border-gray-100 rounded-[24px] p-8 sm:p-10">
        <div className="text-center mb-8">
            <h1 className="text-[32px] sm:text-[36px] font-bold text-[#1a1f1d] mb-2 leading-tight tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 text-[15px]">Sign in to your MarketHub account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 font-medium px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-[14px]">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="!bg-white"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="!bg-white"
          />

          <button 
            type="submit" 
            className="w-full bg-[#ef6b4c] text-white hover:bg-[#d65a3d] py-3.5 rounded-xl font-bold text-[15px] shadow-sm transition-all active:scale-[0.99] mt-4 disabled:opacity-75" 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-gray-500 text-[14.5px]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#185546] font-bold hover:underline transition-all">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
