import { useState, useEffect } from 'react'
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
        }).catch(() => {});
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
      } catch (e) {}

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
    <div className="max-w-7xl mx-auto px-4 py-32 text-center text-[#5A3825]">Loading...</div>
  );

  const ProductGrid = ({ products, limit = 12 }) => (
    <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* Offer Ticker */}
      {data.offers && data.offers.length > 0 && (
        <div className="w-full py-3 bg-[#A87C51] text-white overflow-hidden border-y border-[#5A3825]">
          <div className="flex whitespace-nowrap overflow-hidden">
            <div className="animate-scroll hover-pause flex items-center cursor-pointer">
              {[...data.offers, ...data.offers, ...data.offers, ...data.offers].map((offer, idx) => (
                <div key={idx} className="flex items-center mx-6 text-sm md:text-base font-medium tracking-wide">
                  <span className="bg-white text-[#5A3825] px-3 py-1 rounded-full text-xs font-bold uppercase mr-3 shadow-sm">
                    LIVE OFFER
                  </span>
                  <span>{offer.title}</span>
                  <span className="ml-2 opacity-80">({offer.start_date} to {offer.end_date})</span>
                  <span className="mx-8 text-[#5A3825]">✦</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="promo-banner md:w-1/2 bg-[#FAF8F5] rounded-xl p-8 border border-[#A87C51]/20 flex flex-col justify-center min-h-[250px] relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-[#5A3825] mb-2">Artisanal Sweets</h3>
              <p className="text-gray-600 mb-4">Taste the tradition in every bite.</p>
              <Link to="/shop" className="text-[#A87C51] font-bold underline underline-offset-4">Explore Now</Link>
            </div>
          </div>
          <div className="promo-banner md:w-1/2 bg-[#2C1E16] rounded-xl p-8 border border-gray-800 flex flex-col justify-center min-h-[250px] relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Fresh Roasted Coffee</h3>
              <p className="text-gray-400 mb-4">Start your morning right.</p>
              <Link to="/shop" className="text-[#A87C51] font-bold underline underline-offset-4">Shop Coffee</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trending */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="animate-fade-in-up text-2xl font-bold text-[#2C1E16] mb-8">What's Trending</h2>
        <ProductGrid products={data.featured_products} limit={4} />
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

      {/* Vendor Marquee */}
      <div className="py-16 border-y border-gray-100 bg-white mt-12 overflow-hidden">
        <h2 className="text-center text-gray-400 font-bold uppercase tracking-widest mb-8 text-sm">
          Trusted By Top Vendors
        </h2>
        <div className="flex whitespace-nowrap overflow-hidden">
          <div className="animate-scroll flex gap-16 px-8 items-center">
            {data.vendors && data.vendors.length > 0 ? (
              <>
                {data.vendors.map((vendor, i) => <div key={`a-${i}`} className="text-2xl font-bold text-gray-300 mx-8">{vendor.shop_name}</div>)}
                {data.vendors.map((vendor, i) => <div key={`b-${i}`} className="text-2xl font-bold text-gray-300 mx-8">{vendor.shop_name}</div>)}
                {data.vendors.map((vendor, i) => <div key={`c-${i}`} className="text-2xl font-bold text-gray-300 mx-8">{vendor.shop_name}</div>)}
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-300 mx-8">No vendors to display.</div>
            )}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="animate-fade-in-up text-3xl font-bold text-center text-[#2C1E16] mb-12">
          What Our Customers Say
        </h2>
        <div className="stagger-children grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Rahul S.", review: "The premium khakhra is incredible. Tastes just like home! Highly recommend the spicy flavor." },
            { name: "Priya P.", review: "Fast delivery and the coffee beans are roasted to perfection. Will be ordering again." },
            { name: "Amit K.", review: "Loved the traditional sweets box I ordered for the festival. The packaging was beautiful." }
          ].map((item, i) => (
            <div key={i} className="testimonial-card animate-fade-in-up bg-[#FAF8F5] p-8 rounded-2xl border border-gray-100 text-center relative">
              <div className="text-[#A87C51] mb-4 flex justify-center">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
              <p className="text-gray-600 italic mb-6">"{item.review}"</p>
              <h4 className="font-bold text-[#2C1E16]">- {item.name}</h4>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}