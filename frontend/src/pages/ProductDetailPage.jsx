/* src/pages/ProductDetailPage.jsx */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // Import useAuth
import api from '../api/axios'
import toast from 'react-hot-toast'

export const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth() // Access the logged-in user
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    api.get(`/products/${id}/`).then(res => setProduct(res.data)).catch(() => setProduct(null))
  }, [id])

  const handleAddToCart = async (e) => { // (e) is only needed in HomePage.jsx
    if (e) e.stopPropagation(); // Only needed in HomePage.jsx

    if (user?.role === 'vendor' || user?.role === 'admin') {
      toast.error(`${user.role.charAt(0).toUpperCase() + user.role.slice(1)}s are not permitted to buy products.`)
      return
    }

    try {
      await api.post('/cart/add/', { product_id: product.id, quantity }) 
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

  const handleBuyNow = async () => {
    
    if (user?.role === 'vendor' || user?.role === 'admin') {
      toast.error(`${user.role.charAt(0).toUpperCase() + user.role.slice(1)}s are not permitted to buy products.`)
      return
    }
    await handleAddToCart()
    navigate('/cart')
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="bg-[#f5f5f5] rounded-sm p-8 flex justify-center border border-gray-100">
          <img src={product.image} alt={product.name} className="max-h-[500px] object-contain mix-blend-multiply" />
        </div>
        
        {/* Details */}
        <div className="animate-fade-in">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">{product.vendor_shop}</p>
          <h1 className="text-4xl font-bold text-[#1e1e27] mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-[#fe4c50] mb-6">₹{parseFloat(product.price).toLocaleString()}</p>
          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="font-medium text-[#1e1e27]">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-sm">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-gray-600 hover:bg-gray-100">-</button>
              <span className="px-4 font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-gray-600 hover:bg-gray-100">+</button>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Conditional UI: Disable or hide buttons for vendors */}
            {product.stock_quantity <= 0 ? (
              <div className="flex-1 bg-gray-100 text-gray-500 py-3 text-center font-bold border-2 border-gray-200 cursor-not-allowed">
                OUT OF STOCK
              </div>
            ) :user?.role === 'vendor' || user?.role === 'admin' ? (
              <div className="flex-1 bg-gray-100 text-gray-400 py-3 text-center font-bold border-2 border-gray-200 cursor-not-allowed">
                PURCHASING DISABLED FOR {user.role.charAt(0).toUpperCase() + user.role.slice(1)}s
              </div>
            ) : (
              <>
                <button onClick={handleAddToCart} className="flex-1 bg-white text-[#1e1e27] border-2 border-[#1e1e27] py-3 font-bold uppercase tracking-wider hover:bg-[#1e1e27] hover:text-white transition-colors">
                  Add to Cart
                </button>
                <button onClick={handleBuyNow} className="flex-1 bg-[#fe4c50] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#e04347] transition-colors shadow-md">
                  Buy Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}