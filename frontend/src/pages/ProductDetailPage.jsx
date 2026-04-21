import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const { user, isAuthenticated } = useAuth();
  const canWishlist = !isAuthenticated || user?.role === 'buyer';

  useEffect(() => {
    api.get(`/products/${id}/`).then(res => setProduct(res.data)).catch(() => setProduct(null))

    if (isAuthenticated) {
      if (user?.role === 'buyer') {
        api.get('/wishlist/').then(res => {
          const wData = res.data.results || res.data;
          if (wData.some(item => item.product.id === parseInt(id))) {
            setIsWishlisted(true);
          }
        }).catch(() => {});
      }
    } else {
      try {
        const guestW = JSON.parse(localStorage.getItem('guestWishlist')) || [];
        if (guestW.some(item => item.product.id === parseInt(id))) {
          setIsWishlisted(true);
        }
      } catch(e) {}
    }
  }, [id, isAuthenticated, user])

  const handleAddToCart = async (e) => {
    if (e) e.stopPropagation();

    if (isAuthenticated) {
      if (user?.role === 'vendor' || user?.role === 'admin') {
        toast.error(`${user.role.charAt(0).toUpperCase() + user.role.slice(1)}s are not permitted to buy products.`)
        return
      }
      try {
        await api.post('/cart/add/', { product_id: product.id, quantity })
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
      const totalRequested = (existingItem ? existingItem.quantity : 0) + quantity;

      if (totalRequested > product.stock_quantity) {
        return toast.error(`Cannot add. Only ${product.stock_quantity} available.`);
      }

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        guestCart.push({ product_id: product.id, quantity, product_details: product });
      }

      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      toast.success("Added to cart!");
    }
  }

  const handleToggleWishlist = async () => {
    if (isAuthenticated) {
      if (user?.role === 'vendor' || user?.role === 'admin') return toast.error(`${user.role}s cannot use wishlists.`);
      try {
        const res = await api.post('/wishlist/toggle/', { product_id: product.id });
        if (res.data.added) {
          toast.success("Added to wishlist!");
          setIsWishlisted(true);
        } else {
          toast.success("Removed from wishlist!");
          setIsWishlisted(false);
        }
      } catch (err) { toast.error("Failed to update wishlist."); }
    } else {
      let guestWishlist = [];
      try {
        const stored = JSON.parse(localStorage.getItem('guestWishlist'));
        if (Array.isArray(stored)) guestWishlist = stored;
      } catch (e) {}

      const exists = guestWishlist.find(item => item.product.id === product.id);
      if (exists) {
        guestWishlist = guestWishlist.filter(item => item.product.id !== product.id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist!");
      } else {
        guestWishlist.push({ product: product });
        setIsWishlisted(true);
        toast.success("Added to wishlist!");
      }
      localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
    }
  }

  const handleBuyNow = async (e) => {
    if (isAuthenticated && (user?.role === 'vendor' || user?.role === 'admin')) {
      return toast.error(`${user.role}s cannot buy products.`)
    }
    await handleAddToCart(e)
    navigate('/cart')
  }

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-[#5A3825]">
      <span className="flex items-center gap-2">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Loading...
      </span>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Image Panel */}
        <div className="animate-fade-in-left bg-[#FAF8F5] rounded-xl p-8 flex justify-center border border-[#A87C51]/30 shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow duration-400">
          {canWishlist && (
            <button
              onClick={handleToggleWishlist}
              className="wishlist-btn absolute top-4 right-4 p-3 bg-white/80 hover:bg-white rounded-full shadow-sm z-10"
            >
              <svg
                className={`heart-icon w-6 h-6 fill-current transition-all duration-300 ${isWishlisted ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          )}
          <img
            src={product.image}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`max-h-[500px] object-contain mix-blend-multiply transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        {/* Info Panel */}
        <div className="animate-fade-in-right">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2 animate-fade-in-up delay-1">{product.vendor_shop}</p>
          <h1 className="text-4xl font-bold text-[#2C1E16] mb-4 animate-fade-in-up delay-2">{product.name}</h1>
          <p className="text-3xl font-bold text-[#A87C51] mb-6 animate-fade-in-up delay-3">₹{parseFloat(product.price).toLocaleString()}</p>
          <p className="text-gray-600 mb-8 leading-relaxed animate-fade-in-up delay-3">{product.description}</p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-8 animate-fade-in-up delay-4">
            <span className="font-medium text-[#2C1E16]">Quantity:</span>
            <div className="flex items-center border border-[#5A3825] rounded-full overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-5 py-2 text-[#5A3825] hover:bg-[#5A3825] hover:text-white transition-all duration-200 active:scale-95"
              >-</button>
              <span className="px-4 font-semibold text-[#2C1E16] min-w-[2rem] text-center transition-all duration-150">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-5 py-2 text-[#5A3825] hover:bg-[#5A3825] hover:text-white transition-all duration-200 active:scale-95"
              >+</button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 animate-fade-in-up delay-5">
            {product.stock_quantity <= 0 ? (
              <div className="flex-1 bg-gray-100 text-gray-500 py-3 text-center font-bold border-2 border-gray-200 cursor-not-allowed rounded-full">
                OUT OF STOCK
              </div>
            ) : user?.role === 'vendor' || user?.role === 'admin' ? (
              <div className="flex-1 bg-gray-100 text-gray-400 py-3 text-center font-bold border-2 border-gray-200 cursor-not-allowed rounded-full">
                PURCHASING DISABLED
              </div>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-white text-[#5A3825] border-2 border-[#5A3825] py-3 font-bold uppercase tracking-wider hover:bg-[#5A3825] hover:text-white transition-all duration-250 rounded-full active:scale-[0.98]"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn-primary flex-1 bg-[#5A3825] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#3E2723] transition-all duration-200 shadow-md rounded-full active:scale-[0.98]"
                >
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