import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Icons = {
  Products: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  AddProduct: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Category: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  Offer: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Orders: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
};

export const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: '', stock_quantity: '' });
  const [productImageFile, setProductImageFile] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [newOffer, setNewOffer] = useState({ title: '', start_date: '', end_date: '' });
  const [offerImageFile, setOfferImageFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, ordRes] = await Promise.all([
          api.get('/vendor/products/'), 
          api.get('/categories/'),
          api.get('/orders/')
        ]);
        setProducts(prodRes.data.results || prodRes.data || []);
        setCategories(catRes.data.results || catRes.data || []);
        setOrders(ordRes.data.results || ordRes.data || []);
      } catch (error) { toast.error("Failed to load dashboard"); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleRestock = async (productId) => {
    if (!newStockValue || parseInt(newStockValue) < 1) return toast.error("Valid quantity required");
    try {
      const res = await api.patch(`/vendor/products/${productId}/`, { stock_quantity: newStockValue });
      setProducts(products.map(p => p.id === productId ? res.data : p));
      setEditingStockId(null); setNewStockValue('');
      toast.success("Stock updated!");
    } catch (err) { toast.error("Update failed"); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productImageFile) return toast.error("Please select an image");
    const formData = new FormData();
    Object.entries(newProduct).forEach(([key, value]) => formData.append(key, value));
    formData.append('image', productImageFile);

    try {
      const res = await api.post('/vendor/products/', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      setProducts([res.data, ...products]);
      toast.success("Product added! Waiting for admin approval.");
      setNewProduct({ name: '', price: '', description: '', category: '', stock_quantity: '' });
      setProductImageFile(null);
      setActiveTab('products');
    } catch (err) { toast.error("Failed to add product"); }
  };

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
    <div className="p-10 text-center text-[#5A3825] flex items-center justify-center gap-2">
      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Loading...
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-10 font-sans bg-[#FAF8F5] min-h-[calc(100vh-80px)]">

      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[#2C1E16]">Vendor Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your catalog and request marketplace features.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 animate-fade-in-left">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-[#5A3825]">
              <p className="text-white text-xs font-bold uppercase tracking-widest opacity-80">Navigation</p>
            </div>
            <nav className="flex flex-col">
              {[
                { key: 'products', label: 'My Catalog', Icon: Icons.Products, badge: null },
                { key: 'orders', label: 'Order Fulfillment', Icon: Icons.Orders, badge: orders.filter(o => o.status === 'pending').length },
                { key: 'add_product', label: 'Add Product', Icon: Icons.AddProduct, badge: null },
                { key: 'request_category', label: 'Request Category', Icon: Icons.Category, badge: null },
                { key: 'request_offer', label: 'Request Offer', Icon: Icons.Offer, badge: null },
              ].map(({ key, label, Icon, badge }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`admin-nav-item flex items-center justify-between px-6 py-4 text-sm font-medium border-t border-gray-100 transition-all duration-200 ${
                    activeTab === key
                      ? 'bg-[#5A3825] text-white shadow-inner'
                      : 'text-gray-600 hover:bg-[#FAF8F5] hover:text-[#5A3825] hover:pl-8'
                  }`}
                  style={{ transitionProperty: 'background, color, padding' }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-transform duration-200 ${activeTab === key ? 'scale-110' : ''}`}>
                      <Icon />
                    </span>
                    {label}
                  </div>
                  {badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${activeTab === key ? 'bg-white text-[#5A3825]' : 'bg-[#A87C51] text-white'}`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">

          {/* My Products Tab */}
          {activeTab === 'products' && (
            <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                <h2 className="text-lg font-bold text-[#2C1E16]">My Products</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {products.length === 0 ? (
                  <p className="text-gray-500 animate-fade-in col-span-full">No products added yet.</p>
                ) : products.map(p => (
                  <div
                    key={p.id}
                    className="product-card-anim border border-gray-100 rounded-xl p-4 flex flex-col bg-white animate-fade-in-up"
                  >
                    <div className="h-48 bg-[#FAF8F5] rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                      <img
                        src={p.image}
                        className="product-thumb max-h-full object-contain mix-blend-multiply"
                        alt={p.name}
                      />
                    </div>
                    <h3 className="font-bold text-[#2C1E16] truncate">{p.name}</h3>
                    <p className="text-[#A87C51] font-bold mb-2 text-lg">₹{parseFloat(p.price).toLocaleString()}</p>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        Stock: <span className={`font-bold transition-colors duration-300 ${p.stock_quantity === 0 ? 'text-red-500' : 'text-gray-800'}`}>{p.stock_quantity}</span>
                      </p>
                      {editingStockId === p.id ? (
                        <div className="mt-2 flex gap-2 animate-fade-in">
                          <input
                            type="number"
                            className="input-animated w-full p-2 border border-gray-200 text-sm outline-none focus:border-[#A87C51] rounded-md"
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(e.target.value)}
                          />
                          <button
                            onClick={() => handleRestock(p.id)}
                            className="action-btn bg-[#5A3825] text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-[#3E2723]"
                          >SAVE</button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="remove-btn text-gray-400 p-1 font-bold"
                          >✕</button>
                        </div>
                      ) : (
                        p.status === 'approved' && p.stock_quantity === 0 && (
                          <button
                            onClick={() => { setEditingStockId(p.id); setNewStockValue(''); }}
                            className="mt-2 w-full border border-[#5A3825] text-[#5A3825] rounded-full py-2 text-xs font-bold hover:bg-[#5A3825] hover:text-white transition-all duration-200 active:scale-95"
                          >Restock</button>
                        )
                      )}
                    </div>
                    <div className="mt-auto pt-2 border-t border-gray-50">
                      <span className={`text-[10px] px-2 py-1 uppercase font-bold text-white rounded-md transition-all duration-300 ${p.status === 'approved' ? 'bg-[#A87C51]' : p.status === 'rejected' ? 'bg-red-500' : 'bg-gray-400'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Fulfillment Tab */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                <h2 className="text-lg font-bold text-[#2C1E16]">Order Fulfillment</h2>
              </div>
              <div className="p-6 space-y-4">
                {orders.length === 0 ? (
                  <p className="text-gray-500">No orders to fulfill yet.</p>
                ) : orders.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-5 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <img src={item.product_details?.image} alt="" className="w-16 h-16 object-cover rounded-lg border bg-[#FAF8F5]" />
                      <div>
                        <p className="text-xs text-gray-500 font-bold tracking-widest">ORDER #{item.order_id} • {new Date(item.order_date).toLocaleDateString()}</p>
                        <p className="font-bold text-[#2C1E16] text-lg">{item.product_details?.name} (x{item.quantity})</p>
                        <p className="text-sm text-gray-600 mt-1"><span className="font-bold">Buyer:</span> {item.buyer_name}</p>
                        <p className="text-sm text-gray-600"><span className="font-bold">Address:</span> {item.address} | <span className="font-bold">Phone:</span> {item.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      <label className="text-xs font-bold text-gray-500 uppercase">Update Status</label>
                      <select 
                        className={`p-2 border rounded-lg text-sm font-bold outline-none transition-colors duration-200 ${
                          item.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:border-yellow-400' :
                          item.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:border-blue-400' :
                          item.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:border-purple-400' :
                          'bg-green-50 text-green-700 border-green-200 focus:border-green-400'
                        }`}
                        value={item.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await api.patch(`/vendor/order-items/${item.id}/status/`, { status: newStatus });
                            setOrders(orders.map(o => o.id === item.id ? { ...o, status: newStatus } : o));
                            toast.success("Status Updated");
                          } catch { toast.error("Failed to update"); }
                        }}
                      >
                        <option value="pending" className="bg-white text-gray-700">Pending</option>
                        <option value="confirmed" className="bg-white text-gray-700">Confirmed</option>
                        <option value="shipped" className="bg-white text-gray-700">Shipped</option>
                        <option value="delivered" className="bg-white text-gray-700">Delivered</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Product Tab */}
          {activeTab === 'add_product' && (
            <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                <h2 className="text-lg font-bold text-[#2C1E16]">Add New Product</h2>
              </div>
              <form onSubmit={handleAddProduct} className="p-6 space-y-5 max-w-2xl">
                <div className="animate-fade-in-up delay-1">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Product Name</label>
                  <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 hover:border-[#A87C51]/50" />
                </div>
                <div className="grid grid-cols-2 gap-4 animate-fade-in-up delay-2">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Price (₹)</label>
                    <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 hover:border-[#A87C51]/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Initial Stock</label>
                    <input type="number" required value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                      className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 hover:border-[#A87C51]/50" />
                  </div>
                </div>
                <div className="animate-fade-in-up delay-3">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Category</label>
                  <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 cursor-pointer hover:border-[#A87C51]/50">
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="animate-fade-in-up delay-3">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Description</label>
                  <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} rows="4"
                    className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 resize-none hover:border-[#A87C51]/50"></textarea>
                </div>
                <div className="animate-fade-in-up delay-4">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Product Image</label>
                  <input type="file" accept="image/*" required onChange={e => setProductImageFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#FAF8F5] file:text-[#2C1E16] file:cursor-pointer file:transition-colors file:hover:bg-[#5A3825] file:hover:text-white" />
                </div>
                <div className="animate-fade-in-up delay-5">
                  <button type="submit" className="btn-primary w-full bg-[#5A3825] text-white py-3 rounded-full font-bold uppercase tracking-wider hover:bg-[#3E2723] transition-all duration-200">
                    Submit for Approval
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Request Category Tab */}
          {activeTab === 'request_category' && (
            <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                <h2 className="text-lg font-bold text-[#2C1E16]">Request a New Category</h2>
              </div>
              <form onSubmit={handleRequestCategory} className="p-6 space-y-5 max-w-md">
                <div className="animate-fade-in-up delay-1">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Category Name</label>
                  <input type="text" required value={newCategory.name} onChange={e => setNewCategory({name: e.target.value})}
                    className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 hover:border-[#A87C51]/50" />
                </div>
                <div className="animate-fade-in-up delay-2">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Reference Image</label>
                  <input type="file" accept="image/*" required onChange={e => setCategoryImageFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#FAF8F5] file:text-[#2C1E16] file:cursor-pointer file:transition-colors file:hover:bg-[#5A3825] file:hover:text-white" />
                </div>
                <div className="animate-fade-in-up delay-3">
                  <button type="submit" className="btn-primary w-full bg-[#5A3825] text-white py-3 rounded-full font-bold uppercase tracking-wider hover:bg-[#3E2723] transition-all duration-200">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Request Offer Tab */}
          {activeTab === 'request_offer' && (
            <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                <h2 className="text-lg font-bold text-[#2C1E16]">Request a Promo Offer</h2>
              </div>
              <form onSubmit={handleRequestOffer} className="p-6 space-y-5 max-w-md">
                <div className="animate-fade-in-up delay-1">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Offer Title</label>
                  <input type="text" required value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})}
                    className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 hover:border-[#A87C51]/50" />
                </div>
                <div className="grid grid-cols-2 gap-4 animate-fade-in-up delay-2">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Start Date</label>
                    <input type="date" required value={newOffer.start_date} onChange={e => setNewOffer({...newOffer, start_date: e.target.value})}
                      className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 cursor-pointer hover:border-[#A87C51]/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">End Date</label>
                    <input type="date" required value={newOffer.end_date} onChange={e => setNewOffer({...newOffer, end_date: e.target.value})}
                      className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none focus:border-[#A87C51] transition-all duration-200 cursor-pointer hover:border-[#A87C51]/50" />
                  </div>
                </div>
                <div className="animate-fade-in-up delay-3">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Banner Image</label>
                  <input type="file" accept="image/*" required onChange={e => setOfferImageFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#FAF8F5] file:text-[#2C1E16] file:cursor-pointer file:transition-colors file:hover:bg-[#5A3825] file:hover:text-white" />
                </div>
                <div className="animate-fade-in-up delay-4">
                  <button type="submit" className="btn-primary w-full bg-[#5A3825] text-white py-3 rounded-full font-bold uppercase tracking-wider hover:bg-[#3E2723] transition-all duration-200">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};