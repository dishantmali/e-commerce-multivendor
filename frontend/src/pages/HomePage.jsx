import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

// ─── Static Data (Kept as requested) ──────────────────────────────────────────
const DUMMY_OFFERS = [
  { title: 'Get 10% off on first order with code GUJJU10', start_date: '01 Jun', end_date: '30 Jun' },
  { title: 'Free shipping on orders above ₹500',          start_date: '01 Jun', end_date: '31 Jul' },
  { title: 'Buy 2 Get 1 Free on all Namkeen items',       start_date: '15 Jun', end_date: '15 Jul' },
];

const DEAL_PRODUCTS = [
  { id: 1,  name: 'Kaju Katli',     price: '280', originalPrice: '420', discount: 33, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', stock_quantity: 20 },
  { id: 13, name: 'Aamrakhand',     price: '150', originalPrice: '250', discount: 40, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',     stock_quantity: 20 },
  { id: 3,  name: 'Filter Coffee',  price: '170', originalPrice: '260', discount: 35, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',  stock_quantity: 30 },
  { id: 7,  name: 'Mango Pickle',   price: '110', originalPrice: '200', discount: 45, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',  stock_quantity: 40 },
  { id: 20, name: 'Masala Chai',    price: '130', originalPrice: '230', discount: 43, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',  stock_quantity: 40 },
];

const RECENTLY_VIEWED = [
  { id: 11, name: 'Sev',               price: '80',  originalPrice: '100', stock_quantity: 70, category: 6, rating: 4.7, reviews: 1100, badge: 'Popular',     image: 'https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400&q=80' },
  { id: 12, name: 'Bhujia',            price: '75',  originalPrice: '95',  stock_quantity: 65, category: 6, rating: 4.5, reviews: 890,  badge: null,          image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80' },
  { id: 13, name: 'Aamrakhand',        price: '200', originalPrice: '250', stock_quantity: 20, category: 1, rating: 4.9, reviews: 2340, badge: 'Top Rated',   image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { id: 14, name: 'Espresso Blend',    price: '260', originalPrice: '310', stock_quantity: 18, category: 2, rating: 4.7, reviews: 760,  badge: 'New',         image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
  { id: 15, name: 'Khakhra',           price: '100', originalPrice: '130', stock_quantity: 55, category: 3, rating: 4.6, reviews: 1230, badge: null,          image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80' },
  { id: 16, name: 'Green Chilli Pickle',price: '130',originalPrice: '160', stock_quantity: 30, category: 4, rating: 4.4, reviews: 410,  badge: null,          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
];

const MINI_BANNERS = [
  { label: 'Sweets Fest', sub: 'Up to 40% off', color: 'from-[#F5EFE6] to-[#E8D5BC]', link: '/shop?category=1', emoji: '🍬' },
  { label: 'Coffee Week', sub: 'Premium blends', color: 'from-[#1A110A] to-[#3D2314]', dark: true, link: '/shop?category=2', emoji: '☕' },
  { label: 'Spice Route', sub: 'Fresh & aromatic', color: 'from-[#FAF3E0] to-[#F0E0BA]', link: '/shop?category=5', emoji: '🌶️' },
  { label: 'Namkeen Time', sub: 'Crispy snacks', color: 'from-[#2C1E16] to-[#5A3825]', dark: true, link: '/shop?category=6', emoji: '🥨' },
];

const PROMO_BANNERS = [
  {
    id: 1,
    tag: 'Premium Quality',
    title: 'Artisanal\nSweets.',
    desc: 'Taste the rich tradition and authentic flavors in every bite.',
    btnText: 'Explore Collection',
    btnLink: '/shop?category=1',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    dark: false,
    bg: '#F5EFE6',
    accent: '#A87C51',
  },
  {
    id: 2,
    tag: 'Freshly Ground',
    title: 'Roasted\nCoffee.',
    desc: 'Start your morning right with our premium, hand-picked beans.',
    btnText: 'Shop Coffee',
    btnLink: '/shop?category=2',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    dark: true,
    bg: '#1A110A',
    accent: '#A87C51',
  },
  {
    id: 3,
    tag: 'Crispy & Crunchy',
    title: 'Gujarati\nNamkeen.',
    desc: 'Authentic snacks crafted with generations of tradition and love.',
    btnText: 'Shop Namkeen',
    btnLink: '/shop?category=6',
    image: 'https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=800&q=80',
    dark: false,
    bg: '#FDF6EC',
    accent: '#C97D3A',
  },
  {
    id: 4,
    tag: 'Bold Flavors',
    title: 'Tangy\nPickles.',
    desc: 'Sun-dried, slow-marinated pickles bursting with homemade goodness.',
    btnText: 'Shop Pickles',
    btnLink: '/shop?category=4',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    dark: true,
    bg: '#1C1206',
    accent: '#E8532A',
  },
  {
    id: 5,
    tag: 'Exotic Aromas',
    title: 'Pure\nSpices.',
    desc: 'Farm-to-kitchen spices with zero additives and full flavor.',
    btnText: 'Shop Spices',
    btnLink: '/shop?category=5',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    dark: false,
    bg: '#FFF8F0',
    accent: '#B8620A',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

export const HomePage = () => {
  const [data, setData] = useState({ categories: [], featured_products: [], new_products: [], offers: [], vendors: [] })
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [countdown, setCountdown] = useState({ h: 5, m: 59, s: 45 })
  const [bannerSlide, setBannerSlide] = useState(0)
  const bannerTimerRef = useRef(null)
  const navigate = useNavigate()

  // --- Banner Slider Auto-play ---
  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setBannerSlide(prev => (prev + 1) % PROMO_BANNERS.length);
    }, 4500);
    return () => clearInterval(bannerTimerRef.current);
  }, []);

  const goBannerSlide = (idx) => {
    clearInterval(bannerTimerRef.current);
    setBannerSlide(idx);
    bannerTimerRef.current = setInterval(() => {
      setBannerSlide(prev => (prev + 1) % PROMO_BANNERS.length);
    }, 4500);
  };

  const { user, isAuthenticated } = useAuth()

  // --- Vendor Carousel Logic ---
  const vendorScrollRef = useRef(null);
  const vendorIntervalRef = useRef(null);

  const startVendorScroll = () => {
    clearInterval(vendorIntervalRef.current);
    vendorIntervalRef.current = setInterval(() => {
      if (vendorScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = vendorScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          vendorScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          vendorScrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
        }
      }
    }, 3000);
  };

  const stopVendorScroll = () => { clearInterval(vendorIntervalRef.current); };

  useEffect(() => {
    if (data.vendors && data.vendors.length > 0) { startVendorScroll(); }
    return stopVendorScroll;
  }, [data.vendors]);

  const scrollLeft  = () => vendorScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' });
  const scrollRight = () => vendorScrollRef.current?.scrollBy({ left:  280, behavior: 'smooth' });

  // --- Reviews Carousel Logic & Static Data ---
  const reviewScrollRef = useRef(null);
  const reviewIntervalRef = useRef(null);

  const staticReviews = [
    { name: "Dishant Mali",  rating: 5, text: "Absolutely love the authentic taste! The sweets were fresh, perfectly packed, and delivered right on time." },
    { name: "Rahul Sharma",  rating: 4, text: "Great coffee selection. The UI is very smooth. Delivery was a bit slow, but the quality makes up for it." },
    { name: "Priyal Patel",  rating: 5, text: "Best place to get local Gujarati delicacies. The vendor responsiveness is top-notch. Will definitely order again!" },
    { name: "Amit Kumar",    rating: 5, text: "The user interface is so smooth and the wishlist feature makes it so easy to save my favorite items." },
    { name: "Sneha Desai",   rating: 4, text: "Really good experience overall. The roasted blends are incredibly aromatic." }
  ];

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const startReviewScroll = () => {
    clearInterval(reviewIntervalRef.current);
    reviewIntervalRef.current = setInterval(() => {
      if (reviewScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = reviewScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          reviewScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          reviewScrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }
    }, 3000);
  };

  const stopReviewScroll  = () => { clearInterval(reviewIntervalRef.current); };

  useEffect(() => {
    startReviewScroll();
    return stopReviewScroll;
  }, []);

  const scrollReviewsLeft  = () => reviewScrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
  const scrollReviewsRight = () => reviewScrollRef.current?.scrollBy({ left:  340, behavior: 'smooth' });

  // ─── Countdown timer for Deal of the Day ───────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 5; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  // --- Fetch Real Data from Backend ---
  useEffect(() => {
    api.get('/homepage/')
      .then(res => {
        setData({
          categories: res.data.categories || [],
          featured_products: res.data.featured_products || [],
          new_products: res.data.new_products || [],
          offers: DUMMY_OFFERS, // Kept static as requested
          vendors: res.data.vendors || [],
          banners: null,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load homepage data:", err);
        setLoading(false);
      });
  }, []);

  // --- Load wishlist from localStorage (guest) ---
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'buyer') {
        try {
          const guestW = JSON.parse(localStorage.getItem('guestWishlist')) || [];
          setWishlist(guestW.map(item => item.product.id));
        } catch (e) {}
      }
    } else {
      try {
        const guestW = JSON.parse(localStorage.getItem('guestWishlist')) || [];
        setWishlist(guestW.map(item => item.product.id));
      } catch (e) {}
    }
  }, [isAuthenticated, user]);

  const handleAddToCart = async (e, product) => {
    if (e) e.stopPropagation();
    if (isAuthenticated) {
      if (user?.role === 'vendor' || user?.role === 'admin') {
        return toast.error(`${user.role}s cannot buy products.`)
      }
      try {
        await api.post('/cart/add/', { product_id: product.id, quantity: 1 });
        toast.success("Added to cart!");
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to add to cart.");
      }
    } else {
      let guestCart = [];
      try {
        const stored = JSON.parse(localStorage.getItem('guestCart'));
        if (Array.isArray(stored)) guestCart = stored;
      } catch (e) {}
      const existingItem = guestCart.find(item => item.product_id === product.id);
      if (existingItem) {
        if (existingItem.quantity + 1 > product.stock_quantity) {
          return toast.error(`Cannot add. Only ${product.stock_quantity} available.`);
        }
        existingItem.quantity += 1;
      } else {
        if (product.stock_quantity < 1) return toast.error("Out of stock.");
        guestCart.push({ product_id: product.id, quantity: 1, product_details: product });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      toast.success("Added to cart!");
    }
  }

  const handleToggleWishlist = async (e, product) => {
    if (e) e.stopPropagation();
    if (isAuthenticated) {
      if (user?.role === 'vendor' || user?.role === 'admin') return toast.error(`${user.role}s cannot use wishlists.`);
      try {
        const res = await api.post('/wishlist/toggle/', { product_id: product.id });
        if (res.data.added) {
          toast.success("Added to wishlist!");
          setWishlist(prev => [...prev, product.id]);
        } else {
          toast.success("Removed from wishlist!");
          setWishlist(prev => prev.filter(id => id !== product.id));
        }
      } catch (err) {
        toast.error("Failed to update wishlist.");
      }
    } else {
      let guestWishlist = [];
      try {
        const stored = JSON.parse(localStorage.getItem('guestWishlist'));
        if (Array.isArray(stored)) guestWishlist = stored;
      } catch (e) {}
      const exists = guestWishlist.find(item => item.product.id === product.id);
      if (exists) {
        guestWishlist = guestWishlist.filter(item => item.product.id !== product.id);
        setWishlist(prev => prev.filter(id => id !== product.id));
        toast.success("Removed from wishlist!");
      } else {
        guestWishlist.push({ product: product });
        setWishlist(prev => [...prev, product.id]);
        toast.success("Added to wishlist!");
      }
      localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
    }
  }

  const filteredProducts = activeTab === 'All'
    ? data.new_products
    : data.new_products.filter(p => p.category === activeTab);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center text-[#5A3825]">
      <div className="inline-flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#A87C51]/30 border-t-[#A87C51] rounded-full animate-spin" />
        <span className="text-lg font-medium text-[#5A3825]/70">Loading delicious products…</span>
      </div>
    </div>
  );

  // ─── Discount % helper ──────────────────────────────────────────────────────
  const getDiscount = (price, original) => {
    if (!original) return null;
    return Math.round(((original - price) / original) * 100);
  };

  const renderProductGrid = (products, limit = 12, cols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-4") => (
    <div className={`stagger-children grid ${cols} gap-5`}>
      {products.slice(0, limit).map(p => {
        const isWishlisted = wishlist.includes(p.id);
        const discount = getDiscount(Number(p.price), Number(p.originalPrice));
        return (
          <div
            key={p.id}
            onClick={() => navigate(`/product/${p.id}`)}
            className="product-card-anim animate-fade-in-up group cursor-pointer bg-white rounded-2xl border border-[#A87C51]/20 overflow-hidden relative transition-all duration-300 hover:shadow-[0_8px_30px_rgba(90,56,37,0.15)] hover:-translate-y-1"
          >
            {/* Image */}
            <div className="relative aspect-square bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
              <img
                src={p.image}
                alt={p.name}
                className="product-thumb w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              />

              {/* Wishlist btn */}
              <button
                type="button"
                onClick={(e) => handleToggleWishlist(e, p)}
                className="wishlist-btn absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white rounded-full shadow-md z-10 transition-all duration-200 hover:scale-110"
              >
                <svg className={`heart-icon w-4 h-4 fill-current ${isWishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`} viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              {/* Out of stock */}
              {p.stock_quantity <= 0 && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wide">OUT OF STOCK</span>
                </div>
              )}

              {/* Discount badge */}
              {discount && discount > 0 && (
                <span className="absolute top-2.5 left-2.5 bg-[#E8532A] text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                  {discount}% OFF
                </span>
              )}

              {/* Product badge */}
              {p.badge && !p.stock_quantity <= 0 && (
                <span className="absolute bottom-2.5 left-2.5 bg-[#2C1E16]/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full z-10 backdrop-blur-sm">
                  {p.badge}
                </span>
              )}

              {/* Add to cart hover btn */}
              {p.stock_quantity > 0 && (
                <button
                  type="button"
                  onClick={(e) => handleAddToCart(e, p)}
                  className="add-cart-btn absolute bottom-3 left-1/2 -translate-x-1/2 w-[85%] bg-[#5A3825] text-white py-2.5 rounded-full shadow-lg text-sm font-bold tracking-wider z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                >
                  Add to Cart
                </button>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3.5">
              <h3 className="font-semibold text-[#2C1E16] text-sm leading-snug mb-1.5 truncate group-hover:text-[#A87C51] transition-colors">
                {p.name}
              </h3>

              {/* Rating */}
              {p.rating && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    {p.rating} ★
                  </span>
                  <span className="text-gray-400 text-[11px]">({p.reviews?.toLocaleString()})</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[#2C1E16] font-bold text-base">₹{parseFloat(p.price).toLocaleString()}</span>
                {p.originalPrice && (
                  <span className="text-gray-400 line-through text-xs">₹{p.originalPrice}</span>
                )}
                {discount && discount > 0 && (
                  <span className="text-[#E8532A] text-xs font-semibold">{discount}% off</span>
                )}
              </div>

              {/* Free delivery tag */}
              {Number(p.price) >= 199 && (
                <p className="text-green-700 text-[10px] font-medium mt-1.5">✓ Free Delivery</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )

  return (
    <div className="font-sans bg-[#F7F2EC] pb-16">

      {/* ── Offer / Welcome Ticker ───────────────────────────────────────── */}
      <div className="w-full py-2.5 bg-[#A87C51] text-white overflow-hidden border-y border-[#5A3825]">
        <div className="flex whitespace-nowrap overflow-hidden">
          <div className="animate-scroll hover-pause flex items-center cursor-pointer">
            {data.offers && data.offers.length > 0 ? (
              [...data.offers, ...data.offers, ...data.offers, ...data.offers].map((offer, idx) => (
                <div key={idx} className="flex items-center mx-6 text-sm md:text-base font-medium tracking-wide">
                  <span className="bg-white text-[#5A3825] px-3 py-0.5 rounded-full text-xs font-bold uppercase mr-3 shadow-sm">LIVE OFFER</span>
                  <span>{offer.title}</span>
                  <span className="ml-2 opacity-80">({offer.start_date} to {offer.end_date})</span>
                  <span className="mx-8 text-[#5A3825]">✦</span>
                </div>
              ))
            ) : (
              [...Array(10)].map((_, idx) => (
                <div key={idx} className="flex items-center mx-6 text-sm font-medium">
                  <span className="bg-white text-[#5A3825] px-3 py-0.5 rounded-full text-xs font-bold uppercase mr-3">WELCOME</span>
                  <span>Welcome to Gujju Ni Dukan!</span>
                  <span className="mx-8 text-[#5A3825]">✦</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-10 mt-4">
        <div className="text-center mb-7">
          <span className="text-[#A87C51] font-bold tracking-widest uppercase text-xs">Browse</span>
          <h2 className="animate-fade-in-up text-2xl font-bold text-[#2C1E16] mt-1">Shop by Category</h2>
        </div>
        <div className="animate-fade-in-up delay-2 flex overflow-x-auto pb-4 gap-5 scrollbar-hide justify-center md:flex-wrap">
          {data.categories.map(cat => (
            <Link key={cat.id} to={`/shop?category=${cat.id}`} className="cat-item min-w-[110px] flex flex-col items-center group">
              <div className="w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-[#A87C51]/20 group-hover:border-[#A87C51] transition-all duration-300 shadow-sm group-hover:shadow-[0_4px_16px_rgba(168,124,81,0.25)] mb-3">
                {cat.image
                  ? <img src={cat.image} className="cat-img w-full h-full object-cover" alt={cat.name} />
                  : <span className="text-[#5A3825] font-bold text-xl">{cat.name.charAt(0)}</span>}
              </div>
              <h3 className="text-[#2C1E16] font-semibold text-xs text-center group-hover:text-[#A87C51] transition-colors">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Promo Banner Slider ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-lg" style={{ minHeight: '300px' }}>

          {/* Slides */}
          {PROMO_BANNERS.map((banner, idx) => (
            <div
              key={banner.id}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center"
              style={{
                backgroundColor: banner.bg,
                opacity: idx === bannerSlide ? 1 : 0,
                pointerEvents: idx === bannerSlide ? 'auto' : 'none',
                zIndex: idx === bannerSlide ? 1 : 0,
              }}
            >
              {/* Dot pattern */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: `radial-gradient(${banner.dark ? '#A87C51' : '#5A3825'} 1px, transparent 1px)`, backgroundSize: '20px 20px', opacity: banner.dark ? 0.06 : 0.04 }} />

              {/* Decorative glow circles */}
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full pointer-events-none"
                style={{ background: `${banner.accent}18` }} />
              <div className="absolute -left-8 -bottom-10 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: `${banner.accent}10` }} />

              {/* Background image strip */}
              <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden">
                <img
                  src={banner.image}
                  alt=""
                  className="w-full h-full object-cover scale-105 transition-transform duration-[6000ms] ease-linear"
                  style={{ transform: idx === bannerSlide ? 'scale(1.1)' : 'scale(1.05)', mixBlendMode: banner.dark ? 'luminosity' : 'multiply' }}
                />
                <div className="absolute inset-0"
                  style={{ background: banner.dark
                    ? `linear-gradient(to right, ${banner.bg} 30%, transparent 80%)`
                    : `linear-gradient(to right, ${banner.bg} 35%, transparent 85%)` }} />
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 md:p-12 max-w-[58%]">
                <span
                  className="inline-block font-bold tracking-[0.25em] uppercase text-[10px] px-3 py-1 rounded-full mb-4"
                  style={{ background: `${banner.accent}25`, color: banner.accent }}
                >
                  {banner.tag}
                </span>
                <h3 className={`text-3xl lg:text-4xl font-black mb-3 leading-[1.1] tracking-tight ${banner.dark ? 'text-white' : 'text-[#2C1E16]'}`}>
                  {banner.title.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
                </h3>
                <p className={`mb-6 text-sm leading-relaxed ${banner.dark ? 'text-white/45' : 'text-[#5A3825]/70'}`}>
                  {banner.desc}
                </p>
                <Link
                  to={banner.btnLink}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold tracking-wider uppercase text-xs transition-colors duration-300 shadow-sm"
                  style={banner.dark
                    ? { border: `1px solid ${banner.accent}`, color: banner.accent }
                    : { background: '#2C1E16', color: '#fff' }}
                  onMouseEnter={e => { e.currentTarget.style.background = banner.accent; e.currentTarget.style.color = banner.dark ? '#1A110A' : '#fff'; e.currentTarget.style.border = 'none'; }}
                  onMouseLeave={e => { if (banner.dark) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = banner.accent; e.currentTarget.style.border = `1px solid ${banner.accent}`; } else { e.currentTarget.style.background = '#2C1E16'; e.currentTarget.style.color = '#fff'; } }}
                >
                  {banner.btnText}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          ))}

          {/* Height placeholder */}
          <div className="invisible pointer-events-none min-h-[260px] md:min-h-[320px]" />

          {/* Prev / Next arrows */}
          <button
            onClick={() => goBannerSlide((bannerSlide - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-[#2C1E16] transition-all duration-200 hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            onClick={() => goBannerSlide((bannerSlide + 1) % PROMO_BANNERS.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-[#2C1E16] transition-all duration-200 hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            {PROMO_BANNERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goBannerSlide(idx)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: idx === bannerSlide ? '22px' : '7px',
                  height: '7px',
                  background: idx === bannerSlide ? '#A87C51' : 'rgba(168,124,81,0.35)',
                }}
              />
            ))}
          </div>

        </div>
      </div>

      {/* ── NEW: Mini Banners 2×2 Grid ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MINI_BANNERS.map((b, i) => (
            <Link
              key={i}
              to={b.link}
              className={`bg-gradient-to-br ${b.color} rounded-2xl p-5 flex flex-col justify-between min-h-[130px] group hover:scale-[1.02] transition-transform duration-300 shadow-sm hover:shadow-md overflow-hidden relative`}
            >
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 select-none">{b.emoji}</div>
              <span className={`text-3xl`}>{b.emoji}</span>
              <div>
                <p className={`font-bold text-sm ${b.dark ? 'text-white' : 'text-[#2C1E16]'}`}>{b.label}</p>
                <p className={`text-xs mt-0.5 ${b.dark ? 'text-[#A87C51]' : 'text-[#5A3825]/70'}`}>{b.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── NEW: Deal of the Day ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mb-14">
        <div className="bg-white rounded-3xl border border-[#A87C51]/20 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 bg-gradient-to-r from-[#2C1E16] to-[#5A3825]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h2 className="text-white font-black text-xl tracking-tight">Deal of the Day</h2>
                <p className="text-[#A87C51] text-xs font-medium">Hurry! Limited stock available</p>
              </div>
            </div>
            {/* Countdown */}
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-xs font-medium uppercase tracking-wider mr-1">Ends in</span>
              {[pad(countdown.h), pad(countdown.m), pad(countdown.s)].map((unit, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="bg-white text-[#2C1E16] font-black text-lg px-2.5 py-1 rounded-lg min-w-[40px] text-center tabular-nums">{unit}</span>
                  {i < 2 && <span className="text-white/60 font-bold text-xl">:</span>}
                </span>
              ))}
              <div className="flex flex-col items-center ml-1 gap-y-[3px]">
                {['HRS', 'MIN', 'SEC'].map((l, i) => (
                  <span key={i} className="text-white/40 text-[8px] font-bold tracking-wider">{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Deal Products */}
          <div className="flex overflow-x-auto gap-4 p-5 pb-6 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-[#FAF8F5] [&::-webkit-scrollbar-thumb]:bg-[#A87C51]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
            {DEAL_PRODUCTS.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="min-w-[160px] max-w-[160px] cursor-pointer group flex flex-col"
              >
                <div className="relative aspect-square bg-[#FAF8F5] rounded-xl overflow-hidden mb-3 border border-[#A87C51]/10">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-400" />
                  <span className="absolute top-2 left-2 bg-[#E8532A] text-white text-[10px] font-black px-2 py-0.5 rounded">
                    {p.discount}% OFF
                  </span>
                </div>
                <h4 className="text-[#2C1E16] font-semibold text-xs truncate group-hover:text-[#A87C51] transition-colors">{p.name}</h4>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-bold text-sm text-[#2C1E16]">₹{p.price}</span>
                  <span className="text-gray-400 line-through text-[10px]">₹{p.originalPrice}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleAddToCart(e, p)}
                  className="mt-2 w-full py-1.5 bg-[#A87C51] hover:bg-[#5A3825] text-white text-[11px] font-bold rounded-lg transition-colors duration-200"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trending & New Arrivals Split Section ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="animate-fade-in-up text-2xl font-bold text-[#2C1E16] flex items-center gap-2">🔥 Trending</h2>
              <Link to="/shop" className="text-[#A87C51] text-sm font-semibold hover:text-[#5A3825] transition-colors">View All →</Link>
            </div>
            {renderProductGrid(data.featured_products, 2, "grid-cols-1 sm:grid-cols-2")}
          </div>
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="animate-fade-in-up text-2xl font-bold text-[#2C1E16] flex items-center gap-2">✨ New Arrivals</h2>
              <Link to="/shop" className="text-[#A87C51] text-sm font-semibold hover:text-[#5A3825] transition-colors">View All →</Link>
            </div>
            {renderProductGrid(data.new_products, 2, "grid-cols-1 sm:grid-cols-2")}
          </div>
        </div>
      </div>

      {/* ── Discover Products (Tabbed) ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-14 mt-2">
        <div className="bg-white rounded-3xl border border-[#A87C51]/15 px-6 py-8 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <span className="text-[#A87C51] font-bold tracking-widest uppercase text-xs mb-1">Our Collection</span>
            <h2 className="animate-fade-in-up text-3xl font-bold text-[#2C1E16] mb-5">Discover Our Products</h2>
            <div className="animate-fade-in-up delay-1 flex flex-wrap justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('All')}
                className={`tab-btn px-5 py-2 rounded-full font-semibold text-sm border transition-all duration-200 ${activeTab === 'All' ? 'bg-[#5A3825] text-white border-[#5A3825] shadow-md' : 'bg-white text-gray-600 border-[#A87C51]/30 hover:border-[#5A3825] hover:text-[#5A3825]'}`}
              >All</button>
              {data.categories.slice(0, 4).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`tab-btn px-5 py-2 rounded-full font-semibold text-sm border transition-all duration-200 ${activeTab === cat.id ? 'bg-[#5A3825] text-white border-[#5A3825] shadow-md' : 'bg-white text-gray-600 border-[#A87C51]/30 hover:border-[#5A3825] hover:text-[#5A3825]'}`}
                >{cat.name}</button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0
            ? <p className="text-center text-gray-500 py-10">No products found for this category.</p>
            : renderProductGrid(filteredProducts, 12)
          }

          <div className="text-center mt-10">
            <Link
              to="/shop"
              className="btn-primary inline-block bg-white text-[#5A3825] border-2 border-[#5A3825] px-10 py-3 rounded-full font-bold hover:bg-[#5A3825] hover:text-white shadow-sm transition-all duration-300"
            >
              Show More Products
            </Link>
          </div>
        </div>
      </div>

      {/* ── Trust / Feature Badges ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🚚', title: 'Free Delivery', sub: 'On orders above ₹500' },
            { icon: '↩️', title: 'Easy Returns', sub: '7-day hassle-free returns' },
            { icon: '🔒', title: 'Secure Payment', sub: '100% safe & encrypted' },
            { icon: '🏆', title: 'Authentic Products', sub: 'Sourced from verified vendors' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#A87C51]/15 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-[#A87C51]/40 transition-all duration-300">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <p className="font-bold text-[#2C1E16] text-sm">{item.title}</p>
                <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top Vendors Carousel ─────────────────────────────────────────────── */}
      <div className="py-16 bg-[#FAF8F5] border-y border-[#A87C51]/20 mt-4 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <span className="text-[#A87C51] font-bold tracking-widest uppercase text-xs">Our Partners</span>
            <h2 className="text-3xl font-bold text-[#2C1E16] mt-2">Trusted Top Vendors</h2>
          </div>
          <div
            ref={vendorScrollRef}
            onMouseEnter={stopVendorScroll}
            onMouseLeave={startVendorScroll}
            onTouchStart={stopVendorScroll}
            onTouchEnd={startVendorScroll}
            className="flex overflow-x-auto gap-5 pb-6 pt-4 px-2 w-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {data.vendors && data.vendors.length > 0 ? (
              [...data.vendors, ...data.vendors, ...data.vendors].map((vendor, idx) => (
                <div
                  key={idx}
                  className="min-w-[220px] md:min-w-[260px] bg-white border border-[#A87C51]/20 rounded-2xl p-7 flex flex-col items-center justify-center snap-center group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(90,56,37,0.12)] hover:border-[#5A3825]"
                >
                  <div className="w-24 h-24 rounded-full bg-[#FAF8F5] mb-5 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm group-hover:border-[#A87C51]/30 transition-all duration-300 group-hover:shadow-[0_6px_20px_rgba(168,124,81,0.2)]">
                    <img src={vendor.logo || '/logo.jpeg'} alt={vendor.shop_name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="font-bold text-[#2C1E16] text-lg text-center group-hover:text-[#A87C51] transition-colors">{vendor.shop_name}</h3>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center w-full">No top vendors available at the moment.</p>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-5">
            <button onClick={scrollLeft} className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#2C1E16] hover:bg-[#FAF8F5] transition-all duration-300 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={scrollRight} className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#2C1E16] hover:bg-[#FAF8F5] transition-all duration-300 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Recently Viewed ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#2C1E16]">🕐 Recently Viewed</h2>
          <Link to="/shop" className="text-[#A87C51] text-sm font-semibold hover:text-[#5A3825] transition-colors">View All →</Link>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-[#FAF8F5] [&::-webkit-scrollbar-thumb]:bg-[#A87C51]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
          {RECENTLY_VIEWED.map(p => {
            const discount = getDiscount(Number(p.price), Number(p.originalPrice));
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="min-w-[150px] max-w-[150px] cursor-pointer group"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#A87C51]/15 mb-2.5 relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-400" />
                  {discount && discount > 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-[#E8532A] text-white text-[9px] font-black px-1.5 py-0.5 rounded">{discount}% OFF</span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-[#2C1E16] truncate group-hover:text-[#A87C51] transition-colors">{p.name}</h4>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-bold text-sm text-[#2C1E16]">₹{p.price}</span>
                  {p.originalPrice && <span className="text-gray-400 line-through text-[10px]">₹{p.originalPrice}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Customer Reviews Carousel ─────────────────────────────────────── */}
      <div className="py-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <span className="text-[#A87C51] font-bold tracking-widest uppercase text-xs">Testimonials</span>
            <h2 className="text-3xl font-bold text-[#2C1E16] mt-2">What Our Customers Say</h2>
          </div>
          <div
            ref={reviewScrollRef}
            onMouseEnter={stopReviewScroll}
            onMouseLeave={startReviewScroll}
            onTouchStart={stopReviewScroll}
            onTouchEnd={startReviewScroll}
            className="flex overflow-x-auto gap-5 pb-6 pt-4 px-2 w-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {[...staticReviews, ...staticReviews, ...staticReviews].map((review, idx) => (
              <div
                key={idx}
                className="min-w-[300px] md:min-w-[340px] bg-white border border-[#A87C51]/20 rounded-2xl p-7 flex flex-col snap-center group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(90,56,37,0.12)] hover:border-[#5A3825]"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A87C51] to-[#5A3825] flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_6px_18px_rgba(168,124,81,0.3)]">
                    {getInitials(review.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C1E16] text-base group-hover:text-[#A87C51] transition-colors">{review.name}</h3>
                    <div className="flex text-yellow-400 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 italic text-sm leading-relaxed relative">
                  <span className="text-4xl text-[#A87C51]/20 absolute -top-4 -left-2 font-serif">"</span>
                  <span className="relative z-10 pl-2">{review.text}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-5">
            <button onClick={scrollReviewsLeft} className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#2C1E16] hover:bg-[#FAF8F5] transition-all duration-300 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={scrollReviewsRight} className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#2C1E16] hover:bg-[#FAF8F5] transition-all duration-300 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Newsletter / App Download strip ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#2C1E16] to-[#5A3825] py-12 mt-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-[#A87C51] uppercase tracking-widest text-xs font-bold">Stay Updated</span>
          <h3 className="text-white font-black text-2xl md:text-3xl mt-2 mb-2">Get Exclusive Deals in Your Inbox</h3>
          <p className="text-white/50 text-sm mb-7">Subscribe and get 10% off your first order, plus weekly offers.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 w-full px-5 py-3 rounded-full text-sm text-[#2C1E16] bg-white border-0 outline-none focus:ring-2 focus:ring-[#A87C51] placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => toast.success("Subscribed! Check your inbox 🎉")}
              className="bg-[#A87C51] hover:bg-[#C49A6C] text-white font-bold px-7 py-3 rounded-full text-sm transition-colors duration-200 whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}