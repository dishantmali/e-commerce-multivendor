import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all categories to get the name
        const catRes = await api.get('/categories/');
        const currentCat = catRes.data.find(c => c.id === parseInt(id));
        setCategory(currentCat);

        // Fetch all products and filter locally (since your backend doesn't have a ?category filter endpoint yet)
        const prodRes = await api.get('/products/');
        const filtered = prodRes.data.filter(p => p.category === parseInt(id));
        setProducts(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <h1 className="text-4xl font-bold text-[#1e1e27] mb-2 uppercase">{category?.name || 'Category'}</h1>
      <p className="text-gray-500 mb-10">Showing {products.length} results</p>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-20 bg-gray-50 border border-gray-100 rounded-sm">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.map(p => (
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
    </div>
  );
};