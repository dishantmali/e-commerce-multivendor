/* src/pages/SignupPage.jsx */
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const SignupPage = () => {
  const navigate = useNavigate();
  
  // Initialize react-hook-form
  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      role: 'buyer'
    }
  });

  // Watch the role to conditionally show vendor fields
  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    try {
      // data contains: email, password, phone, role, shop_name (if vendor)
      await api.post('/register/', data);
      toast.success("Account created! Please login.");
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Registration failed. Try again.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#f5f5f5] px-4 py-12">
      <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#1e1e27] mb-2">Create Account</h2>
        <p className="text-gray-500 mb-8">Join the MarketHub community today.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Role Selection */}
          <div className="flex gap-4 p-1 bg-gray-50 rounded-sm border border-gray-100">
            <label className={`flex-1 text-center py-2 cursor-pointer text-sm font-bold transition-all ${selectedRole === 'buyer' ? 'bg-white shadow-sm text-[#fe4c50]' : 'text-gray-500'}`}>
              <input type="radio" value="buyer" {...register("role")} className="hidden" />
              BUYER
            </label>
            <label className={`flex-1 text-center py-2 cursor-pointer text-sm font-bold transition-all ${selectedRole === 'vendor' ? 'bg-white shadow-sm text-[#fe4c50]' : 'text-gray-500'}`}>
              <input type="radio" value="vendor" {...register("role")} className="hidden" />
              VENDOR
            </label>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
            <input 
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
              })}
              className={`w-full p-3 border rounded-sm outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-[#fe4c50]'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone Field (Strict 10 Digits) */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
            <input 
              type="tel"
              {...register("phone", { 
                required: "Phone is required",
                pattern: { value: /^\d{10}$/, message: "Must be exactly 10 digits" }
              })}
              className={`w-full p-3 border rounded-sm outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-[#fe4c50]'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* Conditional Field for Vendor */}
          {selectedRole === 'vendor' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Shop Name</label>
              <input 
                {...register("shop_name", { required: "Shop name is required for vendors" })}
                className={`w-full p-3 border rounded-sm outline-none transition-colors ${errors.shop_name ? 'border-red-500' : 'border-gray-200 focus:border-[#fe4c50]'}`}
              />
              {errors.shop_name && <p className="text-red-500 text-xs mt-1">{errors.shop_name.message}</p>}
            </div>
          )}

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
            <input 
              type="password"
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" }
              })}
              className={`w-full p-3 border rounded-sm outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-200 focus:border-[#fe4c50]'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#1e1e27] text-white py-4 font-bold uppercase tracking-widest hover:bg-[#fe4c50] transition-colors rounded-sm shadow-md disabled:bg-gray-400"
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#fe4c50] font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};