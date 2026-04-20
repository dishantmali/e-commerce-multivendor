/* src/pages/CategoryPage.jsx */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { SkeletonCard } from '../components/SkeletonCard';

export const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const catRes = await api.get('/categories/');
        // Handle paginated or non-paginated category response
        const categoriesArray = catRes.data.results || catRes.data;
        const currentCat = categoriesArray.find(c => c.id === parseInt(id));
        setCategory(currentCat);

        let url = `/products/?category=${id}`;
        if (search) url += `&search=${search}`;
        if (minPrice) url += `&min_price=${minPrice}`;
        if (maxPrice) url += `&max_price=${maxPrice}`;

        const prodRes = await api.get(url);

        // FIX: Ensure you set the array, not the whole pagination object
        // If prodRes.data.results exists, use it; otherwise use prodRes.data
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

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Placeholder */}
        <aside className="w-full lg:w-64 h-64 bg-gray-50 animate-pulse rounded-sm"></aside>

        {/* Grid Placeholder */}
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <div className="flex flex-col lg:flex-row gap-10">

        {/* SIDEBAR */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-28 space-y-8 bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
            <div>
              <h3 className="font-bold text-[#1e1e27] uppercase tracking-wider mb-4 border-b pb-2">Search</h3>
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-2 border border-gray-200 rounded outline-none focus:border-[#fe4c50]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <h3 className="font-bold text-[#1e1e27] uppercase tracking-wider mb-4 border-b pb-2">Price</h3>
              <div className="space-y-2">
                <input type="number" placeholder="Min" className="w-full p-2 border border-gray-200" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <input type="number" placeholder="Max" className="w-full p-2 border border-gray-200" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1e1e27] uppercase">{category?.name || 'Category'}</h1>
            <p className="text-gray-500 mt-2">Found {products.length} products</p>
          </div>

          {/* FIX: Ensure products is an array before mapping */}
          {Array.isArray(products) && products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-sm border border-dashed border-gray-200">
              No products found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {Array.isArray(products) && products.map(p => (
                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="group cursor-pointer bg-white border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[4/5] bg-[#f5f5f5] overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-multiply p-4 group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-[#1e1e27] font-medium text-lg truncate">{p.name}</h3>
                    <p className="text-[#fe4c50] font-bold mt-1">₹{parseFloat(p.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};