import { useState, useEffect } from 'react';
import api from '../api/axios';

const SkeletonOrderCard = () => (
  <div className="border border-gray-200 rounded-xl p-6 bg-white">
    <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
      <div className="space-y-2">
        <div className="skeleton-shimmer h-3 w-24 rounded-full" />
        <div className="skeleton-shimmer h-4 w-32 rounded-full" />
      </div>
      <div className="text-right space-y-2">
        <div className="skeleton-shimmer h-3 w-12 rounded-full ml-auto" />
        <div className="skeleton-shimmer h-6 w-20 rounded-full ml-auto" />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="skeleton-shimmer w-16 h-16 rounded-md shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="skeleton-shimmer h-4 w-3/4 rounded-full" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded-full" />
      </div>
    </div>
  </div>
);

export const BuyerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/')
      .then(res => setOrders(res.data.results !== undefined ? res.data.results : res.data))
      .catch(err => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <h1 className="animate-fade-in text-3xl font-bold text-[#2C1E16] mb-8 border-b border-gray-200 pb-4">
        My Orders
      </h1>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => <SkeletonOrderCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="animate-fade-in text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-6 stagger-children">
          {orders.map(order => (
            <div
              key={order.id}
              className="order-card animate-fade-in-up border border-gray-200 rounded-xl p-6 bg-white shadow-sm"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4 bg-[#FAF8F5] -mx-6 -mt-6 px-6 pt-6 rounded-t-xl">
                <div>
                  <p className="text-sm text-gray-500">Order ID: #{order.id}</p>
                  <p className="font-bold text-[#2C1E16] mt-1">
                    Status: <span className="uppercase text-[#A87C51]">{order.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-xl text-[#5A3825]">
                    ₹{parseFloat(order.total_price).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="order-item-row flex items-center gap-4 px-2 py-1 -mx-2">
                    <img
                      src={item.product_details?.image}
                      className="order-item-img w-16 h-16 object-cover bg-[#FAF8F5] rounded-md border border-gray-100 shrink-0"
                      alt=""
                    />
                    <div>
                      <p className="font-medium text-[#2C1E16]">{item.product_details?.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} | Vendor: {item.vendor_shop}
                      </p>
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