/* src/pages/SignupPage.jsx */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer', shop_name: '', address: '', phone: '' })
  const [logoFile, setLogoFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Email Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return toast.error("Please enter a valid email address.");
    }

    // Mobile Validation (if vendor or during checkout)
    if (formData.role === 'vendor' || isCheckout) {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(formData.phone)) {
        return toast.error("Mobile number must be exactly 10 digits.");
      }
    }

    setLoading(true)

    try {
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('email', formData.email)
      payload.append('password', formData.password)
      payload.append('role', formData.role)

      if (formData.role === 'vendor') {
        payload.append('shop_name', formData.shop_name)
        payload.append('address', formData.address)
        payload.append('phone', formData.phone)
        payload.append('contact_details', formData.phone) // required by your backend
        if (logoFile) payload.append('logo', logoFile)
      }

      await api.post('/auth/register/', payload, { headers: { 'Content-Type': 'multipart/form-data' } })

      // Auto login
      const loginRes = await api.post('/auth/login/', { email: formData.email, password: formData.password })
      await login(loginRes.data.access, loginRes.data.refresh)
      toast.success('Registration Successful!')
      navigate('/')
    } catch (error) {
      console.error(error);
      toast.error('Registration failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center py-12 px-4">
      <div className="bg-white p-10 shadow-lg w-full max-w-md animate-fade-in border-t-4 border-[#fe4c50]">
        <h2 className="text-3xl font-bold text-[#1e1e27] mb-2 text-center">Create Account</h2>
        <p className="text-gray-500 text-center mb-8">Join the MarketHub community</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-4 mb-6">
            <button type="button" onClick={() => setFormData({ ...formData, role: 'buyer' })} className={`flex-1 py-2 font-medium border-b-2 transition-colors ${formData.role === 'buyer' ? 'border-[#fe4c50] text-[#fe4c50]' : 'border-transparent text-gray-400'}`}>Buyer</button>
            <button type="button" onClick={() => setFormData({ ...formData, role: 'vendor' })} className={`flex-1 py-2 font-medium border-b-2 transition-colors ${formData.role === 'vendor' ? 'border-[#fe4c50] text-[#fe4c50]' : 'border-transparent text-gray-400'}`}>Vendor</button>
          </div>

          <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 outline-none focus:border-[#fe4c50]" />
          <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 outline-none focus:border-[#fe4c50]" />
          <input type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 outline-none focus:border-[#fe4c50]" />

          {formData.role === 'vendor' && (
            <div className="space-y-5 bg-gray-50 p-4 border border-gray-200 animate-fade-in">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Store Details</p>
              <input type="text" placeholder="Shop Name" required value={formData.shop_name} onChange={e => setFormData({ ...formData, shop_name: e.target.value })} className="w-full p-3 bg-white border border-gray-200 outline-none focus:border-[#fe4c50]" />
              <input type="tel" placeholder="Business Phone" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-white border border-gray-200 outline-none focus:border-[#fe4c50]" />
              <textarea placeholder="Shop Address" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 bg-white border border-gray-200 outline-none focus:border-[#fe4c50]" rows="2" />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Shop Logo</label>
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fe4c50]/10 file:text-[#fe4c50] hover:file:bg-[#fe4c50]/20" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#fe4c50] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#e04347] transition-colors mt-4">
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-[#1e1e27] font-semibold hover:text-[#fe4c50]">Sign In</Link>
        </p>
      </div>
    </div>
  )
}