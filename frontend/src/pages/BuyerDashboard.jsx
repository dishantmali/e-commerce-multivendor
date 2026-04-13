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
      navigate('/login')
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'sent_to_factory':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'delivered':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-500 mt-4 font-medium">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-dark tracking-tight">Purchase <span className="gradient-text">History</span></h1>
          <p className="text-gray-500 mt-2 text-lg">Track your orders and past purchases.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          <Card className="!p-6 border-l-4 border-l-primary flex flex-col justify-center">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total</p>
            <p className="text-4xl font-black text-dark mt-2 font-display">{orders.length}</p>
          </Card>
          <Card className="!p-6 border-l-4 border-l-yellow-400 flex flex-col justify-center">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Pending</p>
            <p className="text-4xl font-black text-yellow-600 mt-2 font-display">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </Card>
          <Card className="!p-6 border-l-4 border-l-blue-400 flex flex-col justify-center">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Factory</p>
            <p className="text-4xl font-black text-blue-600 mt-2 font-display">
              {orders.filter((o) => o.status === 'sent_to_factory').length}
            </p>
          </Card>
          <Card className="!p-6 border-l-4 border-l-green-400 flex flex-col justify-center">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Shipped</p>
            <p className="text-4xl font-black text-green-600 mt-2 font-display">
              {orders.filter((o) => o.status === 'shipped').length}
            </p>
          </Card>
          <Card className="!p-6 border-l-4 border-l-purple-400 flex flex-col justify-center">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Delivered</p>
            <p className="text-4xl font-black text-purple-600 mt-2 font-display">
              {orders.filter((o) => o.status === 'delivered').length}
            </p>
          </Card>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6 font-display">My Orders</h2>

          {orders.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-bold text-gray-500 uppercase tracking-wider text-xs">Product</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-500 uppercase tracking-wider text-xs">Price</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-500 uppercase tracking-wider text-xs">Vendor</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-6 font-bold text-dark">
                        {order.product_details?.name || `Product #${order.product}`}
                      </td>
                      <td className="py-5 px-6 text-primary font-bold">
                        ₹{order.product_details?.price || '—'}
                      </td>
                      <td className="py-5 px-6 text-gray-600">
                        {order.product_details?.vendor_shop || '—'}
                      </td>
                      <td className="py-5 px-6">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-6 opacity-80">🛍️</div>
                <p className="text-dark font-display text-2xl font-bold mb-2">No orders yet</p>
                <p className="text-gray-500 mb-8">Start shopping to see your orders here.</p>
                <button
                  onClick={() => navigate('/home')}
                  className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30 transition-colors font-bold active:scale-95"
                >
                  Start Exploring
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
