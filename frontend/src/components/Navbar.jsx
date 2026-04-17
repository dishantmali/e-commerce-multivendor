import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Dynamic routing based on role
  const getDashboardRoute = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'vendor') return '/vendor';
    return '/buyer';
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-sm h-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        <div className="w-1/3 hidden md:flex items-center gap-6">
          <Link to="/" className="nav-link font-medium text-[#1e1e27] hover:text-[#fe4c50] transition-colors">Shop</Link>
          <a href="#categories" className="nav-link font-medium text-[#1e1e27] hover:text-[#fe4c50] transition-colors">Categories</a>
        </div>

        <div className="w-1/3 flex justify-center">
          <Link to="/" className="text-3xl font-bold text-[#1e1e27] tracking-tight">
            Market<span className="text-[#fe4c50]">Hub</span>
          </Link>
        </div>

        <div className="w-1/3 flex justify-end items-center gap-6">
          {isAuthenticated && user?.role === 'buyer' && (
             <Link to="/cart" className="relative text-[#1e1e27] hover:text-[#fe4c50] transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
             </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to={getDashboardRoute()} className="font-medium text-[#51545f] hover:text-[#fe4c50]">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-[#1e1e27]">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="font-medium text-[#1e1e27] hover:text-[#fe4c50] transition-colors">Login</Link>
              <Link to="/signup" className="bg-[#fe4c50] text-white px-5 py-2 rounded-sm font-medium hover:bg-[#e04347] transition-colors shadow-md hover:shadow-lg">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}