// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { Input } from '../components/Input'
// import { useAuth } from '../context/AuthContext'
// import api from '../api/axios'
// import toast from 'react-hot-toast'

// export const SignupPage = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     role: 'buyer',
//     shop_name: '',
//     contact_details: '',
//   })
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const { login } = useAuth()
//   const navigate = useNavigate()

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     try {
//       const payload = {
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         role: formData.role,
//       }

//       if (formData.role === 'vendor') {
//         payload.shop_name = formData.shop_name
//         payload.contact_details = formData.contact_details
//       }

//       await api.post('/auth/register/', payload)

//       const loginRes = await api.post('/auth/login/', {
//         email: formData.email,
//         password: formData.password,
//       })
//       const { access, refresh } = loginRes.data
//       const userData = await login(access, refresh)
//       toast.success('Account created successfully!')
//       navigate('/home')
//     } catch (err) {
//       const msg = err.response?.data
//       if (typeof msg === 'object') {
//         const errors = Object.entries(msg)
//           .map(([key, val]) => {
//             const fieldErrors = Array.isArray(val) ? val.join(', ') : val
//             return `${key}: ${fieldErrors}`
//           })
//           .join(' | ')
//         setError(errors || 'Registration failed. Please try again.')
//       } else {
//         setError('Registration failed. Please try again.')
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#fafbfb] flex items-center justify-center px-4 font-sans py-12">
//       <div className="w-full max-w-[500px] bg-white shadow-sm border border-gray-100 rounded-[24px] p-8 sm:p-10">
//         <div className="text-center mb-8">
//             <h1 className="text-[32px] sm:text-[36px] font-bold text-[#1a1f1d] mb-2 leading-tight tracking-tight">Create Account</h1>
//             <p className="text-gray-500 text-[15px]">Join MarketHub as a buyer or vendor</p>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-600 font-medium px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-[14px]">
//             <span>⚠️</span> {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <Input
//             label="Full Name"
//             type="text"
//             placeholder="John Doe"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             className="!bg-white"
//           />

//           <Input
//             label="Email Address"
//             type="email"
//             placeholder="you@example.com"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="!bg-white"
//           />

//           <Input
//             label="Password"
//             type="password"
//             placeholder="••••••••"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             className="!bg-white"
//           />

//           <div className="pt-2 pb-2">
//             <label className="block text-[11px] font-semibold text-gray-400 mb-3 uppercase tracking-wider">
//               I want to join as:
//             </label>
//             <div className="grid grid-cols-2 gap-4">
//               <button
//                 type="button"
//                 onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
//                 className={`py-3.5 rounded-xl border-2 font-bold transition-all text-[15px] ${formData.role === 'buyer' ? 'border-[#185546] bg-[#eef7f4] text-[#185546]' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50 bg-white'}`}
//               >
//                 🛍️ Buyer
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setFormData(prev => ({ ...prev, role: 'vendor' }))}
//                 className={`py-3.5 rounded-xl border-2 font-bold transition-all text-[15px] ${formData.role === 'vendor' ? 'border-[#185546] bg-[#eef7f4] text-[#185546]' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50 bg-white'}`}
//               >
//                 🏪 Vendor
//               </button>
//             </div>
//           </div>

//           {/* Vendor-specific fields */}
//           {formData.role === 'vendor' && (
//             <div className="space-y-4 p-5 sm:p-6 bg-[#fafbfb] rounded-[16px] border border-gray-100 animate-in slide-in-from-top-2 duration-300">
//               <p className="text-[11px] font-bold text-[#185546] uppercase tracking-wider">Vendor Details</p>
//               <Input
//                 label="Shop Name"
//                 type="text"
//                 placeholder="My Amazing Store"
//                 name="shop_name"
//                 value={formData.shop_name}
//                 onChange={handleChange}
//                 required
//                 className="!bg-white"
//               />
//               <div className="w-full">
//                 <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">
//                   Contact Details
//                 </label>
//                 <textarea
//                   name="contact_details"
//                   value={formData.contact_details}
//                   onChange={handleChange}
//                   required
//                   rows="3"
//                   placeholder="Phone, address, or other contact info..."
//                   className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1a1f1d] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#185546]/10 focus:border-[#185546] transition-all font-medium bg-white text-[15px]"
//                 />
//               </div>
//             </div>
//           )}

