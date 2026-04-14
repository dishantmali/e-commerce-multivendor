import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="glass sticky top-0 z-50 transition-all duration-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-[#ec4899] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all shadow-lg">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <span className="font-bold text-2xl text-dark tracking-tight">Marketplace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to={user?.role === 'vendor' ? '/vendor' : '/buyer'} className="font-semibold px-4 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-dark px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors font-bold active:scale-95 shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-bold transition-colors px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30 transition-colors font-bold active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
             <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="text-dark p-2 focus:outline-none"
             >
               <div className="space-y-1.5">
                 <span className={`block w-6 h-0.5 bg-dark transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                 <span className={`block w-6 h-0.5 bg-dark transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                 <span className={`block w-6 h-0.5 bg-dark transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
               </div>
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl overflow-hidden py-4 px-6 flex flex-col gap-4">
            
            <div className="mt-4 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link 
                    onClick={() => setMobileMenuOpen(false)}
                    to={user?.role === 'vendor' ? '/vendor' : '/buyer'} 
                    className="text-primary font-bold mb-2 text-center hover:underline block"
                  >
                    {user?.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gray-100 text-dark px-4 py-3 rounded-xl transition-colors font-bold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/login"
                    className="w-full text-center border-2 border-primary text-primary font-bold rounded-xl py-3"
                  >
                    Log In
                  </Link>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/signup"
                    className="w-full text-center bg-primary text-white font-bold rounded-xl py-3 shadow-lg shadow-primary/30"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
        </div>
      )}
    </nav>
  )
}
