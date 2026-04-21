import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { SkeletonCard } from '../components/SkeletonCard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch products based on category & filters
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const catRes = await api.get('/categories/');
        const categoriesArray = catRes.data.results || catRes.data;
        const currentCat = categoriesArray.find(c => c.id === parseInt(id));
        setCategory(currentCat);

        let url = `/products/?category=${id}`;
        if (search) url += `&search=${search}`;
        if (minPrice) url += `&min_price=${minPrice}`;
        if (maxPrice) url += `&max_price=${maxPrice}`;

        const prodRes = await api.get(url);
        const finalProducts = prodRes.data.results !== undefined ? prodRes.data.results : prodRes.data;
        setProducts(finalProducts);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [id, search, minPrice, maxPrice]);

  // Load Wishlist Data
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
        return toast.error(`${user.role}s cannot buy products.`);
      }
      try {
        await api.post('/cart/add/', { product_id: product.id, quantity: 1 });
        toast.success("Added to cart!");
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
        if (product.stock_quantity < 1) return toast.error("Out of stock.");
        guestCart.push({ product_id: product.id, quantity: 1, product_details: product });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      toast.success("Added to cart!");
    }
  };

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
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-64 h-64 bg-[#FAF8F5] skeleton-shimmer rounded-xl"></aside>
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <div className="flex flex-col lg:flex-row gap-10">

        {/* SIDEBAR */}
        <aside className="animate-fade-in-left w-full lg:w-64 shrink-0">
          <div className="sticky top-28 space-y-8 bg-[#FAF8F5] p-6 border border-gray-100 rounded-xl shadow-sm">
            <div>
              <h3 className="font-bold text-[#5A3825] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                Search
              </h3>
              <input
                type="text"
                placeholder="Search..."
                className="input-animated w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#A87C51]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <h3 className="font-bold text-[#5A3825] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                Price
              </h3>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Min"
                  className="input-animated w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#A87C51]"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="input-animated w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#A87C51]"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <div className="animate-fade-in mb-8">
            <h1 className="text-4xl font-bold text-[#2C1E16] uppercase">
              {category?.name || 'Category'}
            </h1>
            <p className="text-gray-500 mt-2">Found {products.length} products</p>
          </div>

          {Array.isArray(products) && products.length === 0 ? (
            <div className="animate-fade-in text-center py-20 bg-[#FAF8F5] rounded-xl border border-dashed border-gray-300">
              <p className="text-[#5A3825] font-medium">No products found matching your filters.</p>
            </div>
          ) : (
            <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.isArray(products) && products.map(p => {
                const isWishlisted = wishlist.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="product-card-anim animate-fade-in-up group cursor-pointer bg-white rounded-xl border border-[#A87C51]/30 p-3 hover:shadow-xl hover:border-[#5A3825] transition-all duration-300 relative"
                  >
                    <div className="relative aspect-square bg-[#FAF8F5] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="product-thumb w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Right Wishlist Button */}
                      <button onClick={(e) => handleToggleWishlist(e, p)} className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors z-10">
                        <svg className={`w-5 h-5 fill-current transition-colors duration-300 ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`} viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>

                      {p.stock_quantity <= 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">OUT OF STOCK</span>}
                      
                      {/* Smooth Rectangular Add to Cart Button */}
                      {p.stock_quantity > 0 && (
                         <button onClick={(e) => handleAddToCart(e, p)} className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[85%] bg-[#5A3825] text-white py-2.5 rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg text-sm font-bold tracking-wider z-10">
                           + Add to Cart
                         </button>
                      )}
                    </div>
                    <div className="text-center pb-2">
                      <h3 className="text-[#2C1E16] font-medium text-base truncate">{p.name}</h3>
                      <p className="text-[#A87C51] font-bold mt-1 text-lg">
                        ₹{parseFloat(p.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};