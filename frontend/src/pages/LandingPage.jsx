import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export const LandingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-primary/10 via-primary-light/10 to-transparent -skew-y-6 transform origin-top-left -z-10" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-fuchsia-300/20 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      <div className="absolute top-10 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10 mix-blend-multiply" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Vite Commerce OS
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-dark mb-6 leading-tight font-display tracking-tight">
              The Future of <br/> <span className="gradient-text">Marketplaces</span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 leading-relaxed font-light">
              Connect with vendors worldwide, discover amazing products, and experience seamless dropshipping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/home">
                <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/25">
                  Explore Products
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold bg-white">
                  Become a Vendor
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative w-full h-[500px] hidden lg:flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-fuchsia-500 rounded-[3rem] rotate-3 opacity-20 blur-lg transition-transform duration-700 hover:rotate-6"></div>
            <div className="w-full h-full bg-light/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-2xl flex items-center justify-center relative z-10 overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
               <div className="text-center p-8">
                 <div className="text-8xl mb-6 transform -rotate-12 hover:rotate-0 transition-transform duration-500">🛍️</div>
                 <h3 className="text-2xl font-bold text-dark font-display">Multi-Vendor Sync</h3>
                 <p className="text-gray-500 mt-2">Real-time marketplace engines</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-dark text-white py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">Why Choose Us?</h2>
            <p className="text-gray-400 text-lg">We provide a scalable infrastructure designed for modern buyers and sellers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🌍', title: 'Global Reach', desc: 'Access thousands of products from verified vendors worldwide.' },
              { icon: '📦', title: 'Smart Dropshipping', desc: 'Seamless order forwarding to factories for reliable delivery.' },
              { icon: '🔒', title: 'Secure Vault', desc: 'Safe transactions with our state-of-the-art payment gateway.' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-10 text-center hover:bg-white/10 transition-all duration-300 card-hover">
                <div className="inline-flex w-20 h-20 bg-primary/20 rounded-2xl items-center justify-center text-4xl mb-8 border border-primary/30">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4 font-display">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-6 font-display">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          <div className="hidden lg:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gray-200 -z-10 px-4"></div>
          {[
            { step: '01', title: 'Browse', desc: 'Explore products from multiple vendors' },
            { step: '02', title: 'Order', desc: 'Place your order securely' },
            { step: '03', title: 'Process', desc: 'Vendor forwards order to factory' },
            { step: '04', title: 'Delivery', desc: 'Receive your product at home' },
          ].map((item, idx) => (
            <div key={idx} className="relative bg-white pt-8 px-6 pb-10 border border-gray-100 shadow-xl shadow-gray-200/50 rounded-3xl hover:border-primary/50 transition-colors duration-300">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-dark to-gray-800 text-white flex items-center justify-center text-xl font-bold font-display shadow-lg border-4 border-white">
                {item.step}
              </div>
              <div className="text-center mt-6">
                <h3 className="text-xl font-bold text-dark mb-3 font-display">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary skew-y-3 origin-bottom-right transform scale-110 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-0"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 font-display tracking-tight">Ready to Get Started?</h2>
          <p className="text-2xl mb-12 opacity-90 font-light max-w-2xl mx-auto">Join thousands of happy customers and vendors on the platform today.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/home">
              <Button size="lg" className="h-16 px-10 text-lg !bg-white !text-primary hover:!bg-gray-100 shadow-2xl">
                Start Shopping Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
