import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hero-big.jpeg'

const featuredProducts = [
  {
    id: 1,
    name: "Unbothered Elixir",
    price: "4,500",
    image: "https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: "Wellness"
  },
  {
    id: 2,
    name: "Radiance Body Oil",
    price: "3,200",
    image: "https://images.pexels.com/photos/4465121/pexels-photo-4465121.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: "Bodycare"
  },
  {
    id: 3,
    name: "The Essential Balm",
    price: "1,850",
    image: "https://images.pexels.com/photos/4465829/pexels-photo-4465829.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: "Skincare"
  }
]

/* ── Scroll Reveal (unchanged) ── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    const elements = document.querySelectorAll('.reveal-element, .reveal-image-wrapper, .line-reveal, .label-slide-in')
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/* ── Parallax hero bg on scroll ── */
function useParallax(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const scrolled = window.scrollY
      el.style.transform = `translateY(${scrolled * 0.25}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ref])
}

/* ── Cursor glow follow ── */
function useCursorGlow() {
  useEffect(() => {
    const glow = document.getElementById('cursor-glow')
    if (!glow) return
    const move = (e) => {
      glow.style.left = e.clientX + 'px'
      glow.style.top  = e.clientY + 'px'
    }
    const show = () => { glow.style.opacity = '1' }
    const hide = () => { glow.style.opacity = '0' }
    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseenter', show)
    window.addEventListener('mouseleave', hide)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseenter', show)
      window.removeEventListener('mouseleave', hide)
    }
  }, [])
}

/* ── Scroll progress bar ── */
function useScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById('scroll-progress')
    if (!bar) return
    const onScroll = () => {
      const total  = document.documentElement.scrollHeight - window.innerHeight
      const pct    = total > 0 ? (window.scrollY / total) * 100 : 0
      bar.style.width = pct + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}

/* ── Hero word-by-word stagger on load ── */
function useHeroWords() {
  useEffect(() => {
    const words = document.querySelectorAll('.hero-word')
    words.forEach((w, i) => {
      setTimeout(() => w.classList.add('is-visible'), 200 + i * 130)
    })
  }, [])
}

/* ── Animated number counter when in view ── */
function useCounterReveal() {
  useEffect(() => {
    const counters = document.querySelectorAll('[data-count]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.done) {
            entry.target.dataset.done = 'true'
            const target = parseFloat(entry.target.dataset.count)
            const suffix = entry.target.dataset.suffix || ''
            const prefix = entry.target.dataset.prefix || ''
            const duration = 1800
            const start = performance.now()
            const step = (now) => {
              const elapsed = now - start
              const progress = Math.min(elapsed / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 4)
              const value = target < 10
                ? (eased * target).toFixed(1)
                : Math.floor(eased * target)
              entry.target.textContent = prefix + value + suffix
              if (progress < 1) requestAnimationFrame(step)
            }
            requestAnimationFrame(step)
          }
        })
      },
      { threshold: 0.5 }
    )
    counters.forEach((c) => observer.observe(c))
    return () => observer.disconnect()
  }, [])
}

/* ── Card tilt on mouse move ── */
function useTiltCards() {
  useEffect(() => {
    const cards = document.querySelectorAll('.tilt-card')
    const handlers = []
    cards.forEach((card) => {
      const onMove = (e) => {
        const rect  = card.getBoundingClientRect()
        const cx    = rect.left + rect.width  / 2
        const cy    = rect.top  + rect.height / 2
        const dx    = (e.clientX - cx) / (rect.width  / 2)
        const dy    = (e.clientY - cy) / (rect.height / 2)
        card.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) scale(1.02)`
      }
      const onLeave = () => {
        card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)'
      }
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
      handlers.push({ card, onMove, onLeave })
    })
    return () => {
      handlers.forEach(({ card, onMove, onLeave }) => {
        card.removeEventListener('mousemove', onMove)
        card.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])
}

