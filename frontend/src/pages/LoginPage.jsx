import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card } from '../components/Card'
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
      // Call JWT login endpoint
      const res = await api.post('/auth/login/', { email, password })
      const { access, refresh } = res.data

      // Login stores tokens and fetches user profile
      const userData = await login(access, refresh)
      toast.success(`Welcome back, ${userData.name}!`)
      navigate('/home')
    } catch (err) {
      const msg = err.response?.data
      if (msg?.detail) {
        setError(msg.detail)
      } else if (typeof msg === 'object') {
        // Combine all field errors
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
    <div className="min-h-screen bg-light flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-300/30 rounded-full blur-[100px] -z-10 mix-blend-multiply" />

      <Card className="w-full max-w-lg card-glass shadow-2xl !p-6 sm:!p-10 border border-white/40">
        <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-dark mb-3 font-display">Welcome Back</h1>
            <p className="text-gray-500 text-lg">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 font-medium bg-white/50 focus:bg-white"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-14 font-medium bg-white/50 focus:bg-white"
          />

          <Button type="submit" fullWidth size="lg" className="h-14 text-lg mt-2 font-bold shadow-xl shadow-primary/30" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-500 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
