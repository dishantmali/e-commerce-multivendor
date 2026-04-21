// src/components/Navbar.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import dukanLogo from '../assets/dukan.jpeg'

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
  const showCartAndWishlist = !isAuthenticated || user?.role === 'buyer';

  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-sm transition-all duration-300">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Left — Hamburger (mobile) */}
        <div className="w-1/3 flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-[#5A3825] transition-transform duration-200 active:scale-90"
            aria-label="Toggle menu"
          >
            <svg
              className={`w-7 h-7 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Center — Logo */}
        <div className="w-1/3 flex justify-center">
          <Link to="/" className="flex items-center justify-center group">
            <img
              src={dukanLogo}
              alt="Gujju Ni Dukan Logo"
              className="h-16 md:h-20 w-auto object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Right — Nav links + icons */}
        <div className="w-1/3 flex justify-end items-center gap-4 md:gap-6">

          {/* SWAPPED: Icons first (Cart / Wishlist) */}
          <div className="flex items-center gap-4">
            {showCartAndWishlist && (
              <>
                {/* Wishlist icon */}
                <Link
                  to="/wishlist"
                  className="hidden md:block text-[#5A3825] hover:text-red-500 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>

                {/* Cart icon */}
                <Link
                  to="/cart"
                  className="relative text-[#5A3825] hover:text-[#A87C51] transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* SWAPPED: Auth Links second (Far Right Corner) */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to={getDashboardRoute()}
                className="nav-link text-[#5A3825] hover:text-[#A87C51] font-medium text-sm transition-colors duration-200"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-[#5A3825] hover:text-red-500 font-medium text-sm transition-colors duration-200 active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="nav-link text-[#5A3825] hover:text-[#A87C51] font-medium text-sm transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white bg-[#A87C51] hover:bg-[#5A3825] font-medium text-sm px-4 py-1.5 rounded-full transition-all duration-200 hover:shadow-md active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-6 space-y-4">
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardRoute()}
                onClick={() => setIsMenuOpen(false)}
                className="block text-[#2C1E16] font-bold hover:text-[#A87C51] transition-colors duration-200 animate-fade-in-up delay-1"
              >
                Dashboard
              </Link>
              {isBuyer && (
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-[#2C1E16] font-bold hover:text-[#A87C51] transition-colors duration-200 animate-fade-in-up delay-2"
                >
                  Wishlist
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block text-red-500 font-bold hover:text-red-700 transition-colors duration-200 animate-fade-in-up delay-3"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block text-[#2C1E16] font-bold hover:text-[#A87C51] transition-colors duration-200 animate-fade-in-up delay-1"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="block text-[#A87C51] font-bold hover:text-[#5A3825] transition-colors duration-200 animate-fade-in-up delay-2"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

    </header>
  )
}