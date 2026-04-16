import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, vendRes] = await Promise.all([
        api.get('/admin/products/pending/'),
        api.get('/admin/vendors/pending/')
      ]);
      setPendingProducts(prodRes.data);
      setPendingVendors(vendRes.data);
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
      } else {
        await api.post(`/admin/vendors/${id}/action/`, { action });
        setPendingVendors(pendingVendors.filter(v => v.id !== id));
      }
      toast.success(`${type} ${action}d successfully`);
    } catch (err) {
      toast.error(`Failed to ${action} ${type}`);
    }
  };

  if (loading) return <div className="p-10">Loading admin panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <h1 className="text-4xl font-bold text-[#1e1e27] mb-12">Admin Control Panel</h1>

      {/* Vendors Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold border-b-2 border-[#fe4c50] inline-block pb-1 mb-6">Pending Vendor Registrations</h2>
        {pendingVendors.length === 0 ? <p className="text-gray-500">No pending vendors.</p> : (
          <div className="overflow-x-auto border border-gray-200">
            <table className="w-full text-left bg-white">
              <thead className="bg-[#1e1e27] text-white">
                <tr>
                  <th className="p-4">Shop Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingVendors.map(vendor => (
                  <tr key={vendor.id}>
                    <td className="p-4 font-bold">{vendor.shop_name}</td>
                    <td className="p-4">{vendor.email}</td>
                    <td className="p-4">{vendor.phone}</td>
                    <td className="p-4 flex gap-3">
                      <button onClick={() => handleAction('vendor', vendor.id, 'approve')} className="bg-green-500 text-white px-4 py-1 text-sm uppercase font-bold hover:bg-green-600">Approve</button>
                      <button onClick={() => handleAction('vendor', vendor.id, 'reject')} className="bg-red-500 text-white px-4 py-1 text-sm uppercase font-bold hover:bg-red-600">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Products Section */}
      <div>
        <h2 className="text-2xl font-bold border-b-2 border-[#fe4c50] inline-block pb-1 mb-6">Pending Products</h2>
        {pendingProducts.length === 0 ? <p className="text-gray-500">No pending products.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pendingProducts.map(product => (
              <div key={product.id} className="border border-gray-200 bg-white overflow-hidden shadow-sm">
                <img src={product.image} className="w-full h-48 object-cover bg-gray-50" alt="" />
                <div className="p-4 border-t">
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{product.vendor_shop}</p>
                  <h3 className="font-bold text-[#1e1e27] text-lg truncate">{product.name}</h3>
                  <p className="text-[#fe4c50] font-bold mb-4">₹{product.price}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction('product', product.id, 'approve')} className="flex-1 bg-green-500 text-white py-2 text-sm uppercase font-bold hover:bg-green-600">Approve</button>
                    <button onClick={() => handleAction('product', product.id, 'reject')} className="flex-1 border-2 border-red-500 text-red-500 py-2 text-sm uppercase font-bold hover:bg-red-50">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};