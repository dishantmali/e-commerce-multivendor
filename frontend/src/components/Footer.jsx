import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="bg-dark text-gray-300 pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-2xl text-white font-display">Marketplace</span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6">
              Your trusted destination for quality products from verified vendors worldwide. Secure dropshipping made easy.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="sr-only">Twitter</span>
                𝕏
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="sr-only">GitHub</span>
                🐙
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg text-white mb-6 font-display">For Buyers</h3>
            <ul className="space-y-4">
              <li><Link to="/home" className="text-gray-400 hover:text-primary transition-colors">Shop Products</Link></li>
              <li><Link to="/buyer" className="text-gray-400 hover:text-primary transition-colors">Track Orders</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Buyer Protection</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg text-white mb-6 font-display">For Vendors</h3>
            <ul className="space-y-4">
              <li><Link to="/signup" className="text-gray-400 hover:text-primary transition-colors">Become a Vendor</Link></li>
              <li><Link to="/vendor" className="text-gray-400 hover:text-primary transition-colors">Vendor Dashboard</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Seller Policies</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg text-white mb-6 font-display">Company</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 font-medium">
          <p>&copy; {new Date().getFullYear()} Multi-Vendor Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
