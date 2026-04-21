// src/components/Footer.jsx
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#2C1E16] text-[#FAF8F5] pt-16 pb-8 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

        {/* Brand */}
        <div className="animate-fade-in-up delay-1">
          <h3 className="text-3xl font-bold tracking-tight mb-6">
            Gujju<span className="text-[#A87C51]">Ni</span>Dukan
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your premium destination for authentic regional flavors, artisanal goods, and daily essentials.
          </p>
        </div>

        {/* Quick Links */}
        <div className="animate-fade-in-up delay-2">
          <h4 className="text-lg font-bold mb-4 uppercase tracking-wider text-white">Quick Links</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/" className="nav-link inline-block hover:text-[#A87C51] transition-colors duration-200">Home</Link></li>
            <li><Link to="/cart" className="nav-link inline-block hover:text-[#A87C51] transition-colors duration-200">Cart</Link></li>
            <li><Link to="/login" className="nav-link inline-block hover:text-[#A87C51] transition-colors duration-200">Login</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="animate-fade-in-up delay-3">
          <h4 className="text-lg font-bold mb-4 uppercase tracking-wider text-white">Customer Care</h4>
          <ul className="space-y-2 text-gray-400 text-sm flex flex-col">
            <li>
              <Link 
                to="/login" 
                className="cursor-pointer hover:text-[#A87C51] transition-colors duration-200 hover:translate-x-1 inline-block"
                style={{ transition: 'color 0.2s ease, transform 0.2s ease' }}
              >
                My Account
              </Link>
            </li>
            <li>
              <Link 
                to="/buyer" 
                className="cursor-pointer hover:text-[#A87C51] transition-colors duration-200 hover:translate-x-1 inline-block"
                style={{ transition: 'color 0.2s ease, transform 0.2s ease' }}
              >
                Order Tracking
              </Link>
            </li>
            <li>
              <Link 
                to="/" 
                className="cursor-pointer hover:text-[#A87C51] transition-colors duration-200 hover:translate-x-1 inline-block"
                style={{ transition: 'color 0.2s ease, transform 0.2s ease' }}
              >
                Customer Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="animate-fade-in-up delay-4">
          <h4 className="text-lg font-bold mb-4 uppercase tracking-wider text-white">Newsletter</h4>
          <p className="text-gray-400 text-sm mb-4">Subscribe to get updates on new arrivals.</p>
          <div className="flex border border-gray-600 rounded-full overflow-hidden transition-all duration-300 focus-within:border-[#A87C51]">
            <input
              type="email"
              placeholder="Email Address"
              className="px-4 py-2 w-full text-black bg-white outline-none text-sm"
            />
            <button className="bg-[#A87C51] text-white px-4 text-sm font-bold hover:bg-[#5A3825] transition-colors duration-200 whitespace-nowrap active:scale-95">
              SUBSCRIBE
            </button>
          </div>
        </div>

      </div>

      <div className="text-center text-gray-500 text-sm border-t border-gray-800 pt-8 animate-fade-in">
        © {new Date().getFullYear()} Gujju Ni Dukan. All rights reserved.
      </div>
    </footer>
  );
};