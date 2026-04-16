import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const VendorDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: '' });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/vendor/products/'),
          api.get('/categories/')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error("Please select an image");
    
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('description', newProduct.description);
    formData.append('category', newProduct.category);
    formData.append('image', imageFile);

    try {
      const res = await api.post('/vendor/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProducts([...products, res.data]);
      toast.success("Product added! Waiting for admin approval.");
      setNewProduct({ name: '', price: '', description: '', category: '' });
      setImageFile(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add product");
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans flex flex-col md:flex-row gap-10">
      
      {/* Left: Add Product Form */}
      <div className="w-full md:w-1/3">
        <div className="bg-[#f5f5f5] p-6 rounded-sm border border-gray-200">
          <h2 className="text-xl font-bold text-[#1e1e27] mb-6 border-b pb-2">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <input required type="text" placeholder="Product Name" className="w-full p-3 border outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
            <input required type="number" placeholder="Price (₹)" className="w-full p-3 border outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
            <select required className="w-full p-3 border outline-none bg-white" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea required placeholder="Description" rows="3" className="w-full p-3 border outline-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
            <input required type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full text-sm" />
            <button type="submit" className="w-full bg-[#fe4c50] text-white py-3 font-bold uppercase hover:bg-[#e04347]">Submit Product</button>
          </form>
        </div>
      </div>

      {/* Right: My Products List */}
      <div className="w-full md:w-2/3">
        <h2 className="text-2xl font-bold text-[#1e1e27] mb-6 border-b pb-2">My Catalog</h2>
        {products.length === 0 ? <p>No products yet.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map(p => (
              <div key={p.id} className="border border-gray-200 p-4 flex gap-4 bg-white relative">
                <img src={p.image} className="w-24 h-24 object-cover bg-gray-50" alt="" />
                <div>
                  <h3 className="font-medium text-[#1e1e27]">{p.name}</h3>
                  <p className="text-[#fe4c50] font-bold">₹{p.price}</p>
                  <span className={`text-xs px-2 py-1 uppercase font-bold text-white mt-2 inline-block ${p.status === 'approved' ? 'bg-green-500' : p.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};