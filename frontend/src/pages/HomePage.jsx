/* src/pages/HomePage.jsx */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // Added Auth context import
import api from '../api/axios'
import toast from 'react-hot-toast'

export const HomePage = () => {
  const [data, setData] = useState({ categories: [], featured_products: [], new_products: [] })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  // Destructure auth states to fix reference errors
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

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();

    // Correctly checks role using auth state
    if (isAuthenticated && user?.role === 'vendor' || user?.role === 'admin') {
      toast.error(`${user.role.charAt(0).toUpperCase() + user.role.slice(1)}s cannot add items to the cart.`);
      return;
    }

    try {
      await api.post('/cart/add/', { product_id: productId, quantity: 1 });
      toast.success("Added to cart!");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to add items.");
        navigate('/login');
      } else {
        toast.error("Failed to add item to cart.");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-[#fe4c50] border-t-transparent rounded-full"></div>
    </div>
  )

  const ProductGrid = ({ products }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {products.map(p => (
        <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="product-card group cursor-pointer bg-white overflow-hidden transition-all duration-300 hover:shadow-xl rounded-sm border border-gray-100">
          <div className="product-image-container relative aspect-[4/5] bg-gray-50 overflow-hidden">
            <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-multiply p-4" />
            {/* Hover Add to Cart Button */}
            <div 
              className="absolute bottom-0 left-0 w-full bg-[#fe4c50]/90 text-white text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-medium" 
              onClick={(e) => handleAddToCart(e, p.id)}
            >
              ADD TO CART
            </div>
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
      {/* Hero Section */}
      <div className="relative h-[600px] bg-[#f5f5f5] flex items-center">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.pexels.com/photos/974911/pexels-photo-974911.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 animate-fade-in">
          <p className="text-[#fe4c50] font-semibold tracking-wider uppercase mb-2">Spring / Summer Collection 2026</p>
          <h1 className="text-5xl md:text-7xl font-bold text-[#1e1e27] mb-6 leading-tight">Get up to 30% Off<br />New Arrivals</h1>
          <button className="bg-[#fe4c50] text-white px-10 py-3 rounded-sm font-semibold hover:bg-[#e04347] transition-colors shadow-lg uppercase tracking-wider">Shop Now</button>
        </div>
      </div>

      {/* Categories Section */}
      <div id="categories" className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.categories.slice(0, 3).map(cat => (
            <Link key={cat.id} to={`/category/${cat.id}`} className="relative h-64 bg-gray-100 flex items-center justify-center group overflow-hidden rounded-sm">
              {cat.image && <img src={cat.image} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt={cat.name} />}
              <div className="relative bg-white px-8 py-3 shadow-md group-hover:bg-[#fe4c50] group-hover:text-white transition-colors duration-300">
                <h2 className="text-xl font-bold uppercase tracking-wider">{cat.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center text-[#1e1e27] mb-12 relative after:content-[''] after:block after:w-16 after:h-1 after:bg-[#fe4c50] after:mx-auto after:mt-4">Featured Products</h2>
        <ProductGrid products={data.featured_products} />
      </div>

      {/* Discount Banner */}
      <div className="w-full bg-[url('https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center bg-fixed py-32 relative">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">Big Sale - Up to 50% Off</h2>
          <p className="text-xl mb-8 font-light">On selected premium items and accessories.</p>
          <Link to="/" className="bg-white text-[#fe4c50] px-10 py-3 rounded-sm font-bold hover:bg-gray-100 transition-colors uppercase">Discover Now</Link>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-[#1e1e27] mb-12 relative after:content-[''] after:block after:w-16 after:h-1 after:bg-[#fe4c50] after:mx-auto after:mt-4">New Arrivals</h2>
        <ProductGrid products={data.new_products} />
      </div>
    </div>
  )
}