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

  // Forms State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: '',stock_quantity: '' });
  const [productImageFile, setProductImageFile] = useState(null);

  const [newCategory, setNewCategory] = useState({ name: '' });
  const [categoryImageFile, setCategoryImageFile] = useState(null);

  const [newOffer, setNewOffer] = useState({ title: '', start_date: '', end_date: '' });
  const [offerImageFile, setOfferImageFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/vendor/products/'),
          api.get('/categories/')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productImageFile) return toast.error("Please select an image");
    
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('stock_quantity', newProduct.stock_quantity);
    formData.append('description', newProduct.description);
    formData.append('category', newProduct.category);
    formData.append('image', productImageFile);

    try {
      const res = await api.post('/vendor/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProducts([...products, res.data]);
      toast.success("Product added! Waiting for admin approval.");
      setNewProduct({ name: '', price: '', description: '', category: '' });
      setProductImageFile(null);
      setActiveTab('products');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add product");
    }
  };

  const handleRequestCategory = async (e) => {
    e.preventDefault();
    if (!categoryImageFile) return toast.error("Please select a category background image");

    const formData = new FormData();
    formData.append('name', newCategory.name);
    formData.append('image', categoryImageFile);

    try {
      await api.post('/vendor/category-requests/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Category requested! Awaiting admin approval.");
      setNewCategory({ name: '' });
      setCategoryImageFile(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to request category");
    }
  };

  const handleRequestOffer = async (e) => {
    e.preventDefault();
    if (!offerImageFile) return toast.error("Please select an offer image");

    const formData = new FormData();
    formData.append('title', newOffer.title);
    formData.append('start_date', newOffer.start_date);
    formData.append('end_date', newOffer.end_date);
    formData.append('image', offerImageFile);

    try {
      await api.post('/vendor/offer-requests/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Offer requested! Awaiting admin approval.");
      setNewOffer({ title: '', start_date: '', end_date: '' });
      setOfferImageFile(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to request offer");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-[#fe4c50] border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-10 font-sans bg-[#f5f5f5] min-h-[calc(100vh-80px)]">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e1e27]">Vendor Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your catalog, add products, and request new features.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden sticky top-28">
            <nav className="flex flex-col">
              
              <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#fe4c50]'}`}>
                <Icons.Products /> My Catalog
              </button>
              
              <button onClick={() => setActiveTab('add_product')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-t border-gray-100 ${activeTab === 'add_product' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#fe4c50]'}`}>
                <Icons.AddProduct /> Add Product
              </button>
              
              <button onClick={() => setActiveTab('request_category')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-t border-gray-100 ${activeTab === 'request_category' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#fe4c50]'}`}>
                <Icons.Category /> Request Category
              </button>

              <button onClick={() => setActiveTab('request_offer')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-t border-gray-100 ${activeTab === 'request_offer' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#fe4c50]'}`}>
                <Icons.Offer /> Request Offer
              </button>

            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-hidden">
          
          {/* TAB: MY CATALOG */}
          {activeTab === 'products' && (
            <div className="animate-fade-in bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#1e1e27]">My Products</h2>
              </div>
              {products.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No products added yet.</div>
              ) : (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="border border-gray-100 rounded-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col pt-4">
                      <div className="relative h-48 bg-[#f5f5f5] p-2 mx-4 rounded-sm flex items-center justify-center">
                        <img src={p.image} className="w-full h-full object-contain mix-blend-multiply" alt={p.name} />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-[#1e1e27] truncate mb-1">{p.name}</h3>
                        <p className="text-[#fe4c50] font-bold mb-4">₹{parseFloat(p.price).toLocaleString()}</p>
                        <div className="mt-auto">
                          <span className={`text-xs px-3 py-1 uppercase font-bold text-white inline-block rounded-sm ${p.status === 'approved' ? 'bg-green-500' : p.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ADD PRODUCT */}
          {activeTab === 'add_product' && (
            <div className="animate-fade-in bg-white p-8 rounded-sm shadow-sm border border-gray-100 w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-[#1e1e27] mb-6">Add New Product</h2>
              <form onSubmit={handleAddProduct} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input required type="text" className="w-full p-3 border border-gray-200 outline-none focus:border-[#fe4c50] rounded-sm transition-colors" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input required type="number" className="w-full p-3 border border-gray-200 outline-none focus:border-[#fe4c50] rounded-sm transition-colors" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                {/* NEW STOCK QUANTITY FIELD */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
    <input 
      required 
      type="number" 
      min="0" 
      className="w-full p-3 border border-gray-200 outline-none focus:border-[#fe4c50] rounded-sm transition-colors" 
      value={newProduct.stock_quantity} 
      onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} 
    />
  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select required className="w-full p-3 border border-gray-200 outline-none focus:border-[#fe4c50] rounded-sm transition-colors bg-white mt-1" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea required rows="4" className="w-full p-3 border border-gray-200 outline-none focus:border-[#fe4c50] rounded-sm transition-colors" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <input required type="file" accept="image/*" onChange={e => setProductImageFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-[#1e1e27] hover:file:bg-gray-100" />
                </div>
                <button type="submit" className="w-full bg-[#1e1e27] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#fe4c50] transition-colors rounded-sm mt-4">Submit Product</button>
              </form>
            </div>
          )}

          {/* TAB: REQUEST CATEGORY */}
          {activeTab === 'request_category' && (
            <div className="animate-fade-in bg-white p-8 rounded-sm shadow-sm border border-gray-100 w-full max-w-xl">
              <h2 className="text-2xl font-bold text-[#1e1e27] mb-6">Request New Category</h2>
              <form onSubmit={handleRequestCategory} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input required type="text" className="w-full p-3 border border-gray-200 outline-none focus:border-[#fe4c50] rounded-sm transition-colors" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Background Image</label>
                  <input required type="file" accept="image/*" onChange={e => setCategoryImageFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-[#1e1e27] hover:file:bg-gray-100" />
                </div>
                <button type="submit" className="w-full bg-[#1e1e27] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#fe4c50] transition-colors rounded-sm mt-4">Submit Category Request</button>
              </form>
            </div>
          )}

          {/* TAB: REQUEST OFFER */}
          {activeTab === 'request_offer' && (
            <div className="animate-fade-in bg-white p-8 rounded-sm shadow-sm border border-gray-100 w-full max-w-xl">
              <h2 className="text-2xl font-bold text-[#1e1e27] mb-6">Request New Offer</h2>
              <form onSubmit={handleRequestOffer} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label>
                  <input required type="text" placeholder="e.g. FLAT 50% OFF" className="w-full p-3 border border-gray-200 outline-none focus:border-[#fe4c50] rounded-sm transition-colors" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input required type="date" className="w-full p-3 border border-gray-200 outline-none focus:border-[#fe4c50] rounded-sm transition-colors" value={newOffer.start_date} onChange={e => setNewOffer({...newOffer, start_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input required type="date" className="w-full p-3 border border-gray-200 outline-none focus:border-[#fe4c50] rounded-sm transition-colors" value={newOffer.end_date} onChange={e => setNewOffer({...newOffer, end_date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Banner Image</label>
                  <input required type="file" accept="image/*" onChange={e => setOfferImageFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-[#1e1e27] hover:file:bg-gray-100" />
                </div>
                <button type="submit" className="w-full bg-[#1e1e27] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#fe4c50] transition-colors rounded-sm mt-4">Submit Offer Request</button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};