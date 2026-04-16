import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductCard } from '../components/Card'

// Dummy Data to test the Editorial UI
const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "Unbothered Elixir",
    price: "4500",
    image: "https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800",
    vendorName: "Wellness Collective",
    description: "A soothing blend designed for the modern lifestyle."
  },
  {
    id: 2,
    name: "Radiance Body Oil",
    price: "3200",
    image: "https://images.pexels.com/photos/4465121/pexels-photo-4465121.jpeg?auto=compress&cs=tinysrgb&w=800",
    vendorName: "Aura Essentials",
    description: "Golden-pressed oils for a natural, healthy glow."
  },
  {
    id: 3,
    name: "The Essential Balm",
    price: "1850",
    image: "https://images.pexels.com/photos/4465829/pexels-photo-4465829.jpeg?auto=compress&cs=tinysrgb&w=800",
    vendorName: "Minimalist Skincare",
    description: "All-natural balm for multi-purpose hydration."
  },
  {
    id: 4,
    name: "Ceramic Incense Plate",
    price: "2400",
    image: "https://images.pexels.com/photos/6636283/pexels-photo-6636283.jpeg?auto=compress&cs=tinysrgb&w=800",
    vendorName: "Handmade Studio",
    description: "Minimalist ceramic pieces fired in a traditional kiln."
  }
]



/* ─── Scroll-triggered reveal hook ─── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io  = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el    = e.target
          const cls   = el.dataset.reveal   || 'hp-fade-up'
          const delay = el.dataset.delay    || '0'
          el.style.animationDelay = delay + 'ms'
          el.classList.add(...cls.split(' '))
          io.unobserve(el)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export const HomePage = () => {

  const [searchTerm, setSearchTerm]   = useState('')
  const [sortOrder,  setSortOrder]    = useState('newest')
  const [products]                    = useState(DUMMY_PRODUCTS)
  const navigate                      = useNavigate()

  useReveal()

  const filteredProducts = useMemo(() => {
    let r = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendorName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (sortOrder === 'price_asc')  r = [...r].sort((a,b) => +a.price - +b.price)
    if (sortOrder === 'price_desc') r = [...r].sort((a,b) => +b.price - +a.price)
    return r
  }, [searchTerm, sortOrder, products])

  return (
    <div className="hp-grain min-h-screen bg-[#F8F6F0] pt-40 pb-32 font-sans overflow-x-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── HEADER ── */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span
              data-reveal="hp-fade-up"
              data-delay="0"
              className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#8E7A60] mb-4 block"
            >
              Storefront
            </span>
            <h1
              data-reveal="hp-fade-up"
              data-delay="120"
              className="text-6xl md:text-7xl font-serif text-[#111111]"
            >
              The <span className="italic">Collection.</span>
            </h1>
          </div>

          {/* product count badge */}
          <div
            data-reveal="hp-fade-in"
            data-delay="300"
            className="self-end md:self-auto"
          >
            <span className="hp-badge inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] font-bold text-[#8E7A60] border border-[#8E7A60]/30 px-5 py-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8E7A60] inline-block" />
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </header>

        {/* ── DIVIDER LINE ── */}
        <div
          data-reveal="hp-line"
          data-delay="200"
          className="h-[1px] bg-[#111111]/10 mb-12"
        />

        {/* ── SEARCH + SORT BAR ── */}
        <div
          data-reveal="hp-fade-up"
          data-delay="250"
          className="mb-16 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
        >
          {/* Search */}
          <div className="hp-search flex-1 flex items-center gap-3 border border-[#111111]/10 bg-white/60 backdrop-blur-sm px-5 py-3.5 transition-all duration-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E7A60" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search products or vendors…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-[#111111] placeholder-[#8E7A60]/50 text-[14px] tracking-wide focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#8E7A60]/60 hover:text-[#111111] transition-colors text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="hp-select border border-[#111111]/10 bg-white/60 backdrop-blur-sm text-[#111111] text-[12px] uppercase tracking-[0.2em] font-bold px-5 py-3.5 focus:outline-none focus:border-[#8E7A60] transition-colors cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </div>

        {/* ── PRODUCT GRID ── */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                data-reveal="hp-fade-up"
                data-delay={String(index * 90 + 300)}
                className="hp-card cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Image */}
                <div className="hp-img relative aspect-[3/4] overflow-hidden bg-[#EBE7DF] mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* hover overlay */}
                  <div className="hp-overlay absolute inset-0 bg-[#111111]/40 flex items-end p-5">
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`) }}
                      className="hp-btn-shimmer w-full text-[#F8F6F0] text-[11px] uppercase tracking-[0.25em] font-bold py-3.5 transition-all duration-300"
                    >
                      View Product
                    </button>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8E7A60] mb-1">
                      {product.vendorName}
                    </p>
                    <h3 className="text-[17px] font-serif text-[#111111] leading-snug">
                      {product.name}
                    </h3>
                  </div>
                  <span className="text-[15px] font-medium text-[#111111] whitespace-nowrap pt-0.5">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
            <span className="font-serif italic text-4xl text-[#111111]/20">Nothing found.</span>
            <button
              onClick={() => setSearchTerm('')}
              className="hp-ul-link text-[11px] uppercase tracking-[0.3em] font-bold text-[#8E7A60]"
            >
              Clear search
            </button>
          </div>
        )}

        {/* ── BOTTOM MARQUEE ── */}
        <div
          data-reveal="hp-fade-in"
          data-delay="500"
          className="mt-32 border-t border-[#111111]/8 pt-10 overflow-hidden"
        >
          <div className="hp-marquee-inner select-none">
            {[...Array(2)].map((_, ri) => (
              <span key={ri} className="flex items-center">
                {['Verified Vendors', 'Secure Checkout', 'Real-time Tracking', 'Curated Commerce', 'Artisan Goods', 'Premium Quality'].map((t, i) => (
                  <span key={i} className="flex items-center">
                    <span className="font-serif italic text-[22px] text-[#111111]/20 mx-10 whitespace-nowrap">{t}</span>
                    <span className="w-1 h-1 rounded-full bg-[#8E7A60]/40 mx-2" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}