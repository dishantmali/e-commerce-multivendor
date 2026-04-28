import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SkeletonCard } from '../components/SkeletonCard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_CATEGORIES = [
  { id: 1, name: 'Sweets'  },
  { id: 2, name: 'Coffee'  },
  { id: 3, name: 'Snacks'  },
  { id: 4, name: 'Pickles' },
  { id: 5, name: 'Spices'  },
  { id: 6, name: 'Namkeen' },
];

const DUMMY_PRODUCTS = [
  { id: 1,  name: 'Kaju Katli',          price: '350', stock_quantity: 20, category: 1, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  { id: 2,  name: 'Mohanthal',           price: '280', stock_quantity: 15, category: 1, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { id: 3,  name: 'Filter Coffee',       price: '220', stock_quantity: 30, category: 2, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
  { id: 4,  name: 'Cold Brew',           price: '180', stock_quantity: 25, category: 2, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
  { id: 5,  name: 'Chakri',              price: '120', stock_quantity: 50, category: 3, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80' },
  { id: 6,  name: 'Gathiya',             price: '90',  stock_quantity: 60, category: 3, image: 'https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400&q=80' },
  { id: 7,  name: 'Mango Pickle',        price: '160', stock_quantity: 40, category: 4, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  { id: 8,  name: 'Lemon Pickle',        price: '140', stock_quantity: 35, category: 4, image: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=400&q=80' },
  { id: 9,  name: 'Jeera Powder',        price: '60',  stock_quantity: 80, category: 5, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
  { id: 10, name: 'Dhana Powder',        price: '55',  stock_quantity: 90, category: 5, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
  { id: 11, name: 'Sev',                 price: '80',  stock_quantity: 70, category: 6, image: 'https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400&q=80' },
  { id: 12, name: 'Bhujia',              price: '75',  stock_quantity: 65, category: 6, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80' },
  { id: 13, name: 'Aamrakhand',          price: '200', stock_quantity: 20, category: 1, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { id: 14, name: 'Espresso Blend',      price: '260', stock_quantity: 18, category: 2, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
  { id: 15, name: 'Khakhra',             price: '100', stock_quantity: 55, category: 3, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80' },
  { id: 16, name: 'Green Chilli Pickle', price: '130', stock_quantity: 30, category: 4, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  { id: 17, name: 'Haldi Powder',        price: '50',  stock_quantity: 100,category: 5, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
  { id: 18, name: 'Fafda',               price: '85',  stock_quantity: 0,  category: 6, image: 'https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400&q=80' },
  { id: 19, name: 'Ladoo',               price: '300', stock_quantity: 22, category: 1, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { id: 20, name: 'Masala Chai Blend',   price: '190', stock_quantity: 40, category: 2, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
  { id: 21, name: 'Chikki',              price: '110', stock_quantity: 45, category: 1, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  { id: 22, name: 'Arabica Beans',       price: '310', stock_quantity: 12, category: 2, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
  { id: 23, name: 'Methi Thepla',        price: '95',  stock_quantity: 38, category: 3, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80' },
  { id: 24, name: 'Mixed Pickle',        price: '145', stock_quantity: 28, category: 4, image: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=400&q=80' },
  { id: 25, name: 'Kashmiri Mirch',      price: '70',  stock_quantity: 75, category: 5, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
  { id: 26, name: 'Chana Dal Namkeen',   price: '65',  stock_quantity: 0,  category: 6, image: 'https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400&q=80' },
  { id: 27, name: 'Barfi',               price: '320', stock_quantity: 18, category: 1, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { id: 28, name: 'Robusta Blend',       price: '240', stock_quantity: 22, category: 2, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
  { id: 29, name: 'Patra',               price: '115', stock_quantity: 33, category: 3, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80' },
  { id: 30, name: 'Garlic Pickle',       price: '175', stock_quantity: 20, category: 4, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
];

const PRODUCTS_PER_PAGE = 9;
// ─────────────────────────────────────────────────────────────────────────────

export const ShopPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [categories] = useState(DUMMY_CATEGORIES);
  const [allProducts] = useState(DUMMY_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Simulate loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

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

  // ─── Client-side filtering ──────────────────────────────────────────────────
  const filteredProducts = allProducts.filter(p => {
    const matchCategory = selectedCategory ? p.category === Number(selectedCategory) : true;
    const matchSearch   = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true;
    const matchMin      = minPrice ? parseFloat(p.price) >= parseFloat(minPrice) : true;
    const matchMax      = maxPrice ? parseFloat(p.price) <= parseFloat(maxPrice) : true;
    return matchCategory && matchSearch && matchMin && matchMax;
  });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  // ───────────────────────────────────────────────────────────────────────────

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
      toast.success("Added to cart!");
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
      const isIn = wishlist.includes(product.id);
      setWishlist(prev => isIn ? prev.filter(id => id !== product.id) : [...prev, product.id]);
      toast.success(isIn ? "Removed from wishlist!" : "Added to wishlist!");
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
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#FAF8F5] rounded-xl border border-dashed border-gray-300 animate-fade-in">
              <h3 className="text-xl font-bold text-[#5A3825] mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 stagger-children">
                {paginatedProducts.map(p => {
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
                    // Show first, last, current, and neighbours; collapse others with ellipsis
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
                  Page {currentPage} of {totalPages} · {filteredProducts.length} products
                </p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};