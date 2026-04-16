/* src/pages/AdminDashboard.jsx */
import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Icons = {
  Overview: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Vendors: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Products: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Categories: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  Orders: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
};

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, vendRes, userRes, catRes, orderRes] = await Promise.all([
        api.get('/admin/products/pending/'),
        api.get('/admin/vendors/pending/'),
        api.get('/admin/users/'),
        api.get('/admin/categories/'),
        api.get('/admin/orders/')
      ]);
      setPendingProducts(prodRes.data);
      setPendingVendors(vendRes.data);
      setUsers(userRes.data);
      setCategories(catRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      toast.error("Error loading admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type, id, action) => {
    try {
      if (type === 'product') {
        await api.post(`/admin/products/${id}/action/`, { action });
        setPendingProducts(pendingProducts.filter(p => p.id !== id));
      } else if (type === 'vendor') {
        await api.post(`/admin/vendors/${id}/action/`, { action });
        setPendingVendors(pendingVendors.filter(v => v.id !== id));
      }
      toast.success(`${type} ${action}d successfully`);
    } catch (err) {
      toast.error(`Failed to ${action} ${type}`);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/categories/', { name: newCatName });
      setCategories([...categories, res.data]);
      setNewCatName('');
      toast.success("Category created!");
    } catch (err) {
      toast.error("Failed to create category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure? This may affect products in this category.")) return;
    try {
      await api.delete(`/admin/categories/${id}/`);
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error("Failed to delete category");
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
        <h1 className="text-3xl font-bold text-[#1e1e27]">Admin Portal</h1>
        <p className="text-gray-500 mt-1">Manage your marketplace, vendors, and catalog.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden sticky top-28">
            <nav className="flex flex-col">
              
              <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#fe4c50]'}`}>
                <Icons.Overview /> Platform Overview
              </button>
              
              <button onClick={() => setActiveTab('vendors')} className={`flex items-center justify-between px-6 py-4 text-sm font-medium transition-colors border-t border-gray-100 ${activeTab === 'vendors' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#fe4c50]'}`}>
                <div className="flex items-center gap-3"><Icons.Vendors /> Pending Vendors</div>
                {pendingVendors.length > 0 && <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === 'vendors' ? 'bg-white text-[#fe4c50]' : 'bg-[#fe4c50] text-white'}`}>{pendingVendors.length}</span>}
              </button>
              
              <button onClick={() => setActiveTab('products')} className={`flex items-center justify-between px-6 py-4 text-sm font-medium transition-colors border-t border-gray-100 ${activeTab === 'products' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#fe4c50]'}`}>
                <div className="flex items-center gap-3"><Icons.Products /> Pending Products</div>
                {pendingProducts.length > 0 && <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === 'products' ? 'bg-white text-[#fe4c50]' : 'bg-[#fe4c50] text-white'}`}>{pendingProducts.length}</span>}
              </button>

              <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-t border-gray-100 ${activeTab === 'users' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#fe4c50]'}`}>
                <Icons.Users /> Users Directory
              </button>

              <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-t border-gray-100 ${activeTab === 'categories' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#fe4c50]'}`}>
                <Icons.Categories /> Manage Categories
              </button>

              <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-t border-gray-100 ${activeTab === 'orders' ? 'bg-[#fe4c50] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#fe4c50]'}`}>
                <Icons.Orders /> Global Orders
              </button>

            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-hidden">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 border-l-4 border-l-[#fe4c50]">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Pending Vendors</p>
                  <h3 className="text-3xl font-bold text-[#1e1e27]">{pendingVendors.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 border-l-4 border-l-orange-400">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Pending Products</p>
                  <h3 className="text-3xl font-bold text-[#1e1e27]">{pendingProducts.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Buyers</p>
                  <h3 className="text-3xl font-bold text-[#1e1e27]">{users.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
                  <h3 className="text-3xl font-bold text-[#1e1e27]">{orders.length}</h3>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VENDORS */}
          {activeTab === 'vendors' && (
            <div className="animate-fade-in bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#1e1e27]">Vendor Applications</h2>
              </div>
              {pendingVendors.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No pending vendor applications.</div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Shop Details</th>
                        <th className="px-6 py-4 font-semibold">Contact Info</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pendingVendors.map(vendor => (
                        <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-normal min-w-[250px]">
                            <p className="font-bold text-[#1e1e27] text-base">{vendor.shop_name}</p>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{vendor.address}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-[#1e1e27] font-medium">{vendor.email}</p>
                            <p className="text-sm text-gray-500 mt-1">{vendor.phone}</p>
                          </td>
                          <td className="px-6 py-4 flex justify-end gap-2">
                            <button onClick={() => handleAction('vendor', vendor.id, 'reject')} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#fe4c50] bg-red-50 hover:bg-[#fe4c50] hover:text-white transition-colors rounded-sm">Reject</button>
                            <button onClick={() => handleAction('vendor', vendor.id, 'approve')} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#1e1e27] hover:bg-green-600 transition-colors rounded-sm">Approve</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="animate-fade-in bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#1e1e27]">Product Review Queue</h2>
              </div>
              {pendingProducts.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No products awaiting review.</div>
              ) : (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {pendingProducts.map(product => (
                    <div key={product.id} className="border border-gray-100 rounded-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                      <div className="relative aspect-square bg-[#f5f5f5] p-4">
                        <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" alt={product.name} />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 truncate">{product.vendor_shop}</p>
                        <h3 className="font-bold text-[#1e1e27] truncate mb-2">{product.name}</h3>
                        <p className="text-[#fe4c50] font-bold mb-4">₹{parseFloat(product.price).toLocaleString()}</p>
                        <div className="mt-auto grid grid-cols-2 gap-2">
                          <button onClick={() => handleAction('product', product.id, 'reject')} className="w-full py-2 text-xs font-bold uppercase text-[#fe4c50] border border-[#fe4c50] hover:bg-[#fe4c50] hover:text-white transition-colors rounded-sm">Reject</button>
                          <button onClick={() => handleAction('product', product.id, 'approve')} className="w-full py-2 text-xs font-bold uppercase text-white bg-[#1e1e27] hover:bg-green-600 transition-colors rounded-sm">Approve</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="animate-fade-in bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-[#1e1e27]">Users Directory (Buyers)</h2>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User ID</th>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-500">#{user.id}</td>
                        <td className="px-6 py-4 font-bold text-[#1e1e27]">{user.name}</td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-sm text-xs font-bold uppercase">{user.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Category Form */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-[#1e1e27] mb-4">Create Category</h2>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Category Name" 
                      required 
                      value={newCatName} 
                      onChange={e => setNewCatName(e.target.value)} 
                      className="w-full p-3 bg-gray-50 border border-gray-200 outline-none focus:border-[#fe4c50] transition-colors" 
                    />
                    <button type="submit" className="w-full bg-[#1e1e27] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#fe4c50] transition-colors">
                      Add Category
                    </button>
                  </form>
                </div>
              </div>
              
              {/* Category List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-[#1e1e27]">Existing Categories</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {categories.length === 0 ? <p className="p-6 text-gray-500">No categories found.</p> : categories.map(cat => (
                      <div key={cat.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                        <span className="font-bold text-[#1e1e27]">{cat.name}</span>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-sm text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-[#1e1e27]">Global Order Ledger</h2>
              </div>
              {orders.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No orders placed yet.</div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Order ID</th>
                        <th className="px-6 py-4 font-semibold">Buyer Info</th>
                        <th className="px-6 py-4 font-semibold">Total Amount</th>
                        <th className="px-6 py-4 font-semibold">Pay Status</th>
                        <th className="px-6 py-4 font-semibold">Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-500">#{order.id}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-[#1e1e27]">{order.buyer_name}</p>
                            <p className="text-sm text-gray-500">{order.buyer_email}</p>
                          </td>
                          <td className="px-6 py-4 font-bold text-[#fe4c50]">₹{parseFloat(order.total_price).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase ${order.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                              {order.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-sm text-xs font-bold uppercase">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};