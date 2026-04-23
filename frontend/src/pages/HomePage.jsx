import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const HomePage = () => {
  const [data, setData] = useState({ categories: [], featured_products: [], new_products: [], offers: [], vendors: [] })
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const navigate = useNavigate()

  const { user, isAuthenticated } = useAuth()

  // --- Vendor Carousel Logic ---
  const vendorScrollRef = useRef(null);
  const vendorIntervalRef = useRef(null);

  const startVendorScroll = () => {
    clearInterval(vendorIntervalRef.current);
    vendorIntervalRef.current = setInterval(() => {
      if (vendorScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = vendorScrollRef.current;
        // If reached the end, scroll back to start, else scroll right
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          vendorScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          vendorScrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
        }
      }
    }, 3000);
  };

  const stopVendorScroll = () => {
    clearInterval(vendorIntervalRef.current);
  };

  useEffect(() => {
    if (data.vendors && data.vendors.length > 0) {
      startVendorScroll();
    }
    return stopVendorScroll; // Cleanup on unmount
  }, [data.vendors]);

  const scrollLeft = () => vendorScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' });
  const scrollRight = () => vendorScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' });


  // --- Reviews Carousel Logic & Static Data ---
  const reviewScrollRef = useRef(null);
  const reviewIntervalRef = useRef(null);

  const staticReviews = [
    { name: "Dishant Mali", rating: 5, text: "Absolutely love the authentic taste! The sweets were fresh, perfectly packed, and delivered right on time." },
    { name: "Rahul Sharma", rating: 4, text: "Great coffee selection. The UI is very smooth. Delivery was a bit slow, but the quality makes up for it." },
    { name: "Priyal Patel", rating: 5, text: "Best place to get local Gujarati delicacies. The vendor responsiveness is top-notch. Will definitely order again!" },
    { name: "Amit Kumar", rating: 5, text: "The user interface is so smooth and the wishlist feature makes it so easy to save my favorite items." },
    { name: "Sneha Desai", rating: 4, text: "Really good experience overall. The roasted blends are incredibly aromatic." }
  ];

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
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

  const stopReviewScroll = () => {
    clearInterval(reviewIntervalRef.current);
  };

  useEffect(() => {
    startReviewScroll();
    return stopReviewScroll; // Cleanup on unmount
  }, []);

  const scrollReviewsLeft = () => reviewScrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
  const scrollReviewsRight = () => reviewScrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' });


  // --- API Fetch Logic ---
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const res = await api.get('/homepage/')
        setData(res.data)
      } catch {
        toast.error("Failed to load homepage data.")
      } finally {
        setLoading(false)
      }
    }
    fetchHomepageData()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'buyer') {
        api.get('/wishlist/').then(res => {
          const wData = res.data.results || res.data;
          setWishlist(wData.map(item => item.product.id));
        }).catch(() => { });
      }
    } else {
      try {
        const guestW = JSON.parse(localStorage.getItem('guestWishlist')) || [];
        setWishlist(guestW.map(item => item.product.id));
      } catch (e) { }
    }
  }, [isAuthenticated, user]);

  const handleAddToCart = async (e, product) => {
    if (e) e.stopPropagation();

    if (isAuthenticated) {
      if (user?.role === 'vendor' || user?.role === 'admin') {
        return toast.error(`${user.role}s cannot buy products.`)
      }
      try {
        await api.post('/cart/add/', { product_id: product.id, quantity: 1 })
        toast.success("Added to cart!")
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to add to cart.");
      }
    } else {
      let guestCart = [];
      try {
        const stored = JSON.parse(localStorage.getItem('guestCart'));
        if (Array.isArray(stored)) guestCart = stored;
      } catch (e) { }

      const existingItem = guestCart.find(item => item.product_id === product.id);
      if (existingItem) {
        if (existingItem.quantity + 1 > product.stock_quantity) {
          return toast.error(`Cannot add. Only ${product.stock_quantity} available.`);
        }
        existingItem.quantity += 1;
      } else {
        if (product.stock_quantity < 1) {
          return toast.error("Out of stock.");
        }
        guestCart.push({ product_id: product.id, quantity: 1, product_details: product });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      toast.success("Added to cart!");
    }
  }

  const handleToggleWishlist = async (e, product) => {
    if (e) e.stopPropagation();

    if (isAuthenticated) {
      if (user?.role === 'vendor' || user?.role === 'admin') {
        return toast.error(`${user.role}s cannot use wishlists.`);
      }
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
      } catch (e) { }

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
    <div className="max-w-7xl mx-auto px-4 py-32 text-center text-[#5A3825]">Loading...</div>
  );

  const ProductGrid = ({ products, limit = 12, cols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-4" }) => (
    <div className={`stagger-children grid ${cols} gap-6`}>
      {products.slice(0, limit).map(p => {
        const isWishlisted = wishlist.includes(p.id);
        return (
          <div
            key={p.id}
            onClick={() => navigate(`/product/${p.id}`)}
            className="product-card-anim animate-fade-in-up group cursor-pointer bg-white rounded-xl border border-[#A87C51]/30 p-3 relative"
          >
            <div className="relative aspect-square bg-[#FAF8F5] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
              <img
                src={p.image}
                alt={p.name}
                className="product-thumb w-full h-full object-cover mix-blend-multiply"
              />

              <button
                onClick={(e) => handleToggleWishlist(e, p)}
                className="wishlist-btn absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm z-10"
              >
                <svg
                  className={`heart-icon w-5 h-5 fill-current ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              {p.stock_quantity <= 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                  OUT OF STOCK
                </span>
              )}

              {p.stock_quantity > 0 && (
                <button
                  onClick={(e) => handleAddToCart(e, p)}
                  className="add-cart-btn absolute bottom-3 left-1/2 -translate-x-1/2 w-[85%] bg-[#5A3825] text-white py-2.5 rounded-full shadow-lg text-sm font-bold tracking-wider z-10"
                >
                  Add to Cart
                </button>
              )}
            </div>
            <div className="text-center pb-2">
              <h3 className="text-[#2C1E16] font-medium text-base truncate">{p.name}</h3>
              <p className="text-[#A87C51] font-bold mt-1 text-lg">₹{parseFloat(p.price).toLocaleString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  )

  return (
    <div className="font-sans bg-white pb-16">

      {/* Offer / Welcome Ticker */}
      <div className="w-full py-3 bg-[#A87C51] text-white overflow-hidden border-y border-[#5A3825]">
        <div className="flex whitespace-nowrap overflow-hidden">
          <div className="animate-scroll hover-pause flex items-center cursor-pointer">
            {data.offers && data.offers.length > 0 ? (
              // Show actual offers if they exist
              [...data.offers, ...data.offers, ...data.offers, ...data.offers].map((offer, idx) => (
                <div key={idx} className="flex items-center mx-6 text-sm md:text-base font-medium tracking-wide">
                  <span className="bg-white text-[#5A3825] px-3 py-1 rounded-full text-xs font-bold uppercase mr-3 shadow-sm">
                    LIVE OFFER
                  </span>
                  <span>{offer.title}</span>
                  <span className="ml-2 opacity-80">({offer.start_date} to {offer.end_date})</span>
                  <span className="mx-8 text-[#5A3825]">✦</span>
                </div>
              ))
            ) : (
              // Default Welcome Message if no offers exist
              [...Array(10)].map((_, idx) => (
                <div key={idx} className="flex items-center mx-6 text-sm md:text-base font-medium tracking-wide">
                  <span className="bg-white text-[#5A3825] px-3 py-1 rounded-full text-xs font-bold uppercase mr-3 shadow-sm">
                    WELCOME
                  </span>
                  <span>Welcome to Gujju Ni Dukan!</span>
                  <span className="mx-8 text-[#5A3825]">✦</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12 mt-6">
        <h2 className="animate-fade-in-up text-2xl font-bold text-[#2C1E16] mb-8 text-center">
          Shop by Category
        </h2>
        <div className="animate-fade-in-up delay-2 flex overflow-x-auto pb-4 gap-6 scrollbar-hide justify-center md:flex-wrap">
          {data.categories.map(cat => (
            <Link key={cat.id} to={`/shop?category=${cat.id}`} className="cat-item min-w-[120px] flex flex-col items-center group">
              <div className="w-24 h-24 rounded-2xl bg-[#FAF8F5] flex items-center justify-center overflow-hidden border border-[#A87C51]/20 group-hover:border-[#5A3825] transition-colors mb-3">
                {cat.image
                  ? <img src={cat.image} className="cat-img w-full h-full object-cover" alt={cat.name} />
                  : <span className="text-[#5A3825] font-bold text-xl">{cat.name.charAt(0)}</span>
                }
              </div>
              <h3 className="text-[#2C1E16] font-medium text-sm text-center group-hover:text-[#A87C51] transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Promo Banners */}
      <div className="w-full mt-10 mb-16">
        <div className="flex flex-col md:flex-row w-full min-h-[350px] lg:min-h-[450px]">

          {/* SLOT 1: Custom Banner OR Default Poster 1 */}
          {data.banners && data.banners[0] ? (
            <div className="w-full md:w-1/2 relative overflow-hidden group">
              <img src={data.banners[0].image} alt="Promo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full md:w-1/2 bg-[#F5EFE6] p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent to-[#A87C51]/10 pointer-events-none"></div>
              <div className="absolute -right-32 -top-32 w-96 h-96 bg-white/60 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000 pointer-events-none"></div>

              <div className="relative z-10 w-full max-w-xl mx-auto md:ml-auto md:mr-10 xl:mr-16">
                <span className="text-[#A87C51] font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs mb-3 block">Premium Quality</span>
                <h3 className="text-4xl lg:text-6xl font-black text-[#2C1E16] mb-4 leading-[1.05] tracking-tight">Artisanal<br />Sweets.</h3>
                <p className="text-[#5A3825] mb-8 text-base md:text-lg font-light">Taste the rich tradition and authentic flavors in every single bite.</p>
                <Link to="/shop" className="inline-flex items-center gap-3 bg-[#2C1E16] text-white px-8 py-3 font-bold tracking-widest uppercase text-xs hover:bg-[#A87C51] transition-colors duration-300">
                  Explore Collection
                </Link>
              </div>
            </div>
          )}

          {/* SLOT 2: Custom Banner OR Default Poster 2 */}
          {data.banners && data.banners[1] ? (
            <div className="w-full md:w-1/2 relative overflow-hidden group">
              <img src={data.banners[1].image} alt="Promo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full md:w-1/2 bg-[#1A110A] p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-transparent to-[#A87C51]/10 pointer-events-none"></div>
              <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-[#A87C51]/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000 pointer-events-none"></div>

              <div className="relative z-10 w-full max-w-xl mx-auto md:mr-auto md:ml-10 xl:ml-16">
                <span className="text-[#A87C51] font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs mb-3 block">Freshly Ground</span>
                <h3 className="text-4xl lg:text-6xl font-black text-white mb-4 leading-[1.05] tracking-tight">Roasted<br />Coffee.</h3>
                <p className="text-gray-400 mb-8 text-base md:text-lg font-light">Start your morning right with our premium, hand-picked beans.</p>
                <Link to="/shop" className="inline-flex items-center gap-3 border border-[#A87C51] text-[#A87C51] px-8 py-3 font-bold tracking-widest uppercase text-xs hover:bg-[#A87C51] hover:text-[#1A110A] transition-colors duration-300">
                  Shop Coffee
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- UPDATED: Trending & New Arrivals Split Section --- */}
      <div className="max-w-7xl mx-auto px-4 py-12 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left Side: Trending (Top 2) */}
          <div>
            <h2 className="animate-fade-in-up text-2xl font-bold text-[#2C1E16] mb-6 flex items-center gap-2">
              🔥 Trending
            </h2>
            <ProductGrid
              products={data.featured_products}
              limit={2}
              cols="grid-cols-1 sm:grid-cols-2"
            />
          </div>

          {/* Right Side: New Arrivals (Top 2) */}
          <div>
            <h2 className="animate-fade-in-up text-2xl font-bold text-[#2C1E16] mb-6 flex items-center gap-2">
              ✨ New Arrivals
            </h2>
            <ProductGrid
              products={data.new_products}
              limit={2}
              cols="grid-cols-1 sm:grid-cols-2"
            />
          </div>

        </div>
      </div>

      {/* Discover Products */}
      <div className="max-w-7xl mx-auto px-4 py-16 bg-[#FAF8F5] rounded-2xl">
        <div className="flex flex-col items-center mb-10">
          <h2 className="animate-fade-in-up text-3xl font-bold text-[#2C1E16] mb-6">
            Discover Our Products
          </h2>
          <div className="animate-fade-in-up delay-1 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveTab('All')}
              className={`tab-btn px-6 py-2 rounded-full font-medium text-sm border ${activeTab === 'All' ? 'bg-[#5A3825] text-white border-[#5A3825]' : 'bg-white text-gray-600 border-[#A87C51]/30 hover:border-[#5A3825]'}`}
            >
              All
            </button>
            {data.categories.slice(0, 4).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`tab-btn px-6 py-2 rounded-full font-medium text-sm border ${activeTab === cat.id ? 'bg-[#5A3825] text-white border-[#5A3825]' : 'bg-white text-gray-600 border-[#A87C51]/30 hover:border-[#5A3825]'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0
          ? <p className="text-center text-gray-500 py-10">No products found for this category.</p>
          : <ProductGrid products={filteredProducts} limit={12} />
        }

        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="btn-primary inline-block bg-white text-[#5A3825] border-2 border-[#5A3825] px-10 py-3 rounded-full font-bold hover:bg-[#5A3825] hover:text-white shadow-sm"
          >
            Show More Products
          </Link>
        </div>
      </div>

      {/* Top Vendors Carousel */}
      <div className="py-20 bg-[#FAF8F5] border-y border-[#A87C51]/20 mt-16 relative">
        <div className="max-w-7xl mx-auto px-4">

          {/* Header Centered */}
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
            className="flex overflow-x-auto gap-6 pb-6 pt-4 px-2 w-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {data.vendors && data.vendors.length > 0 ? (
              [...data.vendors, ...data.vendors, ...data.vendors].map((vendor, idx) => (
                <div
                  key={idx}
                  className="min-w-[240px] md:min-w-[280px] bg-white border border-[#A87C51]/20 rounded-2xl p-8 flex flex-col items-center justify-center snap-center group cursor-pointer transition-all duration-400 hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(90,56,37,0.12)] hover:border-[#5A3825]"
                >
                  <div className="w-28 h-28 rounded-full bg-[#FAF8F5] mb-6 flex items-center justify-center overflow-hidden border-4 border-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] group-hover:border-[#A87C51]/30 transition-all duration-400 group-hover:shadow-[0_8px_25px_rgba(168,124,81,0.25)] relative">
                    <img
                      src={vendor.logo || '/logo.jpeg'}
                      alt={vendor.shop_name}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-bold text-[#2C1E16] text-xl text-center group-hover:text-[#A87C51] transition-colors">{vendor.shop_name}</h3>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center w-full">No top vendors available at the moment.</p>
            )}
          </div>

          {/* Centered Controls Below Carousel (Desktop & Mobile) */}
          <div className="flex justify-center gap-4 mt-6">
            <button onClick={scrollLeft} className="w-12 h-12 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center text-[#2C1E16] hover:bg-[#FAF8F5] transition-all duration-300 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={scrollRight} className="w-12 h-12 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center text-[#2C1E16] hover:bg-[#FAF8F5] transition-all duration-300 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

        </div>
      </div>

      {/* Customer Reviews Carousel */}
      <div className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">

          {/* Header Centered */}
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
            className="flex overflow-x-auto gap-6 pb-6 pt-4 px-2 w-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {[...staticReviews, ...staticReviews, ...staticReviews].map((review, idx) => (
              <div
                key={idx}
                className="min-w-[300px] md:min-w-[340px] bg-white border border-[#A87C51]/20 rounded-2xl p-8 flex flex-col snap-center group cursor-pointer transition-all duration-400 hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(90,56,37,0.12)] hover:border-[#5A3825]"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A87C51] to-[#5A3825] flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-500 group-hover:scale-110 group-hover:border-[#A87C51]/30 group-hover:shadow-[0_8px_25px_rgba(168,124,81,0.25)]">
                    {getInitials(review.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C1E16] text-lg group-hover:text-[#A87C51] transition-colors">{review.name}</h3>
                    <div className="flex text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic text-sm leading-relaxed relative">
                  <span className="text-4xl text-[#A87C51]/20 absolute -top-4 -left-2 font-serif">"</span>
                  <span className="relative z-10 pl-2">{review.text}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Centered Controls Below Carousel (Desktop & Mobile) */}
          <div className="flex justify-center gap-4 mt-6">
            <button onClick={scrollReviewsLeft} className="w-12 h-12 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center text-[#2C1E16] hover:bg-[#FAF8F5] transition-all duration-300 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={scrollReviewsRight} className="w-12 h-12 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center text-[#2C1E16] hover:bg-[#FAF8F5] transition-all duration-300 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}