//           <button 
//             type="submit" 
//             className="w-full bg-[#ef6b4c] text-white hover:bg-[#d65a3d] py-3.5 rounded-xl font-bold text-[15px] shadow-sm transition-all active:scale-[0.99] mt-6 disabled:opacity-75" 
//             disabled={loading}
//           >
//             {loading ? 'Creating Account...' : 'Create Account'}
//           </button>
//         </form>

//         <div className="mt-8 pt-6 border-t border-gray-100">
//           <p className="text-center text-gray-500 text-[14.5px]">
//             Already have an account?{' '}
//             <Link to="/login" className="text-[#185546] font-bold hover:underline transition-all">
//               Sign in securely
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }
/* src/pages/SignupPage.jsx */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }
      if (formData.role === 'vendor') {
        payload.shop_name = formData.shop_name
        payload.contact_details = formData.contact_details
      }

      await api.post('/auth/register/', payload)
      const loginRes = await api.post('/auth/login/', { email: formData.email, password: formData.password })
      const { access, refresh } = loginRes.data
      await login(access, refresh)
      toast.success('Welcome to the Collective')
      navigate('/home')
    } catch (err) {
      setError('Registration failed. Please verify details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center px-4 font-sans py-24">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8E7A60] mb-4 block">Registration</span>
            <h1 className="text-5xl font-serif text-[#111111] mb-2">Join <span className="italic">Us.</span></h1>
            <p className="text-[#111111]/50 text-sm font-medium tracking-wide">Become part of the MarketHub collective</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[12px] font-medium px-4 py-3 mb-8 border-l-2 border-red-600 tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-4 pb-4">
             <button
               type="button"
               onClick={() => setFormData(p => ({ ...p, role: 'buyer' }))}
               className={`py-4 text-[11px] uppercase tracking-widest font-bold border-b-2 transition-all duration-500 ${formData.role === 'buyer' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#111111]/20'}`}
             >
               Shopping
             </button>
             <button
               type="button"
               onClick={() => setFormData(p => ({ ...p, role: 'vendor' }))}
               className={`py-4 text-[11px] uppercase tracking-widest font-bold border-b-2 transition-all duration-500 ${formData.role === 'vendor' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#111111]/20'}`}
             >
               Selling
             </button>
          </div>

          <div className="space-y-6">
            <input
              name="name"
              placeholder="FULL NAME"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-[#111111]/20 pb-3 text-[13px] uppercase tracking-widest outline-none focus:border-[#8E7A60] transition-colors placeholder:text-[#111111]/20"
            />
            <input
              name="email"
              type="email"
              placeholder="EMAIL ADDRESS"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-[#111111]/20 pb-3 text-[13px] uppercase tracking-widest outline-none focus:border-[#8E7A60] transition-colors placeholder:text-[#111111]/20"
            />
            <input
              name="password"
              type="password"
              placeholder="PASSWORD"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-[#111111]/20 pb-3 text-[13px] uppercase tracking-widest outline-none focus:border-[#8E7A60] transition-colors placeholder:text-[#111111]/20"
            />
          </div>

          {formData.role === 'vendor' && (
            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-2 duration-700">
              <input
                name="shop_name"
                placeholder="STUDIO / SHOP NAME"
                value={formData.shop_name}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-[#111111]/20 pb-3 text-[13px] uppercase tracking-widest outline-none focus:border-[#8E7A60] transition-colors placeholder:text-[#111111]/20"
              />
              <textarea
                name="contact_details"
                placeholder="CONTACT INFO (ADDRESS, SOCIALS...)"
                value={formData.contact_details}
                onChange={handleChange}
                required
                rows="2"
                className="w-full bg-transparent border-b border-[#111111]/20 pb-3 text-[13px] uppercase tracking-widest outline-none focus:border-[#8E7A60] transition-colors placeholder:text-[#111111]/20 resize-none"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#111111] text-[#F8F6F0] py-5 mt-6 text-[12px] font-medium tracking-[0.3em] uppercase hover:bg-[#8E7A60] transition-all duration-500"
          >
            {loading ? 'Creating Profile...' : 'Join Collective'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[#111111]/40 text-[13px] font-medium">
            Already have a profile?{' '}
            <Link to="/login" className="text-[#111111] border-b border-[#111111] pb-0.5 hover:text-[#8E7A60] hover:border-[#8E7A60] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}