export const LandingPage = () => {
  const heroBgRef = useRef(null)

  useScrollReveal()
  useParallax(heroBgRef)
  useCursorGlow()
  useScrollProgress()
  useHeroWords()
  useCounterReveal()
  useTiltCards()

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#111111] overflow-x-hidden selection:bg-[#8E7A60] selection:text-[#F8F6F0]">

      {/* ── Scroll progress bar ── */}
      <div id="scroll-progress" />

      {/* ── Cursor glow ── */}
      <div id="cursor-glow" className="cursor-glow" style={{ opacity: 0 }} />

      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#EBE7DF]">
        
        {/* Background Image (Parallax) */}
        <div ref={heroBgRef} className="absolute inset-0 w-full h-[120%] -top-[10%] hero-bg-parallax">
          <img 
            src={heroImage} 
            alt="Hero Aesthetic" 
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8F6F0] via-[#F8F6F0]/80 to-transparent" />
        </div>

        {/* 3D Abstract Wireframe */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] opacity-40 pointer-events-none abstract-3d-container z-0">
          <div className="abstract-3d-shape">
            <div className="abstract-ring ring-1" />
            <div className="abstract-ring ring-2" />
            <div className="abstract-ring ring-3" />
            <div className="abstract-ring ring-4" />
          </div>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center text-center mt-32">

          {/* Animated label */}
          <span className="hero-word text-[12px] md:text-[14px] uppercase tracking-[0.4em] font-bold text-[#111111] mb-6 block">
            Welcome to MarketHub
          </span>

          {/* Word-by-word heading */}
          <h1 className="text-6xl md:text-8xl lg:text-[130px] font-serif leading-[0.85] tracking-tight text-[#111111] mb-8">
            {['Curated'].map((word, i) => (
              <span key={i} className="hero-word inline-block mr-[0.2em]" style={{ transitionDelay: `${330 + i * 130}ms` }}>
                {word}
              </span>
            ))}
            <br />
            <span className="italic font-light hero-word inline-block" style={{ transitionDelay: '460ms' }}>
              Commerce.
            </span>
          </h1>

          <p className="hero-word text-lg md:text-xl font-medium text-[#111111]/80 max-w-xl mx-auto mb-14 leading-relaxed" style={{ transitionDelay: '620ms' }}>
            Elevate your everyday. Discover premium goods from verified vendors, or launch your own minimalist storefront today.
          </p>

          <div className="hero-word flex flex-col sm:flex-row gap-6" style={{ transitionDelay: '760ms' }}>
            <Link 
              to="/home" 
              className="btn-shimmer px-12 py-4 bg-[#111111] text-[#F8F6F0] text-sm font-medium tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#8E7A60]"
            >
              Shop The Collection
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-word absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 z-10" style={{ transitionDelay: '900ms' }}>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold"></span>
          <div className="w-[1px] h-10 bg-[#111111] origin-top" style={{ animation: 'scaleY 1.5s ease-in-out infinite' }} />
        </div>
      </section>

      {/* 2. INFINITE MARQUEE */}
      <section className="mt-24 border-y border-transparent bg-[#111111] text-[#F8F6F0] py-5 overflow-hidden flex marquee-track">
        <div className="animate-marquee whitespace-nowrap flex font-serif text-3xl italic tracking-wide">
          <span className="mx-12">Encrypted Razorpay Checkout</span> •&nbsp;
          <span className="mx-12">Verified Vendors</span> •&nbsp;
          <span className="mx-12">Real-time Order Tracking</span> •&nbsp;
          <span className="mx-12">Automated Platform Fees</span> •&nbsp;
          <span className="mx-12">Encrypted Razorpay Checkout</span> •&nbsp;
          <span className="mx-12">Verified Vendors</span> •&nbsp;
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <span className="label-slide-in text-[12px] uppercase tracking-[0.3em] font-bold text-[#8E7A60] mb-3 block">Storefront</span>
            <div className="line-reveal mb-4" />
            <h2 className="reveal-element text-4xl md:text-5xl font-serif text-[#111111]">Featured Essentials.</h2>
          </div>
          <Link to="/home" className="hover-underline-anim text-sm font-medium tracking-[0.2em] uppercase pb-1 hover:text-[#8E7A60] transition-colors mt-6 md:mt-0">
            View All Goods
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {featuredProducts.map((product, idx) => (
            <div
              key={product.id}
              className={`reveal-element delay-${(idx + 1) * 100} tilt-card group cursor-pointer`}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#EBE7DF] mb-6 reveal-image-wrapper">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover reveal-image group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                {/* Gradient overlay on hover */}
                <div className="product-overlay absolute inset-0" />
                <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <button
                    onClick={() => window.location.href='/login'}
                    className="btn-shimmer w-full bg-[#111111]/90 backdrop-blur-md text-[#F8F6F0] py-4 text-sm font-medium tracking-[0.2em] uppercase hover:bg-[#8E7A60] transition-colors"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#8E7A60] mb-2">{product.category}</p>
                  <h3 className="text-xl font-serif text-[#111111]">{product.name}</h3>
                </div>
                <span className="text-md font-medium text-[#111111]">₹{product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS BAR (counter animation) ── */}
      <section className="py-20 px-4 bg-[#EBE7DF]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center reveal-element">
          {[
            { count: 10, suffix: 'K+', label: 'Active Vendors' },
            { count: 50, suffix: 'M+', label: 'Transactions' },
            { count: 150, suffix: '+',  label: 'Countries' },
            { count: 4.8, suffix: '/5', label: 'Avg Rating' },
          ].map(({ count, suffix, label }) => (
            <div key={label}>
              <div
                className="text-4xl md:text-5xl font-serif text-[#111111] mb-2"
                data-count={count}
                data-suffix={suffix}
              >
                0{suffix}
              </div>
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#8E7A60]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EDITORIAL MANIFESTO SECTION */}
      <section id="ethos" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 reveal-element">
            <span className="label-slide-in text-[12px] uppercase tracking-[0.3em] font-bold text-[#8E7A60] mb-4 block">Our Ethos</span>
            <h2 className="text-4xl md:text-5xl font-serif mb-8 text-[#111111] leading-[1.1]">
              A marketplace built for <br/><span className="italic text-[#8E7A60]">authenticity.</span>
            </h2>
            <p className="font-medium text-[#111111]/70 leading-relaxed mb-8 text-lg">
              We provide the infrastructure for independent brands to thrive. From encrypted Razorpay checkouts to seamless vendor dashboards, we handle the complex logistics so creators can focus on crafting the extraordinary.
            </p>
            <Link 
              to="/signup" 
              className="hover-underline-anim inline-flex items-center gap-4 text-sm font-medium tracking-[0.2em] uppercase pb-2 hover:text-[#8E7A60] transition-colors"
            >
              Start Selling With Us
              <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="lg:col-span-7 reveal-image-wrapper h-[70vh] w-full bg-[#EBE7DF]">
            <img 
              src="https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=1200" 
              alt="Editorial Fashion" 
              className="w-full h-full object-cover reveal-image"
            />
          </div>

        </div>
      </section>

      {/* 5. DARK FOOTER CTA */}
      <section className="bg-[#111111] text-[#F8F6F0] py-40 px-4 text-center mt-20 relative overflow-hidden">

        {/* Subtle radial gradient bg */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(142,122,96,0.12) 0%, transparent 70%)'
        }} />

        <div className="relative max-w-4xl mx-auto">
          <span className="label-slide-in text-[12px] uppercase tracking-[0.4em] font-bold text-[#8E7A60] mb-8 block">
            Join The Movement
          </span>

          {/* Animated divider */}
          <div className="line-reveal mx-auto mb-10" style={{ background: 'rgba(142,122,96,0.4)' }} />

          <h2 className="text-5xl md:text-7xl font-serif mb-12 reveal-element delay-100">
            Elevate your <span className="italic text-[#8E7A60]">standard.</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 reveal-element delay-200">
            <Link 
              to="/home" 
              className="btn-shimmer cta-pulse px-14 py-5 bg-[#F8F6F0] text-[#111111] text-sm font-medium tracking-[0.2em] uppercase hover:bg-[#8E7A60] hover:text-[#F8F6F0] transition-colors"
            >
              Enter Marketplace
            </Link>
            <Link 
              to="/signup" 
              className="btn-shimmer px-14 py-5 border border-[#F8F6F0]/30 text-[#F8F6F0] text-sm font-medium tracking-[0.2em] uppercase hover:bg-[#F8F6F0]/10 transition-colors"
            >
              Vendor Portal
            </Link>
          </div>

          <div className="mt-20 reveal-element delay-300">
            <Link 
              to="/admin" 
              className="hover-underline-anim text-[10px] uppercase tracking-[0.3em] font-bold text-[#F8F6F0]/30 hover:text-[#8E7A60] transition-colors"
            >
              Platform Administration
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}