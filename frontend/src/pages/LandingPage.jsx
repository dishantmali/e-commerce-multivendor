import { useState } from 'react'
import { Link } from 'react-router-dom'

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('vendors')

  const vendorSteps = [
    { num: '01', title: 'Create Your Store', desc: 'Sign up and set up your vendor profile with product listings, pricing, and inventory.' },
    { num: '02', title: 'Receive Orders', desc: 'Get notified instantly when customers place orders. View all details in your dashboard.' },
    { num: '03', title: 'Process & Ship', desc: 'Update order status from "Sent to Factory" to "Shipped" as you fulfill each order.' },
    { num: '04', title: 'Get Paid', desc: 'Receive payments directly through Razorpay. Platform fee (5%) is automatically calculated.' },
  ]
  
  const buyerSteps = [
    { num: '01', title: 'Browse Products', desc: 'Explore products from verified vendors across multiple categories and countries.' },
    { num: '02', title: 'Secure Checkout', desc: 'Complete your purchase with Razorpay\'s secure payment gateway. Multiple payment options available.' },
    { num: '03', title: 'Track Your Order', desc: 'Monitor your order status in real-time from factory processing to shipment.' },
    { num: '04', title: 'Receive & Review', desc: 'Get your products delivered and share your experience to help other buyers.' },
  ]

  const steps = activeTab === 'vendors' ? vendorSteps : buyerSteps

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-[#fafbfb] pt-8 pb-20 lg:pt-12 lg:pb-32 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Column */}
            <div className="flex-1 w-full text-left z-10">
              <div className="inline-block bg-[#eef7f4] text-[#188367] rounded-full px-4 py-1.5 text-sm font-semibold mb-8 border border-[#eef7f4]">
                Trusted by 10,000+ vendors
              </div>
              <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-[#1a1f1d]">
                Connect.<br/>
                Sell.<br/>
                <span className="text-[#188367] block mt-1">Scale.</span>
              </h1>
              <p className="text-gray-500 text-lg mb-10 max-w-xl leading-relaxed">
                The multi-vendor marketplace platform that empowers independent sellers to reach buyers globally. Secure payments, order tracking, and growth tools—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-14">
                <Link to="/signup" className="inline-flex justify-center items-center px-8 py-3.5 bg-[#ef6b4c] text-white font-semibold rounded-lg hover:bg-[#d65a3d] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full sm:w-auto text-[15px]">
                  Start Selling Today
                </Link>
                <Link to="/home" className="inline-flex justify-center items-center px-8 py-3.5 bg-white text-[#1a1f1d] font-semibold border-2 border-[#185546] rounded-lg hover:bg-gray-50 transition-all w-full sm:w-auto text-[15px]">
                  Browse Marketplace
                </Link>
              </div>
              <div className="flex items-center gap-6 md:gap-12">
                <div>
                  <div className="text-3xl font-bold text-[#188367]">10K+</div>
                  <div className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">Active Vendors</div>
                </div>
                <div className="w-[1px] h-10 bg-gray-200"></div>
                <div>
                  <div className="text-3xl font-bold text-[#188367]">50M+</div>
                  <div className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">Transactions</div>
                </div>
                 <div className="w-[1px] h-10 bg-gray-200"></div>
                <div>
                  <div className="text-3xl font-bold text-[#188367]">150+</div>
                  <div className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">Countries</div>
                </div>
              </div>
            </div>

            {/* Right Column (Hero Graphic) */}
            <div className="flex-1 relative w-full lg:h-[500px] flex items-center justify-center lg:justify-end mt-12 lg:mt-0 group cursor-default perspective-1000">
               {/* White Background Card */}
               <div className="absolute right-0 top-10 w-[90%] max-w-[450px] h-[400px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transform rotate-3 group-hover:rotate-6 group-hover:-translate-y-2 group-hover:translate-x-2 transition-all duration-500 ease-out z-0 ring-1 ring-black/5"></div>
               
               {/* Main Green Card */}
               <div className="relative z-10 w-[85%] max-w-[400px] h-[380px] bg-gradient-to-br from-[#185546] to-[#124236] rounded-2xl p-8 shadow-2xl transform lg:-translate-x-12 group-hover:lg:-translate-x-16 group-hover:-translate-y-4 group-hover:shadow-[0_40px_80px_-20px_rgba(24,85,70,0.4)] transition-all duration-500 ease-out ring-1 ring-white/10 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-white/10 mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ease-out">
                    <div className="w-6 h-6 border-2 border-white/50 rounded-md"></div>
                  </div>
                  <h3 className="font-bold text-[22px] mb-2 text-white tracking-tight">Vendor Dashboard</h3>
                  <p className="text-[14px] text-[#9fc7bd] mb-8 leading-relaxed">Track orders, manage inventory and grow your business.</p>
                  
                  <div className="space-y-4 flex-1">
                     <div className="flex gap-4">
                       <div className="h-[72px] flex-1 bg-white/5 rounded-xl border border-white/5 transform group-hover:-translate-y-1 hover:!bg-white/10 transition-all duration-500 delay-0 cursor-pointer"></div>
                       <div className="h-[72px] flex-1 bg-white/5 rounded-xl border border-white/5 transform group-hover:-translate-y-1 hover:!bg-white/10 transition-all duration-500 delay-75 cursor-pointer"></div>
                     </div>
                     <div className="flex gap-4">
                       <div className="h-[72px] flex-1 bg-white/5 rounded-xl border border-white/5 transform group-hover:-translate-y-1 hover:!bg-white/10 transition-all duration-500 delay-150 cursor-pointer"></div>
                       <div className="h-[72px] flex-1 bg-white/5 rounded-xl border border-white/5 transform group-hover:-translate-y-1 hover:!bg-white/10 transition-all duration-500 delay-200 cursor-pointer"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="inline-block bg-[#eef7f4] text-[#188367] rounded-full px-4 py-1.5 text-sm font-semibold mb-6 border border-[#eef7f4]">
          Platform Features
        </div>
        <h2 className="text-4xl md:text-[40px] leading-tight font-bold text-[#1a1f1d] mb-6 max-w-2xl tracking-tight">
          Everything you need to <br className="hidden md:block" />run a successful marketplace
        </h2>
        <p className="text-gray-500 text-[17px] mb-16 max-w-2xl leading-relaxed">
          From secure payments to order lifecycle management, we've built the tools you need to grow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '👥', title: 'Dual-User Experience', desc: 'Separate, optimized workflows for buyers and vendors. Shop seamlessly or manage your entire business—all on one platform.' },
            { icon: '🔒', title: 'Secure Payments', desc: 'Razorpay integration ensures safe, real-time transactions with automatic backend verification and fraud protection.' },
            { icon: '📍', title: 'Complete Order Tracking', desc: 'Track every order from payment to delivery. Real-time updates on factory processing, shipping, and final delivery status.' },
            { icon: '💰', title: 'Smart Monetization', desc: 'Built-in platform fee system with transparent 5% commission. Automated calculations and payout management.' },
            { icon: '📊', title: 'Vendor Dashboard', desc: 'Comprehensive tools for inventory management, order processing, analytics, and customer communication.' },
            { icon: '🛡️', title: 'Buyer Protection', desc: 'Secure shopping experience with order tracking, verified vendors, and customer support throughout the purchase journey.' },
          ].map((feature, idx) => (
            <div key={idx} className="p-8 border border-gray-100 rounded-[20px] hover:border-[#188367]/30 bg-white hover:shadow-xl hover:shadow-[#188367]/5 transition-all duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-[#fafbfb] group-hover:bg-[#eef7f4] border border-gray-50 flex items-center justify-center mb-6 transition-colors shadow-sm">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-[#1a1f1d] mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link to="/home" className="inline-flex justify-center items-center px-8 py-3.5 bg-[#185546] text-white font-semibold rounded-lg hover:bg-[#124236] transition-all shadow-md text-[15px]">
            Explore All Features
          </Link>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="bg-[#185546] py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-[36px] font-bold mb-4 tracking-tight">Trusted by thousands of businesses</h2>
          <p className="text-[#9fc7bd] text-lg mb-16 max-w-2xl mx-auto">
            Our platform powers successful marketplaces around the world
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4">
             <div className="flex flex-col items-center">
               <div className="text-[44px] md:text-[56px] font-bold mb-1 tracking-tight">$250M+</div>
               <div className="text-[15px] font-bold mb-2">Total Transaction Volume</div>
               <div className="text-[13px] text-[#9fc7bd] max-w-[200px] leading-relaxed">Processed securely through our platform</div>
             </div>
             <div className="flex flex-col items-center">
               <div className="text-[44px] md:text-[56px] font-bold mb-1 tracking-tight">99.9%</div>
               <div className="text-[15px] font-bold mb-2">Payment Success Rate</div>
               <div className="text-[13px] text-[#9fc7bd] max-w-[200px] leading-relaxed">With Razorpay integration</div>
             </div>
             <div className="flex flex-col items-center">
               <div className="text-[44px] md:text-[56px] font-bold mb-1 tracking-tight">10,000+</div>
               <div className="text-[15px] font-bold mb-2">Active Vendors</div>
               <div className="text-[13px] text-[#9fc7bd] max-w-[200px] leading-relaxed">Selling across 150+ countries</div>
             </div>
             <div className="flex flex-col items-center">
               <div className="text-[44px] md:text-[56px] font-bold mb-1 tracking-tight">4.8/5</div>
               <div className="text-[15px] font-bold mb-2">Average Rating</div>
               <div className="text-[13px] text-[#9fc7bd] max-w-[200px] leading-relaxed">From verified buyers and sellers</div>
             </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-[#fafbfb] py-24 md:py-32 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#fcf2ef] text-[#ef6b4c] rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            How It Works
          </div>
          <h2 className="text-4xl md:text-[40px] font-bold text-[#1a1f1d] mb-4 tracking-tight">
            Get started in minutes
          </h2>
          <p className="text-gray-500 text-[17px] mb-12">
            Whether you're selling or buying, our platform makes it simple
          </p>

          <div className="inline-flex bg-white rounded-xl p-1.5 border border-gray-200 mb-16 shadow-sm">
             <button 
                onClick={() => setActiveTab('vendors')}
                className={`px-8 py-2.5 rounded-lg text-[15px] font-semibold transition-all duration-200 ${activeTab === 'vendors' ? 'bg-[#185546] text-white shadow-md' : 'text-gray-500 hover:text-[#1a1f1d]'}`}
             >
               For Vendors
             </button>
             <button 
                onClick={() => setActiveTab('buyers')}
                className={`px-8 py-2.5 rounded-lg text-[15px] font-semibold transition-all duration-200 ${activeTab === 'buyers' ? 'bg-[#185546] text-white shadow-md' : 'text-gray-500 hover:text-[#1a1f1d]'}`}
             >
               For Buyers
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
             {steps.map((step, idx) => (
               <div key={idx} className="p-8 border border-gray-100 rounded-[20px] bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all h-full">
                  <div className="text-[40px] font-light text-[#b3cec6] mb-4 leading-none">{step.num}</div>
                  <h3 className="text-lg font-bold text-[#1a1f1d] mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-[15px] leading-relaxed">{step.desc}</p>
               </div>
             ))}
          </div>

          <div className="mt-16">
            <Link to="/signup" className="inline-flex justify-center items-center px-8 py-3.5 bg-[#ef6b4c] text-white font-semibold rounded-lg hover:bg-[#d65a3d] transition-all shadow-md text-[15px]">
              Start Selling Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="relative py-24 md:py-32 overflow-hidden bg-[#fafbfb]">
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-tr from-[#eef7f4] via-white to-[#fcf2ef] blur-[80px] -z-10 rounded-full opacity-80"></div>
         
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-10 md:p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white w-full">
               <h2 className="text-4xl md:text-[44px] font-bold text-[#1a1f1d] mb-6 leading-tight tracking-tight">
                  Ready to grow your<br/> <span className="text-[#188367]">marketplace business?</span>
               </h2>
               <p className="text-gray-500 text-[17px] mb-10 max-w-xl mx-auto leading-relaxed">
                  Join thousands of successful vendors and buyers on our platform. Start selling or shopping today with zero setup fees.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 w-full">
                  <Link to="/signup" className="inline-flex justify-center items-center px-8 py-4 bg-[#ef6b4c] text-white font-semibold rounded-lg hover:bg-[#d65a3d] transition-all shadow-md w-full sm:w-auto text-[15px]">
                     Create Vendor Account
                  </Link>
                  <Link to="/home" className="inline-flex justify-center items-center px-8 py-4 bg-[#185546] text-white font-semibold rounded-lg hover:bg-[#124236] transition-all shadow-md w-full sm:w-auto text-[15px]">
                     Browse Marketplace
                  </Link>
               </div>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[14px] font-medium text-gray-500">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#188367] text-white flex items-center justify-center">
                      <CheckIcon className="w-2.5 h-2.5" />
                    </div>
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#188367] text-white flex items-center justify-center">
                      <CheckIcon className="w-2.5 h-2.5" />
                    </div>
                    Free to start
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#188367] text-white flex items-center justify-center">
                      <CheckIcon className="w-2.5 h-2.5" />
                    </div>
                    24/7 support
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  )
}
