// src/pages/SignupPage.jsx
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: { role: 'buyer' } });
  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    try {
      let payload = data;
      let headers = {};

      // If vendor, we must use FormData to support the Logo file upload
      if (data.role === 'vendor') {
        payload = new FormData();
        payload.append('role', data.role);
        payload.append('name', data.name);
        payload.append('email', data.email);
        payload.append('phone', data.phone);
        payload.append('password', data.password);
        payload.append('shop_name', data.shop_name);
        payload.append('address', data.address);
        
        if (data.logo && data.logo.length > 0) {
          payload.append('logo', data.logo[0]); // Append the actual file
        }
        
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      await api.post('/auth/register/', payload, { headers });
      toast.success("Account created! Please login.");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#FAF8F5] px-4 py-12 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-[#5A3825] w-full max-w-md animate-fade-in hover:shadow-2xl transition-shadow duration-500">
        <h2 className="text-3xl font-bold text-[#2C1E16] mb-2 text-center animate-fade-in-up delay-1">Create Account</h2>
        <p className="text-gray-500 mb-8 text-center animate-fade-in-up delay-2">Join Gujju Ni Dukan today.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Role Toggle */}
          <div className="animate-fade-in-up delay-2 flex gap-4 p-1 bg-[#FAF8F5] rounded-lg border border-gray-200">
            <label className={`flex-1 text-center py-2 rounded-md cursor-pointer text-sm font-bold transition-all duration-200 ${selectedRole === 'buyer' ? 'bg-white shadow-sm text-[#5A3825] scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}>
              <input type="radio" value="buyer" {...register("role")} className="hidden" />
              BUYER
            </label>
            <label className={`flex-1 text-center py-2 rounded-md cursor-pointer text-sm font-bold transition-all duration-200 ${selectedRole === 'vendor' ? 'bg-white shadow-sm text-[#5A3825] scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}>
              <input type="radio" value="vendor" {...register("role")} className="hidden" />
              VENDOR
            </label>
          </div>

          {/* Full Name */}
          <div className="animate-fade-in-up delay-2">
            <input
              {...register("name", { required: "Full Name is required" })}
              placeholder="Full Name"
              className={`input-animated w-full p-4 bg-[#FAF8F5] border rounded-lg outline-none transition-all duration-200 hover:border-[#A87C51]/50 ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-[#A87C51]'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in-up">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="animate-fade-in-up delay-2">
            <input
              {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }})}
              placeholder="Email Address"
              className={`input-animated w-full p-4 bg-[#FAF8F5] border rounded-lg outline-none transition-all duration-200 hover:border-[#A87C51]/50 ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-[#A87C51]'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in-up">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div className="animate-fade-in-up delay-3">
            <input
              type="tel"
              {...register("phone", { required: "Phone is required", pattern: { value: /^\d{10}$/, message: "Must be exactly 10 digits" }})}
              placeholder="Phone Number"
              className={`input-animated w-full p-4 bg-[#FAF8F5] border rounded-lg outline-none transition-all duration-200 hover:border-[#A87C51]/50 ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-[#A87C51]'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in-up">{errors.phone.message}</p>}
          </div>

          {/* Vendor Specific Fields */}
          {selectedRole === 'vendor' && (
            <div className="animate-fade-in space-y-5">
              {/* Shop Name */}
              <div>
                <input
                  {...register("shop_name", { required: "Shop name is required for vendors" })}
                  placeholder="Shop Name"
                  className={`input-animated w-full p-4 bg-[#FAF8F5] border rounded-lg outline-none transition-all duration-200 hover:border-[#A87C51]/50 ${errors.shop_name ? 'border-red-500' : 'border-gray-200 focus:border-[#A87C51]'}`}
                />
                {errors.shop_name && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in-up">{errors.shop_name.message}</p>}
              </div>

              {/* Address */}
              <div>
                <textarea
                  {...register("address", { required: "Address is required for vendors" })}
                  placeholder="Business Address"
                  rows="2"
                  className={`input-animated w-full p-4 bg-[#FAF8F5] border rounded-lg outline-none transition-all duration-200 hover:border-[#A87C51]/50 ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-[#A87C51]'}`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in-up">{errors.address.message}</p>}
              </div>

              {/* Company Logo */}
              <div>
                <label className="block text-sm font-bold text-[#5A3825] mb-2 ml-1">Company Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("logo", { required: "Company logo is required" })}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FAF8F5] file:text-[#2C1E16] hover:file:bg-[#A87C51] hover:file:text-white transition-all cursor-pointer"
                />
                {errors.logo && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in-up">{errors.logo.message}</p>}
              </div>
            </div>
          )}

          {/* Password */}
          <div className="animate-fade-in-up delay-4">
            <input
              type="password"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" }})}
              placeholder="Password"
              className={`input-animated w-full p-4 bg-[#FAF8F5] border rounded-lg outline-none transition-all duration-200 hover:border-[#A87C51]/50 ${errors.password ? 'border-red-500' : 'border-gray-200 focus:border-[#A87C51]'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in-up">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <div className="animate-fade-in-up delay-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full bg-[#5A3825] text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#3E2723] transition-all duration-200 shadow-md disabled:bg-gray-400 mt-4 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center animate-fade-in-up delay-6">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#A87C51] font-bold hover:underline transition-colors duration-200 hover:text-[#5A3825]">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};