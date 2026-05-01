import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

// ─── Static Data ──────────────────────────────────────────
const DUMMY_OFFERS = [
  { title: "Get 10% off on first order with code GUJJU10" },
  { title: "Free shipping on orders above ₹500" },
  { title: "Buy 2 Get 1 Free on all Namkeen items" },
];

const DEAL_PRODUCTS = [
  { id: 1, name: "Methi Thepla (250g)",           price: "120", originalPrice: "150", discount: 20, image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80", stock_quantity: 20, vendor: "Raju Farsan Wala",     rating: 4.7, reviews: 312 },
  { id: 2, name: "Khakhra Masala (200g)",          price: "90",  originalPrice: "110", discount: 18, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80", stock_quantity: 20, vendor: "Raju Farsan Wala",     rating: 4.6, reviews: 245 },
  { id: 3, name: "Ganthiya Chickpea (300g)",       price: "140", originalPrice: "170", discount: 18, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", stock_quantity: 30, vendor: "Raju Farsan Wala",     rating: 4.8, reviews: 410 },
  { id: 4, name: "Fafda & Jalebi Combo",           price: "220", originalPrice: "260", discount: 15, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80", stock_quantity: 40, vendor: "Raju Farsan Wala",     rating: 4.9, reviews: 520 },
  { id: 5, name: "Kachi Keri Mango Pickle (500g)", price: "280", originalPrice: "340", discount: 18, image: "https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=600&q=80", stock_quantity: 40, vendor: "Amba Achar House",     rating: 4.9, reviews: 612 },
  { id: 6, name: "Garam Masala Stone-Ground",      price: "180", originalPrice: "220", discount: 18, image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80", stock_quantity: 20, vendor: "Saurashtra Spice Mill", rating: 4.8, reviews: 445 },
  { id: 7, name: "Kaju Katli Premium (500g)",      price: "720", originalPrice: "850", discount: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80", stock_quantity: 20, vendor: "Manek Chowk Sweets",   rating: 4.9, reviews: 612 },
  { id: 8, name: "Masala Chai Blend",              price: "130", originalPrice: "230", discount: 43, image: "https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=600&q=80", stock_quantity: 40, vendor: "Surti Tea Co.",       rating: 4.9, reviews: 890 },
];

const PROMO_BANNERS = [
  { id: 1, tag: "Premium Quality", title: "Artisanal Sweets.", desc: "Authentic flavors in every bite.", btnText: "Explore Collection", btnLink: "/shop?category=1", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", dark: false, bg: "#faf9f6ff", accent: "#3D2616" },
  { id: 2, tag: "Freshly Ground",  title: "Roasted Coffee.",  desc: "Premium, hand-picked beans.",       btnText: "Shop Coffee",        btnLink: "/shop?category=2", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80", dark: false, bg: "#faf9f6ff", accent: "#5A3825" },
];

const CUSTOMER_REVIEWS = [
  { id: 1, name: "Priya Sharma", role: "Verified Buyer", text: "The quality of the dry fruits is exceptional. Packaging was very neat and delivery was on time!", rating: 5, avatar: "https://i.pravatar.cc/150?u=priya" },
  { id: 2, name: "Rahul Patel", role: "Verified Buyer", text: "Authentic snacks! The taste reminds me of my hometown. Highly recommend it.", rating: 5, avatar: "https://i.pravatar.cc/150?u=rahul" },
  { id: 3, name: "Anita Desai", role: "Verified Buyer", text: "Beautiful handicraft items. The mirror work is so intricate and the colors are vibrant.", rating: 4.5, avatar: "https://i.pravatar.cc/150?u=anita" },
];

const DUMMY_VENDORS = [
  { id: 1, name: "Raju Farsan Wala",   desc: "Crispy snacks...",       rating: 4.8 },
  { id: 2, name: "Amba Achar House",   desc: "Sun-dried Gujarat...",   rating: 4.9 },
  { id: 3, name: "Surat Silk Store",   desc: "Handwoven...",           rating: 4.7 },
  { id: 4, name: "Kutch Handicrafts",  desc: "Mirror-work artistry",   rating: 4.9 },
  { id: 5, name: "Manek Chowk Sweets", desc: "Mithai from old city",   rating: 4.8 },
  { id: 6, name: "Saurashtra Spices",  desc: "Stone-ground...",        rating: 4.6 },
  { id: 7, name: "Bhavnagar Dryfruits",desc: "Premium kaju &...",      rating: 4.9 },
  { id: 8, name: "Patola Heritage",    desc: "Patan double-ikat...",   rating: 5.0 },
];

const getCategoryImage = (name) => {
  const l = name.toLowerCase();
  if (l.includes("grocer")) return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80";
  if (l.includes("snack") || l.includes("namkeen")) return "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80";
  if (l.includes("pickle")) return "https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400&q=80";
  if (l.includes("spice") || l.includes("masala")) return "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80";
  if (l.includes("sweet") || l.includes("mithai")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80";
  if (l.includes("dry fruit") || l.includes("dryfruit")) return "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80";
  if (l.includes("handicraft")) return "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&q=80";
  if (l.includes("cloth")) return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80";
  if (l.includes("pooja")) return "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&q=80";
  if (l.includes("coffee") || l.includes("tea")) return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80";
  return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80";
};

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex text-amber-400 text-xs leading-none">
      {"★".repeat(full)}{half ? "½" : ""}
    </span>
  );
};

export const HomePage = () => {
  const [data, setData]             = useState({ categories: [], featured_products: [], new_products: [], offers: [], vendors: [] });
  const [wishlist, setWishlist]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("All");
  const [bannerSlide, setBannerSlide] = useState(0);
  const bannerTimerRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    bannerTimerRef.current = setInterval(() => setBannerSlide((p) => (p + 1) % PROMO_BANNERS.length), 4500);
    return () => clearInterval(bannerTimerRef.current);
  }, []);

  useEffect(() => {
    api.get("/homepage/").then((res) => {
      setData({
        categories:        res.data.categories || [],
        featured_products: res.data.featured_products?.length > 0 ? res.data.featured_products : DEAL_PRODUCTS,
        new_products:      res.data.new_products?.length > 0      ? res.data.new_products      : DEAL_PRODUCTS,
        offers:            DUMMY_OFFERS,
        vendors:           res.data.vendors || [],
      });
      setLoading(false);
    }).catch(() => {
      setData({
        categories: [
          { id: 1, name: "Groceries" },  { id: 2, name: "Snacks" },    { id: 3, name: "Pickles" },
          { id: 4, name: "Spices" },     { id: 5, name: "Sweets" },    { id: 6, name: "Dry Fruits" },
          { id: 7, name: "Handicrafts" },{ id: 8, name: "Clothing" },  { id: 9, name: "Pooja Items" },
        ],
        featured_products: DEAL_PRODUCTS,
        new_products:      DEAL_PRODUCTS,
        offers:            DUMMY_OFFERS,
        vendors:           [],
      });
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    try {
      const gw = JSON.parse(localStorage.getItem("guestWishlist")) || [];
      setWishlist(gw.map((i) => i.product.id));
    } catch {}
  }, [isAuthenticated, user]);

  const handleAddToCart = async (e, product) => {
    if (e) e.stopPropagation();
    if (isAuthenticated) {
      if (user?.role === "vendor" || user?.role === "admin")
        return toast.error(`${user.role}s cannot buy products.`);
      try {
        await api.post("/cart/add/", { product_id: product.id, quantity: 1 });
        toast.success("Added to cart!");
      } catch (err) { toast.error(err.response?.data?.error || "Failed to add to cart."); }
    } else {
      let gc = [];
      try { gc = JSON.parse(localStorage.getItem("guestCart")) || []; } catch {}
      const existing = gc.find((i) => i.product_id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock_quantity)
          return toast.error(`Only ${product.stock_quantity} available.`);
        existing.quantity += 1;
      } else {
        if (product.stock_quantity < 1) return toast.error("Out of stock.");
        gc.push({ product_id: product.id, quantity: 1, product_details: product });
      }
      localStorage.setItem("guestCart", JSON.stringify(gc));
      toast.success("Added to cart!");
    }
  };

  const handleToggleWishlist = async (e, product) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]);
    toast.success("Wishlist updated");
  };

  const filteredProducts = activeTab === "All"
    ? data.new_products
    : data.new_products.filter((p) => p.category === activeTab);

  if (loading)
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[var(--bg-main)]">
        <div className="w-10 h-10 border-4 border-[#A87C51]/30 border-t-[#A87C51] rounded-full animate-spin" />
      </div>
    );

  const getDiscount = (price, original) =>
    original ? Math.round(((original - price) / original) * 100) : null;

  // ─── Sub-components ────────────────────────────────────────────────────────

  const SectionHead = ({ title, link, subtitle }) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-[var(--coffee-brown)]/10 pb-5 gap-4">
      <div className="relative">
        <span className="text-[var(--coffee-brown)] text-xs font-bold uppercase tracking-[0.2em] block mb-2">{subtitle || "Discover"}</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] tracking-tight">{title}</h2>
        <div className="absolute -bottom-[21px] left-0 w-16 h-1 bg-[var(--coffee-brown)] rounded-full"></div>
      </div>
      {link && (
        <Link to={link} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[var(--coffee-brown)] hover:gap-3 transition-all">
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </Link>
      )}
    </div>
  );

  const ProductCard = ({ p }) => {
    const isWishlisted = wishlist.includes(p.id);
    const discount     = p.discount || getDiscount(Number(p.price), Number(p.originalPrice));

    let displayVendor = "Verified Seller";
    if (p.vendor_shop) {
      displayVendor = p.vendor_shop;
    } else if (p.vendor_name) {
      displayVendor = p.vendor_name;
    } else if (p.vendor && isNaN(p.vendor)) {
      displayVendor = p.vendor;
    } else if (p.vendor && data.vendors) {
      const vObj = data.vendors.find(v => v.id === Number(p.vendor));
      if (vObj) {
        displayVendor = vObj.shop_name || vObj.name || vObj.store_name || vObj.vendor_name || vObj.username || "Verified Seller";
      }
    }

    return (
      <div className="group bg-white rounded-[1.5rem] overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-[var(--coffee-brown)]/10 transition-all duration-500 relative border border-[var(--coffee-brown)]/10 hover:border-[var(--coffee-brown)]/40 hover:-translate-y-2 h-full">
        {/* Top Image Area */}
        <div className="relative bg-gradient-to-br from-[#F8F9FA] to-[#F1F3F5] overflow-hidden flex items-center justify-center p-4" style={{ aspectRatio: "1/1" }}>
          <Link to={`/product/${p.id}`} className="block w-full h-full relative z-10">
            <img
              src={p.image} alt={p.name}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </Link>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--coffee-brown)_0%,transparent_70%)] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500"></div>
          
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-[#FF5722] text-white text-[11px] font-black px-2.5 py-1.5 rounded-lg shadow-md z-20 tracking-wider">
              {discount}% OFF
            </span>
          )}
          <button
            type="button" onClick={(e) => handleToggleWishlist(e, p)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 rounded-full flex items-center justify-center hover:bg-red-50 hover:scale-110 hover:border-red-100 transition-all duration-300 z-20 group/wishlist"
          >
            <svg className={`w-5 h-5 transition-colors duration-300 ${isWishlisted ? "text-red-500 fill-current scale-110" : "text-gray-400 group-hover/wishlist:text-red-500"}`} fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>

        {/* Info Area */}
        <div className="p-5 flex flex-col flex-grow bg-white relative z-10">
          <Link to={`/product/${p.id}`}>
            <h3 className="text-lg font-black text-[#2C1E16] leading-snug line-clamp-2 group-hover:text-[var(--coffee-brown)] transition-colors duration-300">
              {p.name}
            </h3>
          </Link>
          <p className="text-[13px] font-bold text-gray-400 mt-1.5 mb-5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            {displayVendor}
          </p>

          <div className="mt-auto flex flex-col gap-4">
            <div className="flex flex-col">
              {p.originalPrice && (
                <span className="text-gray-400 line-through text-xs font-bold mb-1">₹{p.originalPrice}</span>
              )}
              <span className="font-black text-2xl text-[#2C1E16] leading-none tracking-tight">₹{parseFloat(p.price).toLocaleString()}</span>
            </div>
            
            <button
              type="button" onClick={(e) => handleAddToCart(e, p)}
              disabled={p.stock_quantity <= 0}
              className={`w-full py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-300 group/btn border-2 ${p.stock_quantity <= 0 ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed' : 'bg-transparent border-[#A87C51] text-[#A87C51] hover:bg-[#A87C51] hover:text-white hover:shadow-xl hover:shadow-[#A87C51]/20'}`}
            >
              {p.stock_quantity <= 0 ? "Out of Stock" : (
                <>
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#FAF3E8] min-h-screen font-sans text-gray-800">

      {/* ── Offer Ticker ─────────────────────────────────────── */}
      <div className="w-full py-3.5 bg-[var(--coffee-brown)] text-[#FAF3E8] overflow-hidden shadow-sm">
        <div className="marquee-content flex w-max">
          {[1, 2].map((_, groupIdx) => (
            <div key={groupIdx} className="flex items-center w-max">
              {[...data.offers, ...data.offers, ...data.offers].map((o, idx) => (
                <span key={idx} className="mx-10 flex items-center gap-3 text-xs font-bold tracking-[0.15em] uppercase whitespace-nowrap">
                  <span className="text-[var(--coffee-light)] text-base">✦</span> {o.title}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Container ───────────────────────────────────── */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Hero Banner ───────────────────────────────────────── */}
        <div className="relative h-[450px] lg:h-[550px] mt-6 lg:mt-8 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-xl shadow-[var(--coffee-brown)]/5 bg-white border border-[var(--coffee-brown)]/10">
          {PROMO_BANNERS.map((banner, idx) => (
            <div
              key={banner.id}
              className="absolute inset-0 flex flex-col md:flex-row items-center transition-opacity duration-1000"
              style={{ backgroundColor: banner.bg, opacity: idx === bannerSlide ? 1 : 0, zIndex: idx === bannerSlide ? 1 : 0 }}
            >
              <div className="relative z-20 w-full md:w-1/2 p-8 lg:p-20 flex flex-col justify-center h-full">
                <span className="text-xs lg:text-sm font-bold uppercase tracking-widest mb-4 inline-block px-4 py-1.5 rounded-full bg-white/60 w-max backdrop-blur-md shadow-sm" style={{ color: banner.accent }}>
                  {banner.tag}
                </span>
                <h1 className={`font-outfit text-5xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight ${banner.dark ? "text-white" : "text-[var(--text-dark)]"}`}>
                  {banner.title}
                </h1>
                <p className={`text-base lg:text-lg mb-8 max-w-md font-medium leading-relaxed ${banner.dark ? "text-white/80" : "text-gray-600"}`}>
                  {banner.desc}
                </p>
                <Link
                  to={banner.btnLink}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--coffee-brown)] text-white text-base font-bold px-8 py-4 rounded-xl hover:bg-opacity-90 hover:-translate-y-1 transition-all w-max shadow-lg shadow-[var(--coffee-brown)]/30"
                >
                  {banner.btnText}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
              </div>
              <div className="absolute right-0 top-0 h-full w-full md:w-[60%] opacity-30 md:opacity-100 z-10">
                <img src={banner.image} alt="" className="w-full h-full object-cover md:rounded-l-[5rem]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-color)] via-[var(--bg-color)]/80 to-transparent md:hidden" style={{ '--bg-color': banner.bg }} />
              </div>
            </div>
          ))}
          {/* Dots */}
          <div className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {PROMO_BANNERS.map((_, idx) => (
              <button
                key={idx} onClick={() => setBannerSlide(idx)}
                className={`rounded-full transition-all duration-300 ${idx === bannerSlide ? "w-10 h-2.5 bg-[var(--coffee-brown)] shadow-sm" : "w-2.5 h-2.5 bg-gray-400/50 hover:bg-gray-400"}`}
              />
            ))}
          </div>
        </div>

        {/* ── Category Slider (FoodMart Style) ──────────────── */}
        <section className="py-8 lg:py-12">
          <SectionHead title="Shop by Category" link="/shop" subtitle="Top Categories" />
          <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x md:justify-center">
            {data.categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="snap-start flex-shrink-0 w-36 h-36 sm:w-44 sm:h-44 relative rounded-[2rem] overflow-hidden group hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 filter blur-[2px] group-hover:blur-[0px]"
                  style={{ backgroundImage: `url(${cat.image || getCategoryImage(cat.name)})` }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-white text-base sm:text-lg font-extrabold text-center tracking-wide drop-shadow-md">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Promo Banners (2 Column) ─────────────────────── */}
        <section className="py-6 lg:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Banner 1 – Snacks & Sweets */}
            <div className="rounded-[2rem] overflow-hidden h-72 lg:h-80 bg-white flex group cursor-pointer hover:shadow-xl transition-all border border-[var(--coffee-brown)]/10">
              <div className="relative z-10 w-[55%] flex flex-col justify-center p-8 lg:p-10 shrink-0">
                <span className="inline-block px-3 py-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-lg mb-4 shadow-sm w-max">Sale 20% OFF</span>
                <p className="text-3xl lg:text-4xl font-extrabold text-[var(--text-dark)] mb-5 leading-[1.15]">Fresh Snacks &<br/>Sweets</p>
                <Link to="/shop?category=1" className="text-sm font-bold text-[var(--coffee-brown)] hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                  Shop Now <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
              </div>
              <div className="w-[45%] relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80" alt="Snacks" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-l-[2rem]" />
              </div>
            </div>
            {/* Banner 2 – Premium Coffee */}
            <div className="rounded-[2rem] overflow-hidden h-72 lg:h-80 bg-[var(--coffee-brown)] flex group cursor-pointer hover:shadow-xl transition-all border border-[var(--coffee-brown)]/10">
              <div className="relative z-10 w-[55%] flex flex-col justify-center p-8 lg:p-10 shrink-0">
                <span className="inline-block px-3 py-1.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-lg mb-4 shadow-sm w-max">Limited Offer</span>
                <p className="text-3xl lg:text-4xl font-extrabold text-white mb-5 leading-[1.15]">Premium Coffee<br/>Blends</p>
                <Link to="/shop?category=2" className="text-sm font-bold text-[#D4A574] hover:text-[#F0D0A8] hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                  Shop Now <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
              </div>
              <div className="w-[45%] relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80" alt="Coffee" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-l-[2rem]" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Trending Products ───────────────────────────── */}
        <section className="py-8 lg:py-12">
          <SectionHead title="Trending Products" link="/shop?sort=trending" subtitle="Hot Deals" />
          <div className="flex gap-6 lg:gap-8 overflow-x-auto pb-8 pt-4 scrollbar-hide snap-x">
            {data.featured_products.map((p) => (
              <div key={p.id} className="snap-start flex-shrink-0 w-64 sm:w-72 lg:w-[280px]">
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Just Arrived ─────────────────────────────────── */}
        <section className="py-8 lg:py-12">
          <SectionHead title="Just Arrived" link="/shop?sort=new" subtitle="New Additions" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {data.new_products.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>

        {/* ── Shop All (Best Selling) ──────────────────────── */}
        <section className="py-12 lg:py-16 border-t border-[var(--coffee-brown)]/10 mt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[var(--coffee-brown)]/10 pb-5 gap-6 relative">
            <div className="relative">
              <span className="text-[var(--coffee-brown)] text-xs font-bold uppercase tracking-[0.2em] block mb-2">Our Favorites</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[var(--text-dark)] tracking-tight">Best Selling Products</h2>
              <div className="absolute -bottom-[21px] left-0 w-24 h-1 bg-[var(--coffee-brown)] rounded-full"></div>
            </div>
            
            {/* Tab filters */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
              <button
                onClick={() => setActiveTab("All")}
                className={`flex-shrink-0 px-7 py-3 text-sm font-bold rounded-full transition-all ${activeTab === "All" ? "bg-[var(--coffee-brown)] text-white shadow-md shadow-[var(--coffee-brown)]/20" : "bg-[#F8F9FA] text-gray-600 hover:bg-gray-200"}`}
              >
                All
              </button>
              {data.categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex-shrink-0 px-7 py-3 text-sm font-bold rounded-full transition-all ${activeTab === cat.id ? "bg-[var(--coffee-brown)] text-white shadow-md shadow-[var(--coffee-brown)]/20" : "bg-[#F8F9FA] text-gray-600 hover:bg-gray-200"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center bg-white rounded-3xl py-24 border border-[var(--coffee-brown)]/10 shadow-sm">
              <span className="text-5xl mb-6 block">🛒</span>
              <p className="text-gray-500 font-bold text-lg">No products found in this category.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                {filteredProducts.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
              <div className="flex justify-center mt-16">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 border-2 border-[var(--coffee-brown)] text-[var(--coffee-brown)] text-base font-bold px-12 py-4 rounded-xl hover:bg-[var(--coffee-brown)] hover:text-white transition-all shadow-sm hover:shadow-md"
                >
                  View All Products
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
              </div>
            </>
          )}
        </section>

        {/* ── Top Vendors ────────────────────────────────────── */}
        {data.vendors?.length > 0 && (
          <section className="py-12 lg:py-16 border-t border-[var(--coffee-brown)]/10">
            <SectionHead title="Top Vendors" subtitle="Verified Sellers" />
            <div className="bg-white shadow-sm rounded-[2rem] p-8 lg:p-12 flex gap-8 lg:gap-12 overflow-x-auto scrollbar-hide snap-x border border-[var(--coffee-brown)]/10 md:justify-center">
              {data.vendors.map((v, i) => {
                const vendorName = v.shop_name || v.name || v.store_name || v.vendor_name || v.username || `Vendor ${i + 1}`;
                const initials = vendorName.split(" ").map(w => w?.[0] || "").join("").substring(0, 2).toUpperCase();
                return (
                  <Link
                    key={v.id || i}
                    to={`/vendor/${v.id || ''}`}
                    className="snap-start flex-shrink-0 w-28 sm:w-32 flex flex-col items-center gap-3 group"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#C68228] text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-sm group-hover:scale-110 group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 border border-[var(--coffee-light)]/20 overflow-hidden">
                      {v.logo ? <img src={v.logo} alt={vendorName} className="w-full h-full object-cover bg-white" /> : initials}
                    </div>
                    <div className="text-center mt-2 flex flex-col items-center">
                      <h3 className="text-sm font-extrabold text-[var(--text-dark)] truncate w-full max-w-[120px] group-hover:text-[#C68228] transition-colors">{vendorName}</h3>
                      <p className="text-[11px] text-gray-500 truncate w-full max-w-[120px] mb-1.5 font-medium">{v.desc || v.description || "Verified Seller"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Customer Reviews ────────────────────────────────── */}
        <section className="py-12 lg:py-16 border-t border-[var(--coffee-brown)]/10">
          <SectionHead title="What Our Customers Say" subtitle="Testimonials" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {CUSTOMER_REVIEWS.map((r) => (
              <div key={r.id} className="bg-white shadow-sm p-8 rounded-[2rem] border border-[var(--coffee-brown)]/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    <Stars rating={r.rating} />
                  </div>
                  <p className="text-[var(--text-dark)]/80 font-medium italic mb-6 leading-relaxed">"{r.text}"</p>
                </div>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-[var(--coffee-brown)]/10 border border-[var(--coffee-brown)]/20 flex items-center justify-center text-[var(--coffee-brown)] font-extrabold text-sm tracking-wider shrink-0">
                    {r.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[var(--text-dark)]">{r.name}</h4>
                    <span className="text-[11px] font-bold text-[var(--coffee-light)] uppercase tracking-wider">{r.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>



      </div>
    </div>
  );
};