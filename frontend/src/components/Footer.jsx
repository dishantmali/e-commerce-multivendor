// import { Link } from 'react-router-dom'

// const StackIcon = () => (
//   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </svg>
// )

// export const Footer = () => {
//   return (
//     <footer className="bg-[#185546] pt-20 pb-8 font-sans mt-auto">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
//           <div className="col-span-1 md:col-span-2 lg:col-span-1">
//             <Link to="/" className="flex items-center gap-3 mb-6 group">
//               <div className="w-10 h-10 bg-white text-[#185546] rounded-[10px] flex items-center justify-center shadow-sm">
//                 <StackIcon />
//               </div>
//               <span className="font-bold text-[20px] text-white tracking-tight">MarketHub</span>
//             </Link>
//             <p className="text-[#9fc7bd] leading-relaxed mb-6 text-[14.5px]">
//               Your trusted destination for quality products from verified vendors worldwide. Secure dropshipping made beautifully easy.
//             </p>
//             <div className="flex gap-4">
//               <a href="#" className="w-10 h-10 rounded-full border border-transparent bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-colors">
//                 <span className="sr-only">Twitter</span>
//                 𝕏
//               </a>
//               <a href="#" className="w-10 h-10 rounded-full border border-transparent bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-colors">
//                 <span className="sr-only">GitHub</span>
//                 🐙
//               </a>
//             </div>
//           </div>
          
//           <div>
//             <h3 className="font-bold text-[16px] text-white mb-6">For Buyers</h3>
//             <ul className="space-y-4">
//               <li><Link to="/home" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">Shop Products</Link></li>
//               <li><Link to="/buyer" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">Track Orders</Link></li>
//               <li><a href="#" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">Buyer Protection</a></li>
//               <li><a href="#" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">Help Center</a></li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="font-bold text-[16px] text-white mb-6">For Vendors</h3>
//             <ul className="space-y-4">
//               <li><Link to="/signup" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">Become a Vendor</Link></li>
//               <li><Link to="/vendor" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">Vendor Dashboard</Link></li>
//               <li><a href="#" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">Seller Policies</a></li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="font-bold text-[16px] text-white mb-6">Company</h3>
//             <ul className="space-y-4">
//               <li><a href="#" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">About Us</a></li>
//               <li><a href="#" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">Contact</a></li>
//               <li><a href="#" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">Privacy Policy</a></li>
//               <li><a href="#" className="text-[14.5px] text-[#9fc7bd] hover:text-white font-medium transition-colors">Terms of Service</a></li>
//             </ul>
//           </div>
//         </div>
        
//         <div className="pt-8 border-t border-[#124236] text-center text-[#9fc7bd] text-[14px] font-medium">
//           <p>&copy; {new Date().getFullYear()} MarketHub Inc. All rights reserved.</p>
//         </div>
//       </div>
//     </footer>
//   )
// }
import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-[#F7F5F0] pt-24 pb-8 font-sans mt-auto border-t border-[#F7F5F0]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-12 mb-20">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-6 group">
              <span className="font-serif text-3xl tracking-wide text-[#F7F5F0]">
                Market<span className="italic text-[#C2A88F]">Hub.</span>
              </span>
            </Link>
            <p className="text-[#F7F5F0]/60 font-light leading-relaxed mb-8 text-sm">
              Curated goods for the modern lifestyle. The premier multivendor destination for quality and authenticity.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#F7F5F0]/60 hover:text-[#C2A88F] transition-colors text-sm uppercase tracking-widest">
                IG
              </a>
              <span className="text-[#F7F5F0]/20">•</span>
              <a href="#" className="text-[#F7F5F0]/60 hover:text-[#C2A88F] transition-colors text-sm uppercase tracking-widest">
                X
              </a>
              <span className="text-[#F7F5F0]/20">•</span>
              <a href="#" className="text-[#F7F5F0]/60 hover:text-[#C2A88F] transition-colors text-sm uppercase tracking-widest">
                IN
              </a>
            </div>
          </div>
          
          {/* Links Columns */}
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#C2A88F] font-medium mb-8">For Buyers</h3>
            <ul className="space-y-5">
              <li><Link to="/home" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">Shop Collection</Link></li>
              <li><Link to="/buyer" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">Track Orders</Link></li>
              <li><a href="#" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">Buyer Protection</a></li>
              <li><a href="#" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#C2A88F] font-medium mb-8">For Vendors</h3>
            <ul className="space-y-5">
              <li><Link to="/signup" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">Become a Vendor</Link></li>
              <li><Link to="/vendor" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">Vendor Dashboard</Link></li>
              <li><a href="#" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">Seller Policies</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#C2A88F] font-medium mb-8">Company</h3>
            <ul className="space-y-5">
              <li><a href="#" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm font-light text-[#F7F5F0]/70 hover:text-[#F7F5F0] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#F7F5F0]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[#F7F5F0]/40 text-xs font-light">
          <p>&copy; {new Date().getFullYear()} MarketHub Inc. All rights reserved.</p>
          <p className="uppercase tracking-widest text-[10px]">Designed for the modern collective</p>
        </div>
      </div>
    </footer>
  )
}