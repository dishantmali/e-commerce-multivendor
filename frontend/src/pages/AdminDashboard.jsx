import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Icons = {
  Overview:   () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>,
  Vendors:    () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" /></svg>,
  Products:   () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Users:      () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Categories: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  Orders:     () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Offers:     () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categoryRequests, setCategoryRequests] = useState([]);
  const [offers, setOffers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState(null);
  const [newOffer, setNewOffer] = useState({ title: '', start_date: '', end_date: '' });
  const [offerImageFile, setOfferImageFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, vendRes, userRes, catRes, orderRes, catReqRes, offerRes] = await Promise.all([
          api.get('/admin/products/pending/'),
          api.get('/admin/vendors/pending/'),
          api.get('/admin/users/'),
          api.get('/admin/categories/'),
          api.get('/admin/orders/'),
          api.get('/admin/category-requests/'),
          api.get('/admin/offers/')
        ]);

        setPendingProducts(prodRes.data.results || prodRes.data || []);
        setPendingVendors(vendRes.data.results || vendRes.data || []);
        setUsers(userRes.data.results || userRes.data || []);
        setCategories(catRes.data.results || catRes.data || []);
        setOrders(orderRes.data.results || orderRes.data || []);
        setCategoryRequests(catReqRes.data.results || catReqRes.data || []);
        setOffers(offerRes.data.results || offerRes.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Error loading admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    } catch (error) {
      toast.error(`Failed to ${action} ${type}`);
    }
  };

  const handleCatRequestAction = async (id, action) => {
    try {
      await api.post(`/admin/category-requests/${id}/action/`, { action });
      setCategoryRequests(categoryRequests.filter(req => req.id !== id));
      if (action === 'approve') {
        const res = await api.get('/admin/categories/');
        setCategories(res.data.results || res.data);
      }
      toast.success(`Category request ${action}d`);
    } catch (error) {
      toast.error("Failed category request action");
    }
  };

  const handleOfferAction = async (id, action) => {
    try {
      await api.post(`/admin/offers/${id}/action/`, { action });
      const res = await api.get('/admin/offers/');
      setOffers(res.data.results || res.data);
      toast.success(`Offer ${action}d`);
    } catch (error) {
      toast.error("Failed offer action");
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      // FIX: Added /action/ to the end of the URL to match Django urls.py
      await api.delete(`/admin/offers/${id}/action/`);
      setOffers(offers.filter(o => o.id !== id));
      toast.success("Offer deleted");
    } catch (error) {
      toast.error("Failed to delete offer");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatImage) return toast.error("Please provide an image for the category");
    const formData = new FormData();
    formData.append('name', newCatName);
    formData.append('image', newCatImage);

    try {
      const res = await api.post('/admin/categories/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCategories([...categories, res.data]);
      setNewCatName('');
      setNewCatImage(null);
      const fileInput = document.getElementById('catImageInput');
      if (fileInput) fileInput.value = '';
      toast.success("Category created!");
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure? This may affect products in this category.")) return;
    try {
      await api.delete(`/admin/categories/${id}/`);
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!offerImageFile) return toast.error("Please provide an image for the offer");
    const formData = new FormData();
    formData.append('title', newOffer.title);
    formData.append('start_date', newOffer.start_date);
    formData.append('end_date', newOffer.end_date);
    formData.append('image', offerImageFile);

    try {
      const res = await api.post('/admin/offers/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setOffers([res.data, ...offers]);
      setNewOffer({ title: '', start_date: '', end_date: '' });
      setOfferImageFile(null);
      const fileInput = document.getElementById('offerImageInput');
      if (fileInput) fileInput.value = '';
      toast.success("Offer created!");
    } catch (error) {
      toast.error("Failed to create offer");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-[#5A3825]">Loading...</div>
  );

  const pendingCatReqs  = categoryRequests.filter(r => r.status === 'pending');
  const pendingOfferReqs = offers.filter(o => o.status === 'pending');

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-10 font-sans bg-[#FAF8F5] min-h-[calc(100vh-80px)]">

      <div className="animate-fade-in mb-8">
        <h1 className="text-3xl font-bold text-[#2C1E16]">Admin Portal</h1>
        <p className="text-gray-500 mt-1">Manage your marketplace, vendors, and catalog.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* ── Sidebar ── */}
        <aside className="animate-fade-in-left w-full md:w-72 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-28">
            <nav className="flex flex-col">
              {[
                { key: 'overview',    label: 'Overview',          Icon: Icons.Overview,    badge: null },
                { key: 'vendors',     label: 'Pending Vendors',   Icon: Icons.Vendors,     badge: pendingVendors.length },
                { key: 'products',    label: 'Pending Products',  Icon: Icons.Products,    badge: pendingProducts.length },
                { key: 'users',       label: 'Users Directory',   Icon: Icons.Users,       badge: null },
                { key: 'categories',  label: 'Categories',        Icon: Icons.Categories,  badge: pendingCatReqs.length },
                { key: 'offers',      label: 'Offers',            Icon: Icons.Offers,      badge: pendingOfferReqs.length },
                { key: 'orders',      label: 'Global Orders',     Icon: Icons.Orders,      badge: null },
              ].map(({ key, label, Icon, badge }, i) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`admin-nav-item flex items-center justify-between px-6 py-4 text-sm font-medium ${i > 0 ? 'border-t border-gray-100' : ''} ${activeTab === key ? 'bg-[#5A3825] text-white' : 'text-gray-600 hover:bg-[#FAF8F5]'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon /> {label}
                  </div>
                  {badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === key ? 'bg-white text-[#5A3825]' : 'bg-[#A87C51] text-white'}`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 w-full overflow-hidden">

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card animate-fade-in-up bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#5A3825]">
                <p className="text-sm font-bold text-gray-500 uppercase">Pending Vendors</p>
                <h3 className="text-3xl font-bold text-[#2C1E16]">{pendingVendors.length}</h3>
              </div>
              <div className="stat-card animate-fade-in-up bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#A87C51]">
                <p className="text-sm font-bold text-gray-500 uppercase">Pending Products</p>
                <h3 className="text-3xl font-bold text-[#2C1E16]">{pendingProducts.length}</h3>
              </div>
              <div className="stat-card animate-fade-in-up bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                <p className="text-sm font-bold text-gray-500 uppercase">Total Buyers</p>
                <h3 className="text-3xl font-bold text-[#2C1E16]">{users.length}</h3>
              </div>
              <div className="stat-card animate-fade-in-up bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                <p className="text-sm font-bold text-gray-500 uppercase">Total Orders</p>
                <h3 className="text-3xl font-bold text-[#2C1E16]">{orders.length}</h3>
              </div>
            </div>
          )}

          {/* Vendors */}
          {activeTab === 'vendors' && (
            <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                <h2 className="text-lg font-bold text-[#2C1E16]">Vendor Applications</h2>
              </div>
              {pendingVendors.length === 0
                ? <div className="p-10 text-center text-gray-500">No pending vendor applications.</div>
                : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-[#FAF8F5] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Shop Details</th>
                          <th className="px-6 py-4 font-semibold">Contact Info</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pendingVendors.map(v => (
                          <tr key={v.id} className="admin-table-row">
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#2C1E16]">{v.shop_name}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">{v.address}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-[#2C1E16] font-medium">{v.email}</p>
                              <p className="text-sm text-gray-500 mt-1">{v.phone}</p>
                            </td>
                            <td className="px-6 py-4 flex justify-end gap-2">
                              <button onClick={() => handleAction('vendor', v.id, 'reject')} className="action-btn px-4 py-2 text-xs font-bold uppercase text-red-500 bg-red-50 rounded-md">Reject</button>
                              <button onClick={() => handleAction('vendor', v.id, 'approve')} className="action-btn px-4 py-2 text-xs font-bold uppercase text-white bg-[#5A3825] rounded-md">Approve</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* Products */}
          {activeTab === 'products' && (
            <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                <h2 className="text-lg font-bold text-[#2C1E16]">Product Review Queue</h2>
              </div>
              {pendingProducts.length === 0
                ? <div className="p-10 text-center text-gray-500">No products awaiting review.</div>
                : (
                  <div className="p-6 stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingProducts.map(p => (
                      <div key={p.id} className="review-card animate-fade-in-up border border-gray-100 rounded-xl overflow-hidden flex flex-col pt-4">
                        <div className="relative aspect-square bg-[#FAF8F5] p-2 mx-4 rounded-lg flex items-center justify-center">
                          <img src={p.image} className="w-full h-full object-contain mix-blend-multiply" alt={p.name} />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <p className="text-xs text-gray-400 uppercase mb-1 truncate">{p.vendor_shop}</p>
                          <h3 className="font-bold text-[#2C1E16] truncate mb-2">{p.name}</h3>
                          <p className="text-[#A87C51] font-bold mb-4">₹{parseFloat(p.price).toLocaleString()}</p>
                          <div className="mt-auto grid grid-cols-2 gap-2">
                            <button onClick={() => handleAction('product', p.id, 'reject')} className="action-btn w-full py-2 text-xs font-bold text-red-500 border border-red-500 rounded-md">Reject</button>
                            <button onClick={() => handleAction('product', p.id, 'approve')} className="action-btn w-full py-2 text-xs font-bold text-white bg-[#5A3825] rounded-md">Approve</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                <h2 className="text-lg font-bold text-[#2C1E16]">Users Directory (Buyers)</h2>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-[#FAF8F5] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User ID</th>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.id} className="admin-table-row">
                        <td className="px-6 py-4 font-medium text-gray-500">#{u.id}</td>
                        <td className="px-6 py-4 font-bold text-[#2C1E16]">{u.name}</td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="bg-[#FAF8F5] text-[#5A3825] px-3 py-1 rounded-md text-xs font-bold uppercase">{u.role}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === 'categories' && (
            <div className="animate-fade-in flex flex-col gap-8">
              {pendingCatReqs.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                    <h2 className="text-lg font-bold text-[#2C1E16]">Pending Category Requests</h2>
                  </div>
                  <div className="p-6 stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingCatReqs.map(req => (
                      <div key={req.id} className="review-card animate-fade-in-up border border-gray-100 rounded-xl p-4">
                        {req.image && <img src={req.image} className="w-full h-32 object-cover rounded-md mb-4" alt={req.name} />}
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 truncate">Req by: {req.vendor_shop}</p>
                        <h3 className="font-bold text-[#2C1E16] truncate mb-4">{req.name}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleCatRequestAction(req.id, 'reject')} className="action-btn w-full py-2 text-xs font-bold text-red-500 border border-red-500 rounded-md">Reject</button>
                          <button onClick={() => handleCatRequestAction(req.id, 'approve')} className="action-btn w-full py-2 text-xs font-bold text-white bg-[#5A3825] rounded-md">Approve</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-[#2C1E16] mb-4">Create Category</h2>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <input type="text" placeholder="Category Name" required value={newCatName} onChange={e => setNewCatName(e.target.value)} className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none" />
                      <input id="catImageInput" type="file" accept="image/*" required onChange={e => setNewCatImage(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FAF8F5] file:text-[#2C1E16]" />
                      <button type="submit" className="btn-primary w-full bg-[#5A3825] text-white py-3 rounded-full font-bold uppercase tracking-wider hover:bg-[#3E2723]">Add Category</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
                    <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                      <h2 className="text-lg font-bold text-[#2C1E16]">Existing Categories</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {categories.length === 0
                        ? <p className="p-6 text-gray-500">No categories found.</p>
                        : categories.map(cat => (
                          <div key={cat.id} className="admin-list-item p-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              {cat.image && <img src={cat.image} className="w-12 h-12 object-cover rounded-lg border border-gray-200" alt={cat.name} />}
                              <span className="font-bold text-[#2C1E16]">{cat.name}</span>
                            </div>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="action-btn text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium">Delete</button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Offers */}
          {activeTab === 'offers' && (
            <div className="animate-fade-in flex flex-col gap-8">
              {pendingOfferReqs.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                    <h2 className="text-lg font-bold text-[#2C1E16]">Pending Offer Requests</h2>
                  </div>
                  <div className="p-6 stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingOfferReqs.map(offer => (
                      <div key={offer.id} className="review-card animate-fade-in-up border border-gray-100 rounded-xl p-4">
                        {offer.image && <img src={offer.image} className="w-full h-32 object-cover rounded-md mb-4" alt={offer.title} />}
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 truncate">Req by: {offer.vendor_shop}</p>
                        <h3 className="font-bold text-[#2C1E16] truncate">{offer.title}</h3>
                        <p className="text-xs text-gray-500 mb-4">{offer.start_date} to {offer.end_date}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleOfferAction(offer.id, 'reject')} className="action-btn w-full py-2 text-xs font-bold text-red-500 border border-red-500 rounded-md">Reject</button>
                          <button onClick={() => handleOfferAction(offer.id, 'approve')} className="action-btn w-full py-2 text-xs font-bold text-white bg-[#5A3825] rounded-md">Approve</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-[#2C1E16] mb-4">Create Offer</h2>
                    <form onSubmit={handleCreateOffer} className="space-y-4">
                      <input type="text" placeholder="Offer Title" required value={newOffer.title} onChange={e => setNewOffer({ ...newOffer, title: e.target.value })} className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none" />
                      <input type="date" required value={newOffer.start_date} onChange={e => setNewOffer({ ...newOffer, start_date: e.target.value })} className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none text-gray-500" />
                      <input type="date" required value={newOffer.end_date} onChange={e => setNewOffer({ ...newOffer, end_date: e.target.value })} className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-lg outline-none text-gray-500" />
                      <input id="offerImageInput" type="file" accept="image/*" required onChange={e => setOfferImageFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FAF8F5] file:text-[#2C1E16]" />
                      <button type="submit" className="btn-primary w-full bg-[#5A3825] text-white py-3 rounded-full font-bold uppercase tracking-wider hover:bg-[#3E2723]">Add Offer</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
                    <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                      <h2 className="text-lg font-bold text-[#2C1E16]">Active Offers</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {offers.filter(o => o.status === 'approved').length === 0
                        ? <p className="p-6 text-gray-500">No active offers found.</p>
                        : offers.filter(o => o.status === 'approved').map(offer => (
                          <div key={offer.id} className="admin-list-item p-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              {offer.image && <img src={offer.image} className="w-20 h-12 object-cover rounded-lg border border-gray-200" alt={offer.title} />}
                              <div>
                                <span className="font-bold text-[#2C1E16] block">{offer.title}</span>
                                <span className="text-xs text-gray-500 block">{offer.start_date} to {offer.end_date}</span>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteOffer(offer.id)} className="action-btn text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium">Delete</button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5]">
                <h2 className="text-lg font-bold text-[#2C1E16]">Global Order Ledger</h2>
              </div>
              {orders.length === 0
                ? <div className="p-10 text-center text-gray-500">No orders placed yet.</div>
                : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-[#FAF8F5] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
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
                          <tr key={order.id} className="admin-table-row">
                            <td className="px-6 py-4 font-bold text-gray-500">#{order.id}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#2C1E16]">{order.buyer_name}</p>
                              <p className="text-sm text-gray-500">{order.buyer_email}</p>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#A87C51]">₹{parseFloat(order.total_price).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${order.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                {order.payment_status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold uppercase">
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