import { useState, useEffect } from 'react';
import api from '../api/axios';
import { SkeletonCard } from '../components/SkeletonCard';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/wishlist/')
        .then(res => setWishlistItems(res.data.results || res.data))
        .catch(() => toast.error("Failed to load wishlist"))
        .finally(() => setLoading(false));
    } else {
      let guestWishlist = [];
      try {
        const stored = JSON.parse(localStorage.getItem('guestWishlist'));
        if (Array.isArray(stored)) guestWishlist = stored;
      } catch (e) {}
      setWishlistItems(guestWishlist);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    if (isAuthenticated) {
      try {
        await api.post('/wishlist/toggle/', { product_id: productId });
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
        toast.success("Removed from wishlist");
      } catch (err) {
        toast.error("Could not remove item");
      }
    } else {
      const updatedWishlist = wishlistItems.filter(item => item.product.id !== productId);
      localStorage.setItem('guestWishlist', JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
      toast.success("Removed from wishlist");
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <h1 className="text-3xl font-bold text-[#2C1E16] mb-8 border-b border-gray-200 pb-4 animate-fade-in-up">
        My Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 bg-[#FAF8F5] rounded-xl border border-dashed border-gray-300 animate-fade-in">
          <p className="text-gray-500 mb-6">Your wishlist is empty.</p>
          <Link
            to="/shop"
            className="btn-primary bg-[#5A3825] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3E2723] transition-all duration-200 shadow-md inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
          {wishlistItems.map((item) => (
            <div
              key={item.product.id}
              className="product-card-anim relative group bg-white rounded-xl border border-gray-100 p-4 animate-fade-in-up"
            >
              <Link to={`/product/${item.product.id}`}>
                <div className="aspect-square bg-[#FAF8F5] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="product-thumb w-full h-full object-cover mix-blend-multiply"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-[#2C1E16] truncate transition-colors duration-200 group-hover:text-[#5A3825]">
                    {item.product.name}
                  </h3>
                  <p className="text-[#A87C51] font-bold mt-1 text-lg">
                    ₹{parseFloat(item.product.price).toLocaleString()}
                  </p>
                </div>
              </Link>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.product.id)}
                className="remove-btn absolute top-6 right-6 bg-white p-2 rounded-full shadow-md text-red-500 hover:text-red-600 transition-all duration-200"
              >
                <svg fill="currentColor" stroke="none" className="w-5 h-5 fill-current" viewBox="0 0 20 20">
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