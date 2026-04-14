import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export const BuyerDashboard = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'buyer') {
      navigate('/')
      return
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/')
        setOrders(res.data)
      } catch {
        setError('Failed to load orders.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [isAuthenticated, user, navigate])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-50 text-orange-600 border-none'
      case 'sent_to_factory':
        return 'bg-blue-50 text-blue-600 border-none'
      case 'shipped':
        return 'bg-[#eef7f4] text-[#185546] border-none'
      case 'delivered':
        return 'bg-purple-50 text-purple-600 border-none'
      default:
        return 'bg-gray-50 text-gray-600 border-none'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#185546]"></div>
          <p className="text-gray-500 mt-4 font-medium">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-[40px] md:text-[48px] font-bold text-[#1a1f1d] leading-tight tracking-tight">Purchase <span className="text-[#185546]">History</span></h1>
          <p className="text-gray-500 mt-2 text-[17px]">Track your orders and past purchases.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-12">
          <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col justify-center">
            <p className="text-gray-400 font-medium uppercase text-[11px] tracking-wider">Total</p>
            <p className="text-[32px] font-bold text-[#1a1f1d] mt-1">{orders.length}</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col justify-center">
            <p className="text-gray-400 font-medium uppercase text-[11px] tracking-wider">Pending</p>
            <p className="text-[32px] font-bold text-[#ef6b4c] mt-1">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col justify-center">
            <p className="text-gray-400 font-medium uppercase text-[11px] tracking-wider">Factory</p>
            <p className="text-[32px] font-bold text-blue-600 mt-1">
              {orders.filter((o) => o.status === 'sent_to_factory').length}
            </p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col justify-center">
            <p className="text-gray-400 font-medium uppercase text-[11px] tracking-wider">Shipped</p>
            <p className="text-[32px] font-bold text-[#185546] mt-1">
              {orders.filter((o) => o.status === 'shipped').length}
            </p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col justify-center">
            <p className="text-gray-400 font-medium uppercase text-[11px] tracking-wider">Delivered</p>
            <p className="text-[32px] font-bold text-purple-600 mt-1">
              {orders.filter((o) => o.status === 'delivered').length}
            </p>
          </div>
        </div>

        <div className="border border-gray-100 shadow-sm rounded-[20px] bg-white p-8">
          <h2 className="text-[22px] font-bold text-[#1a1f1d] mb-8">My Orders</h2>

          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 px-2 font-medium text-gray-400 uppercase tracking-wider text-[11px]">Product</th>
                    <th className="pb-4 px-2 font-medium text-gray-400 uppercase tracking-wider text-[11px]">Price</th>
                    <th className="pb-4 px-2 font-medium text-gray-400 uppercase tracking-wider text-[11px]">Vendor</th>
                    <th className="pb-4 px-2 font-medium text-gray-400 uppercase tracking-wider text-[11px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#fafbfb] transition-colors">
                      <td className="py-6 px-2 font-medium text-[#1a1f1d] text-[15px]">
                        {order.product_details?.name || `Product #${order.product}`}
                      </td>
                      <td className="py-6 px-2 text-[#185546] font-bold text-[15px]">
                        ₹{parseFloat(order.product_details?.price || 0).toFixed(2)}
                      </td>
                      <td className="py-6 px-2 text-gray-500 text-[15px]">
                        {order.product_details?.vendor_shop || '—'}
                      </td>
                      <td className="py-6 px-2">
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="text-6xl mb-6 opacity-80">🛍️</div>
                <p className="text-[#1a1f1d] text-[20px] font-bold mb-2">No orders yet</p>
                <p className="text-gray-500 mb-8 text-[15px]">Start shopping to see your orders here.</p>
                <button
                  onClick={() => navigate('/home')}
                  className="bg-[#ef6b4c] text-white px-8 py-3.5 rounded-lg hover:bg-[#d65a3d] transition-all font-semibold text-[15px]"
                >
                  Start Exploring
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
