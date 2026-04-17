/* src/pages/HomePage.jsx */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const CountdownTimer = ({ startDate, endDate }) => {
  const [timeLeft, setTimeLeft] = useState({ text: '', days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(startDate + 'T00:00:00').getTime();
      const end = new Date(endDate + 'T23:59:59').getTime();

      let targetTime, prefix, isEnded = false;

      if (now < start) {
        targetTime = start;
        prefix = 'Starts in';
      } else if (now >= start && now <= end) {
        targetTime = end;
        prefix = 'Ends in';
      } else {
        prefix = 'Offer Ended';
        isEnded = true;
        targetTime = now;
      }

      const difference = targetTime - now;

      let days = 0, hours = 0, minutes = 0, seconds = 0;
      if (difference > 0) {
        days = Math.floor(difference / (1000 * 60 * 60 * 24));
        hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor((difference % (1000 * 60)) / 1000);
      }

      setTimeLeft({ text: prefix, days, hours, minutes, seconds, isEnded });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [startDate, endDate]);

  if (timeLeft.isEnded) {
    return <p className="text-xl mb-10 text-gray-200 drop-shadow-sm font-medium">{timeLeft.text}</p>;
  }

  return (
    <div className="mb-10 flex flex-col items-center">
      <p className="text-lg text-gray-200 drop-shadow-sm font-medium mb-3">{timeLeft.text}</p>
      <div className="flex gap-4 text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 min-w-[80px] shadow-sm">
          <span className="text-3xl font-bold block text-white">{timeLeft.days}</span>
          <span className="text-xs uppercase tracking-wider text-gray-300">Days</span>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 min-w-[80px] shadow-sm">
          <span className="text-3xl font-bold block text-white">{timeLeft.hours}</span>
          <span className="text-xs uppercase tracking-wider text-gray-300">Hours</span>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 min-w-[80px] shadow-sm">
          <span className="text-3xl font-bold block text-white">{timeLeft.minutes}</span>
          <span className="text-xs uppercase tracking-wider text-gray-300">Mins</span>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 min-w-[80px] shadow-sm">
          <span className="text-3xl font-bold block text-white">{timeLeft.seconds}</span>
          <span className="text-xs uppercase tracking-wider text-gray-300">Secs</span>
        </div>
      </div>
    </div>
  );
};

export const HomePage = () => {
  const [data, setData] = useState({ categories: [], featured_products: [], new_products: [], offers: [] })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
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

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const res = await api.get(`/products/?search=${query}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search failed", err);
      }
    } else {
      setSearchResults([]);
    }
  }

  const handleAddToCart = async (e) => { // (e) is only needed in HomePage.jsx
    if (e) e.stopPropagation(); // Only needed in HomePage.jsx

    if (user?.role === 'vendor' || user?.role === 'admin') {
      toast.error(`${user.role.charAt(0).toUpperCase() + user.role.slice(1)}s are not permitted to buy products.`)
      return
    }

    try {
      
      await api.post('/cart/add/', { product_id: productId, quantity: 1 }) 
      toast.success("Added to cart!")
    } catch (err) {
      // CRITICAL FIX: Show the backend stock error if it exists!
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Please login to purchase.");
        // navigate('/login'); // Optional: only navigate if it's a 401 status
      }
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans">Loading...</div>

  const ProductGrid = ({ products }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {products.map(p => (
        <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="product-card group cursor-pointer bg-white overflow-hidden transition-all duration-300 hover:shadow-xl rounded-sm border border-gray-100 relative">
          
          {/* Out of Stock Badge (Top Right) */}
          {p.stock_quantity <= 0 && (
            <div className="absolute z-10 top-4 right-4 bg-gray-800 text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider shadow-sm">
              Out of Stock
            </div>
          )}

          <div className={`product-image-container relative aspect-[4/5] bg-gray-50 overflow-hidden ${p.stock_quantity <= 0 ? 'opacity-70 grayscale' : ''}`}>
            <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-multiply p-4" />
            
            {/* Only show Add to Cart hover if in stock */}
            {p.stock_quantity > 0 && (
              <div className="absolute bottom-0 left-0 w-full bg-[#fe4c50]/90 text-white text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-medium" onClick={(e) => handleAddToCart(e, p.id)}>
                ADD TO CART
              </div>
            )}
          </div>
          <div className="p-4 text-center">
            <h3 className="text-[#1e1e27] font-medium text-lg truncate">{p.name}</h3>
            <p className="text-[#fe4c50] font-bold mt-1">₹{parseFloat(p.price).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="font-sans">
      {/* 1. SEARCH SECTION WITH BACKGROUND IMAGE */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Using your provided background image */}
          <img 
            src="/src/assets/hero-big.jpeg" 
            className="w-full h-full object-cover brightness-50" 
            alt="Search Background" 
          />
        </div>
        <div className="relative z-10 w-full max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Find Your Style</h1>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for products, brands and more..." 
              className="w-full p-5 pl-14 rounded-full bg-white/95 border-none shadow-2xl focus:ring-2 focus:ring-[#fe4c50] outline-none text-lg"
              value={searchQuery}
              onChange={handleSearch}
            />
            <svg className="w-7 h-7 absolute left-5 top-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS (Conditional) */}
      {searchQuery.length > 2 && (
        <div className="max-w-7xl mx-auto px-4 py-10 bg-white shadow-inner">
          <h2 className="text-2xl font-bold mb-6 text-[#1e1e27]">Search Results</h2>
          {searchResults.length > 0 ? <ProductGrid products={searchResults} /> : <p className="text-gray-500">No matching products found.</p>}
          <hr className="mt-12 border-gray-100" />
        </div>
      )}

      {/* 2. CATEGORY SECTION */}
      <div id="categories" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10 text-[#1e1e27]">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.id}`} className="relative h-64 bg-gray-100 flex items-center justify-center group overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-shadow">
               {cat.image && <img src={cat.image} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt={cat.name}/>}
               <div className="relative bg-white/90 px-8 py-3 group-hover:bg-[#fe4c50] group-hover:text-white transition-all duration-300">
                 <h2 className="text-xl font-bold uppercase tracking-wider">{cat.name}</h2>
               </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. FEATURED PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center text-[#1e1e27] mb-12 relative after:content-[''] after:block after:w-16 after:h-1 after:bg-[#fe4c50] after:mx-auto after:mt-4">Featured Products</h2>
        <ProductGrid products={data.featured_products} />
      </div>

      {/* 4. OFFERS SECTION (Banner) */}
      {data.offers && data.offers.length > 0 && data.offers.map((offer) => (
        <div key={offer.id} className="w-full bg-[#1e1e27] py-20 text-center text-white my-10 relative overflow-hidden flex items-center justify-center animate-fade-in group">
          {offer.image && <img src={offer.image} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" alt={offer.title} />}
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <p className="text-[#fe4c50] font-bold tracking-widest uppercase mb-4">Limited Time Offer</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 italic drop-shadow-md">{offer.title}</h2>
            <CountdownTimer startDate={offer.start_date} endDate={offer.end_date} />
            <button className="bg-[#fe4c50] text-white px-12 py-4 rounded-sm font-bold hover:bg-[#e04347] transition-colors shadow-lg">Shop Now</button>
          </div>
        </div>
      ))}

      {/* 5. NEW ARRIVAL */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#1e1e27] mb-12 relative after:content-[''] after:block after:w-16 after:h-1 after:bg-[#fe4c50] after:mx-auto after:mt-4">New Arrivals</h2>
        <ProductGrid products={data.new_products} />
      </div>
    </div>
  )
}