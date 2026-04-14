import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const StackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

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
    <nav className="bg-white sticky top-0 z-50 transition-all duration-300 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[88px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-[#185546] rounded-xl flex items-center justify-center shadow-sm">
              <StackIcon />
            </div>
            <span className="font-bold text-[22px] text-[#1a1f1d] tracking-tight">MarketHub</span>
          </Link>

          {/* Desktop Navigation */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-10">
              <a href="/#features" className="text-[15px] font-medium text-gray-500 hover:text-[#185546] transition-colors">Features</a>
              <a href="/#how-it-works" className="text-[15px] font-medium text-gray-500 hover:text-[#185546] transition-colors">How It Works</a>
              <a href="/#pricing" className="text-[15px] font-medium text-gray-500 hover:text-[#185546] transition-colors">Pricing</a>
            </div>
          )}

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link to={user?.role === 'vendor' ? '/vendor' : '/buyer'} className="font-semibold px-4 py-1.5 rounded-full bg-[#eef7f4] text-[#185546] hover:bg-[#dcede8] transition-colors text-[15px]">
                  {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-[#1a1f1d] px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-semibold shadow-sm text-[15px]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#1a1f1d] hover:text-[#ef6b4c] font-medium transition-colors text-[15px]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#ef6b4c] text-white px-6 py-2.5 rounded-lg hover:bg-[#d65a3d] transition-colors font-semibold shadow-sm text-[15px]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
             <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="text-[#1a1f1d] p-2 focus:outline-none"
             >
               <div className="space-y-1.5">
                 <span className={`block w-6 h-0.5 bg-current transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                 <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                 <span className={`block w-6 h-0.5 bg-current transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
               </div>
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[88px] left-0 w-full bg-white border-b border-gray-100 shadow-lg overflow-hidden py-4 px-6 flex flex-col gap-4">
            
            {!isAuthenticated && (
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-4">
                <a href="/#features" className="text-[15px] font-medium text-gray-500 hover:text-[#185546]" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="/#how-it-works" className="text-[15px] font-medium text-gray-500 hover:text-[#185546]" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                <a href="/#pricing" className="text-[15px] font-medium text-gray-500 hover:text-[#185546]" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link 
                    onClick={() => setMobileMenuOpen(false)}
                    to={user?.role === 'vendor' ? '/vendor' : '/buyer'} 
                    className="text-[#185546] font-semibold mb-2 text-center hover:underline block bg-[#eef7f4] py-2 rounded-lg"
                  >
                    {user?.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gray-100 text-[#1a1f1d] px-4 py-3 rounded-lg transition-colors font-semibold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/login"
                    className="w-full text-center border border-gray-200 text-[#1a1f1d] font-semibold rounded-lg py-3 hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/signup"
                    className="w-full text-center bg-[#ef6b4c] text-white font-semibold rounded-lg py-3 shadow-sm hover:bg-[#d65a3d] transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
        </div>
      )}
    </nav>
  )
}
