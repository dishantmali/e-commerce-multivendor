import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#1e1e27] text-white pt-16 pb-8 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h3 className="text-3xl font-bold tracking-tight mb-6">
            Colo<span className="text-[#fe4c50]">Shop</span>
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your premium destination for the latest fashion trends and accessories. Quality guaranteed.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/" className="hover:text-[#fe4c50] transition-colors">Home</Link></li>
            <li><Link to="/cart" className="hover:text-[#fe4c50] transition-colors">Cart</Link></li>
            <li><Link to="/login" className="hover:text-[#fe4c50] transition-colors">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="hover:text-[#fe4c50] transition-colors cursor-pointer">My Account</li>
            <li className="hover:text-[#fe4c50] transition-colors cursor-pointer">Order Tracking</li>
            <li className="hover:text-[#fe4c50] transition-colors cursor-pointer">Customer Service</li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 uppercase tracking-wider">Newsletter</h4>
          <p className="text-gray-400 text-sm mb-4">Subscribe to get updates on new arrivals.</p>
          <div className="flex">
            <input type="email" placeholder="Email Address" className="px-4 py-2 w-full text-black outline-none" />
            <button className="bg-[#fe4c50] px-4 font-bold hover:bg-[#e04347] transition-colors">SEND</button>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm border-t border-gray-800 pt-8">
        © {new Date().getFullYear()} ColoShop Clone. All rights reserved.
      </div>
    </footer>
  );
};