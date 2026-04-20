import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Icons = {
  Products: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  AddProduct: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Category: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  Offer: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

export const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editing Stock State
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');

  // Forms State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: '', stock_quantity: '' });
  const [productImageFile, setProductImageFile] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [newOffer, setNewOffer] = useState({ title: '', start_date: '', end_date: '' });
  const [offerImageFile, setOfferImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/vendor/products/'),
        api.get('/categories/')
      ]);
      // Handle paginated response structure
      setProducts(prodRes.data.results || prodRes.data);
      setCategories(catRes.data.results || catRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (productId) => {
    if (!newStockValue || parseInt(newStockValue) < 1) {
      return toast.error("Please enter a valid stock quantity");
    }
    try {
      const res = await api.patch(`/vendor/products/${productId}/`, {
        stock_quantity: newStockValue
      });
      setProducts(products.map(p => p.id === productId ? res.data : p));
      setEditingStockId(null);
      setNewStockValue('');
      toast.success("Stock updated successfully!");
    } catch (err) {
      toast.error("Failed to update stock.");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productImageFile) return toast.error("Please select an image");
    const formData = new FormData();
    Object.entries(newProduct).forEach(([key, value]) => formData.append(key, value));
    formData.append('image', productImageFile);

    try {
      const res = await api.post('/vendor/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProducts([...products, res.data]);
      toast.success("Product added! Waiting for admin approval.");
      setNewProduct({ name: '', price: '', description: '', category: '', stock_quantity: '' });
      setProductImageFile(null);
      setActiveTab('products');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add product");
    }
  };

  // Other handlers (Request Category/Offer) remain the same logic...
  const handleRequestCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newCategory.name);
    formData.append('image', categoryImageFile);
    try {
      await api.post('/vendor/category-requests/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("Category requested!");
      setNewCategory({ name: '' });
      setCategoryImageFile(null);
    } catch { toast.error("Failed to request category"); }
  };

  const handleRequestOffer = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newOffer).forEach(([key, value]) => formData.append(key, value));
    formData.append('image', offerImageFile);
    try {
      await api.post('/vendor/offer-requests/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("Offer requested!");
      setNewOffer({ title: '', start_date: '', end_date: '' });
      setOfferImageFile(null);
    } catch { toast.error("Failed to request offer"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-[#fe4c50] border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-10 font-sans bg-[#f5f5f5] min-h-[calc(100vh-80px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e1e27]">Vendor Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your catalog and request marketplace features.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 sticky top-28 overflow-hidden">
            <nav className="flex flex-col">
              <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icons.Products /> My Catalog
              </button>
              <button onClick={() => setActiveTab('add_product')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium border-t border-gray-100 ${activeTab === 'add_product' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icons.AddProduct /> Add Product
              </button>
              <button onClick={() => setActiveTab('request_category')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium border-t border-gray-100 ${activeTab === 'request_category' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icons.Category /> Request Category
              </button>
              <button onClick={() => setActiveTab('request_offer')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium border-t border-gray-100 ${activeTab === 'request_offer' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icons.Offer /> Request Offer
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          {activeTab === 'products' && (
            <div className="animate-fade-in bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50"><h2 className="text-lg font-bold text-[#1e1e27]">My Products</h2></div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="border border-gray-100 rounded-sm p-4 flex flex-col hover:shadow-md transition-shadow">
                    <div className="h-48 bg-[#f5f5f5] rounded-sm flex items-center justify-center mb-4">
                      <img src={p.image} className="max-h-full object-contain mix-blend-multiply" alt={p.name} />
                    </div>
                    <h3 className="font-bold text-[#1e1e27] truncate">{p.name}</h3>
                    <p className="text-[#fe4c50] font-bold mb-2">₹{parseFloat(p.price).toLocaleString()}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Stock: <span className={`font-bold ${p.stock_quantity === 0 ? 'text-red-500' : 'text-gray-800'}`}>{p.stock_quantity}</span></p>
                      {editingStockId === p.id ? (
                        <div className="mt-2 flex gap-2">
                          <input type="number" className="w-full p-2 border border-gray-200 text-sm outline-none focus:border-[#fe4c50]" placeholder="Qty" value={newStockValue} onChange={(e) => setNewStockValue(e.target.value)} />
                          <button onClick={() => handleRestock(p.id)} className="bg-[#1e1e27] text-white px-3 py-1 text-xs font-bold hover:bg-[#fe4c50]">SAVE</button>
                          <button onClick={() => setEditingStockId(null)} className="text-gray-400 p-1"><Icons.Offer /></button> {/* Placeholder Icon for X */}
                        </div>
                      ) : (
                        p.status === 'approved' && p.stock_quantity === 0 && (
                          <button onClick={() => { setEditingStockId(p.id); setNewStockValue(''); }} className="mt-2 w-full bg-[#1e1e27] text-white py-2 text-xs font-bold uppercase hover:bg-[#fe4c50] transition-colors">Restock Item</button>
                        )
                      )}
                    </div>
                    <div className="mt-auto pt-2 border-t border-gray-50">
                      <span className={`text-[10px] px-2 py-1 uppercase font-bold text-white rounded-sm ${p.status === 'approved' ? 'bg-green-500' : p.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};