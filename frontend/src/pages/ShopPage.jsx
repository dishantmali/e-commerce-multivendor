import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SkeletonCard } from '../components/SkeletonCard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const ShopPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync category from URL
  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl !== null) setSelectedCategory(catFromUrl);
  }, [searchParams]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, minPrice, maxPrice]);

  // Load wishlist
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'buyer') {
        try {
          const guestW = JSON.parse(localStorage.getItem('guestWishlist')) || [];
          setWishlist(guestW.map(item => item.product.id));
        } catch (e) {}
      }
    } else {
      try {
        const guestW = JSON.parse(localStorage.getItem('guestWishlist')) || [];
        setWishlist(guestW.map(item => item.product.id));
      } catch (e) {}
    }
  }, [isAuthenticated, user]);

  // Fetch Categories
  useEffect(() => {
    api.get('/categories/')
      .then(res => setCategories(res.data.results || res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch Products based on filters and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/products/?page=${currentPage}`;
        if (selectedCategory) url += `&category=${selectedCategory}`;
        if (search) url += `&search=${search}`;
        if (minPrice) url += `&min_price=${minPrice}`;
        if (maxPrice) url += `&max_price=${maxPrice}`;

        const res = await api.get(url);
        if (res.data && res.data.results !== undefined) {
          setFilteredProducts(res.data.results);
          setTotalCount(res.data.count);
          setTotalPages(Math.ceil(res.data.count / 12)); // PAGE_SIZE is 12 in backend
        } else {
          setFilteredProducts(res.data);
          setTotalCount(res.data.length);
          setTotalPages(Math.ceil(res.data.length / 12));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, search, selectedCategory, minPrice, maxPrice]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedCategory(val);
    if (val) searchParams.set('category', val);
    else searchParams.delete('category');
    setSearchParams(searchParams);
  };

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
      if (user?.role === 'vendor' || user?.role === 'admin') return toast.error(`${user.role}s cannot use wishlists.`);
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

  const handleClearFilters = () => {
    setSearch(''); setSelectedCategory(''); setMinPrice(''); setMaxPrice('');
    searchParams.delete('category'); setSearchParams(searchParams);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold text-[#2C1E16]">All Products</h1>
          <p className="text-gray-500 mt-2">Browse, search, and filter our entire catalog.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 animate-fade-in-left">
          <div className="sticky top-28 space-y-8 bg-[#FAF8F5] p-6 border border-gray-100 rounded-xl shadow-sm">
            <div>
              <h3 className="font-bold text-[#5A3825] uppercase tracking-wider mb-3">Search</h3>
              <input
                type="text"
                placeholder="Product name..."
                className="input-animated w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] text-sm hover:border-[#A87C51]/50 transition-all duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <h3 className="font-bold text-[#5A3825] uppercase tracking-wider mb-3">Categories</h3>
              <select
                className="input-animated w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] text-sm text-gray-700 hover:border-[#A87C51]/50 transition-all duration-200 cursor-pointer"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <h3 className="font-bold text-[#5A3825] uppercase tracking-wider mb-3">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  className="input-animated w-1/2 p-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#A87C51] outline-none hover:border-[#A87C51]/50 transition-all duration-200"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  className="input-animated w-1/2 p-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#A87C51] outline-none hover:border-[#A87C51]/50 transition-all duration-200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleClearFilters}
              className="w-full py-2 mt-4 text-sm font-bold text-[#A87C51] hover:text-[#5A3825] underline underline-offset-4 transition-colors duration-200 active:scale-95"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 animate-fade-in">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#FAF8F5] rounded-xl border border-dashed border-gray-300 animate-fade-in">
              <h3 className="text-xl font-bold text-[#5A3825] mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 stagger-children">
                {filteredProducts.map(p => {
                  const isWishlisted = wishlist.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="product-card-anim group cursor-pointer bg-white rounded-xl border border-[#A87C51]/30 p-3 relative animate-fade-in-up"
                    >
                      <div className="relative aspect-square bg-[#FAF8F5] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="product-thumb w-full h-full object-cover mix-blend-multiply"
                        />

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleToggleWishlist(e, p)}
                          className="wishlist-btn absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm z-10"
                        >
                          <svg
                            className={`heart-icon w-5 h-5 fill-current transition-all duration-300 ${isWishlisted ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </button>

                        {p.stock_quantity <= 0 && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">OUT OF STOCK</span>
                        )}

                        {p.stock_quantity > 0 && (
                          <button
                            onClick={(e) => handleAddToCart(e, p)}
                            className="add-cart-btn absolute bottom-3 left-1/2 -translate-x-1/2 w-[85%] bg-[#5A3825] text-white py-2.5 rounded-full shadow-lg text-sm font-bold tracking-wider z-10"
                          >
                            + Add to Cart
                          </button>
                        )}
                      </div>

                      <div className="text-center pb-2">
                        <h3 className="text-[#2C1E16] font-medium text-base truncate transition-colors duration-200 group-hover:text-[#5A3825]">{p.name}</h3>
                        <p className="text-[#A87C51] font-bold mt-1 text-lg">₹{parseFloat(p.price).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  {/* Prev */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full border border-[#A87C51]/30 flex items-center justify-center text-[#5A3825] hover:bg-[#5A3825] hover:text-white hover:border-[#5A3825] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    const show =
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1;

                    const showEllipsisBefore = page === currentPage - 2 && currentPage - 2 > 1;
                    const showEllipsisAfter  = page === currentPage + 2 && currentPage + 2 < totalPages;

                    if (!show && !showEllipsisBefore && !showEllipsisAfter) return null;
                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span key={`ellipsis-${page}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
                          …
                        </span>
                      );
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 active:scale-95 ${
                          currentPage === page
                            ? 'bg-[#5A3825] text-white border border-[#5A3825] shadow-md'
                            : 'border border-[#A87C51]/30 text-[#5A3825] hover:bg-[#FAF8F5] hover:border-[#5A3825]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full border border-[#A87C51]/30 flex items-center justify-center text-[#5A3825] hover:bg-[#5A3825] hover:text-white hover:border-[#5A3825] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Page info */}
              {totalPages > 1 && (
                <p className="text-center text-sm text-gray-400 mt-3">
                  Page {currentPage} of {totalPages} · {totalCount} products
                </p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};