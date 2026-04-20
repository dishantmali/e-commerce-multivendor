import { useState, useEffect } from 'react';
import api from '../api/axios';
import { SkeletonCard } from '../components/SkeletonCard';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist/'); // We'll create this endpoint next
      // Handle pagination results if applicable
      const data = res.data.results || res.data;
      setWishlistItems(data);
    } catch (err) {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.post('/wishlist/toggle/', { product_id: productId });
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Could not remove item");
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[#1e1e27] mb-8">My Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-sm border border-dashed">
          <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
          <Link to="/" className="bg-[#fe4c50] text-white px-6 py-2 rounded-sm font-bold">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {wishlistItems.map((item) => (
            <div key={item.id} className="relative group">
              {/* Product Layout */}
              <Link to={`/product/${item.product.id}`}>
                <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img src={item.product.image} alt={item.product.name} className="aspect-[4/5] object-cover w-full" />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 truncate">{item.product.name}</h3>
                    <p className="text-[#fe4c50] font-bold">₹{parseFloat(item.product.price).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
              
              {/* Remove Button */}
              <button 
                onClick={() => handleRemove(item.product.id)}
                className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-[#fe4c50] transition-colors"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};