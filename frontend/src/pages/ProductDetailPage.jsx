import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Helper component for displaying stars
const StarDisplay = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg 
          key={star} 
          className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-[#A87C51]' : 'text-gray-300'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/${id}/`),
          api.get(`/products/${id}/reviews/`)
        ]);
        setProduct(prodRes.data);
        setReviews(revRes.data.results || revRes.data || []);
      } catch (error) {
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  const handleAddToCart = async () => {
    if (user && (user.role === 'vendor' || user.role === 'admin')) {
      return toast.error("Purchasing is disabled for vendor and admin accounts.");
    }
    
    if (!user) {
      toast.error("Please login to add items to cart.");
      navigate('/login');
      return;
    }
    
    if (quantity > product.stock_quantity) {
      return toast.error(`Only ${product.stock_quantity} items available in stock.`);
    }

    setAddingToCart(true);
    try {
      await api.post('/cart/add/', { product_id: product.id, quantity: quantity });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (user && (user.role === 'vendor' || user.role === 'admin')) {
      return toast.error("Purchasing is disabled for vendor and admin accounts.");
    }
    
    if (!user) {
      toast.error("Please login to purchase items.");
      navigate('/login');
      return;
    }
    
    if (quantity > product.stock_quantity) {
      return toast.error(`Only ${product.stock_quantity} items available in stock.`);
    }

    navigate('/checkout', { 
      state: { 
        isDirectBuy: true, 
        product: product, 
        quantity: quantity 
      } 
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#5A3825] font-bold">Loading product...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Product not found.</div>;

  const isVendorOrAdmin = user?.role === 'vendor' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans bg-[#FAF8F5] min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Product Image */}
          <div className="md:w-1/2 p-8 bg-[#FAF8F5] flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
            <img src={product.image} alt={product.name} className="max-h-[500px] object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300" />
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <p className="text-[#A87C51] font-bold tracking-widest uppercase text-xs mb-2">Vendor: {product.vendor_shop}</p>
            <h1 className="text-3xl md:text-4xl font-black text-[#2C1E16] mb-4">{product.name}</h1>
            
            {/* Star Rating Display */}
            <div className="flex items-center gap-3 mb-6">
              <StarDisplay rating={product.average_rating || 0} />
              <span className="text-sm font-bold text-gray-500">
                {product.average_rating > 0 ? `${product.average_rating} out of 5` : 'No ratings yet'} 
                <span className="mx-2">•</span> 
                {product.review_count} {product.review_count === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            <p className="text-3xl font-bold text-[#5A3825] mb-6">₹{parseFloat(product.price).toLocaleString()}</p>
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
           
            {/* Quantity Selector - Hidden for Vendors/Admins */}
            {!isVendorOrAdmin && (
              <div className="flex items-center gap-4 mb-8">
                <span className="font-medium text-[#2C1E16]">Quantity:</span>
                <div className="flex items-center border border-[#5A3825] rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-2 text-[#5A3825] hover:bg-[#5A3825] hover:text-white transition-all duration-200 active:scale-95"
                  >-</button>
                  <span className="px-4 font-semibold text-[#2C1E16] min-w-[2rem] text-center transition-all duration-150">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="px-5 py-2 text-[#5A3825] hover:bg-[#5A3825] hover:text-white transition-all duration-200 active:scale-95"
                  >+</button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isVendorOrAdmin ? (
              <div className="mt-auto w-full bg-gray-50 text-gray-400 py-4 text-center font-bold border-2 border-gray-200 cursor-not-allowed rounded-full uppercase tracking-widest text-sm">
                Purchasing Disabled for {user.role}s
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || addingToCart}
                  className="flex-1 bg-white text-[#5A3825] border-2 border-[#5A3825] py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#FAF8F5] disabled:border-gray-200 disabled:text-gray-400 disabled:bg-gray-50 transition-all duration-200 active:scale-95 text-sm"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                
                <button 
                  onClick={handleBuyNow}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 bg-[#5A3825] text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#3E2723] disabled:bg-gray-400 transition-all duration-200 shadow-lg active:scale-95 text-sm"
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Buy Now'}
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* --- Customer Reviews Section --- */}
      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-[#2C1E16] mb-8 border-b border-gray-100 pb-4">Customer Reviews</h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">Be the first to review this product after purchase!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#A87C51]/20 flex items-center justify-center font-black text-[#5A3825]">
                    {review.reviewer_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-[#2C1E16] text-sm">{review.reviewer_name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mb-2 pl-13">
                  <StarDisplay rating={review.rating} />
                </div>
                {review.review_text && (
                  <p className="text-gray-600 text-sm leading-relaxed pl-13 mt-2">{review.review_text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};