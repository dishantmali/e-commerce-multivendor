import { useState, useEffect } from 'react';
import api from '../api/axios';

export const BuyerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/')
      .then(res => {
        // FIX: Check for .results in the paginated response
        const orderData = res.data.results !== undefined ? res.data.results : res.data;
        setOrders(orderData);
      })
      .catch(err => {
        console.error("Failed to fetch orders:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <h1 className="text-3xl font-bold text-[#1e1e27] mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-sm p-6 bg-white shadow-sm">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID: #{order.id}</p>
                  <p className="font-bold text-[#1e1e27] mt-1">Status: <span className="uppercase text-[#fe4c50]">{order.status}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-xl text-[#1e1e27]">₹{parseFloat(order.total_price).toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img src={item.product_details?.image} className="w-16 h-16 object-cover bg-gray-50" alt="" />
                    <div>
                      <p className="font-medium">{item.product_details?.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} | Vendor: {item.vendor_shop}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};