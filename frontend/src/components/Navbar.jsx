import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/')
  }

  const getDashboardRoute = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'vendor') return '/vendor';
    return '/buyer';
  };

  const isBuyer = isAuthenticated && user?.role === 'buyer';

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-sm h-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Left Section: Mobile Toggler */}
        <div className="w-1/3 flex items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden text-[#1e1e27] focus:outline-none"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Center Section: Logo */}
        <div className="w-1/3 flex justify-center">
          <Link to="/" className="text-2xl md:text-3xl font-bold text-[#1e1e27] tracking-tight">
            Market<span className="text-[#fe4c50]">Hub</span>
          </Link>
        </div>

        {/* Right Section: Desktop Icons & Auth */}
        <div className="w-1/3 flex justify-end items-center gap-4 md:gap-6">
          {/* Icons shown only on Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {isBuyer && (
              <div className="flex items-center gap-4">
                <Link to="/wishlist" className="relative text-[#1e1e27] hover:text-[#fe4c50] transition-colors" title="My Wishlist">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>

                <Link to="/cart" className="relative text-[#1e1e27] hover:text-[#fe4c50] transition-colors" title="My Cart">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </Link>
              </div>
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
                <Link to="/signup" className="bg-[#fe4c50] text-white px-5 py-2 rounded-sm font-medium hover:bg-[#e04347] transition-colors shadow-md">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Simple Mobile Cart Icon (Always visible for Buyers even if menu is closed) */}
          {isBuyer && (
             <Link to="/cart" className="md:hidden text-[#1e1e27]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
             </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-fade-in">
          <div className="px-6 py-8 space-y-6">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardRoute()} onClick={() => setIsMenuOpen(false)} className="block text-lg font-bold text-[#1e1e27]">Dashboard</Link>
                {isBuyer && (
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="block text-lg font-bold text-[#1e1e27]">Wishlist</Link>
                )}
                <button onClick={handleLogout} className="block text-lg font-bold text-[#fe4c50]">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-lg font-bold text-[#1e1e27]">Login</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block text-lg font-bold text-[#fe4c50]">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}