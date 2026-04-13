import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card } from '../components/Card'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    shop_name: '',
    contact_details: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Build registration payload
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }

      // Include vendor fields if vendor role
      if (formData.role === 'vendor') {
        payload.shop_name = formData.shop_name
        payload.contact_details = formData.contact_details
      }

      // Register the user
      await api.post('/auth/register/', payload)

      // Auto-login after successful registration
      const loginRes = await api.post('/auth/login/', {
        email: formData.email,
        password: formData.password,
      })
      const { access, refresh } = loginRes.data
      const userData = await login(access, refresh)
      toast.success('Account created successfully!')
      navigate(userData.role === 'vendor' ? '/vendor' : '/buyer')
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') {
        // Combine all field errors into a readable string
        const errors = Object.entries(msg)
          .map(([key, val]) => {
            const fieldErrors = Array.isArray(val) ? val.join(', ') : val
            return `${key}: ${fieldErrors}`
          })
          .join(' | ')
        setError(errors || 'Registration failed. Please try again.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4 relative overflow-hidden py-12">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-300/30 rounded-full blur-[100px] -z-10 mix-blend-multiply" />

      <Card className="w-full max-w-xl card-glass shadow-2xl !p-6 sm:!p-10 border border-white/40">
        <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-dark mb-3 font-display">Create Account</h1>
            <p className="text-gray-500 text-lg">Join us as a buyer or vendor</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="h-14 font-medium bg-white/50 focus:bg-white"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="h-14 font-medium bg-white/50 focus:bg-white"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="h-14 font-medium bg-white/50 focus:bg-white"
          />

          <div className="pt-2">
            <label className="block text-sm font-bold text-dark mb-3 uppercase tracking-wide">
              I want to join as:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
                className={`py-4 rounded-xl border-2 font-bold transition-all ${formData.role === 'buyer' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white/50'}`}
              >
                🛍️ Buyer
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'vendor' }))}
                className={`py-4 rounded-xl border-2 font-bold transition-all ${formData.role === 'vendor' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white/50'}`}
              >
                🏪 Vendor
              </button>
            </div>
          </div>

          {/* Vendor-specific fields */}
          {formData.role === 'vendor' && (
            <div className="space-y-6 p-6 bg-primary/5 rounded-2xl border border-primary/20 transition-all">
              <p className="text-sm font-bold text-primary uppercase tracking-wide">Vendor Details</p>
              <Input
                label="Shop Name"
                type="text"
                placeholder="My Amazing Store"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                required
                className="h-14 font-medium bg-white/80 focus:bg-white"
              />
              <div className="w-full">
                <label className="block text-sm font-bold text-dark mb-2 uppercase tracking-wide">
                  Contact Details
                </label>
                <textarea
                  name="contact_details"
                  value={formData.contact_details}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Phone, address, or other contact info..."
                  className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 text-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium bg-white/80"
                />
              </div>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" className="h-14 text-lg mt-4 font-bold shadow-xl shadow-primary/30" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign in securely
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
