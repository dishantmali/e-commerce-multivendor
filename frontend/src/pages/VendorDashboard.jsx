import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const res = await api.get('/vendor/products/')
      setProducts(res.data)
    } catch {
      toast.error('Failed to fetch products')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true)
    try {
      const res = await api.get('/orders/')
      setOrders(res.data)
    } catch {
      toast.error('Failed to fetch orders')
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      navigate('/')
      return
    }
    fetchProducts()
    fetchOrders()
  }, [isAuthenticated, user, navigate, fetchProducts, fetchOrders])

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/vendor/products/${productId}/`)
      setProducts(products.filter((p) => p.id !== productId))
      toast.success('Product deleted successfully')
    } catch {
      toast.error('Failed to delete product.')
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/vendor/orders/${orderId}/status/`, { status: newStatus })
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ))
      toast.success('Order status updated!')
    } catch {
      toast.error('Failed to update order status.')
    }
  }

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

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
            <h1 className="text-[40px] md:text-[48px] font-bold text-[#1a1f1d] leading-tight tracking-tight">Vendor <span className="text-[#185546]">Command Center</span></h1>
            <p className="text-gray-500 mt-2 text-[17px]">Manage your products and dispatch orders seamlessly.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white border border-gray-100 shadow-sm rounded-[20px] p-4">
              <nav className="space-y-2 relative">
                {[
                  { id: 'products', name: 'Inventory', icon: '📦' },
                  { id: 'add-product', name: 'New Product', icon: '➕' },
                  { id: 'orders', name: 'Order Queue', icon: '🧾' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-5 py-3.5 rounded-xl flex items-center gap-3 font-semibold transition-all duration-200 text-[15px] ${
                      activeTab === item.id
                        ? 'bg-[#185546] text-white shadow-md'
                        : 'text-gray-500 hover:text-[#1a1f1d] hover:bg-[#fafbfb]'
                    }`}
                  >
                    <span>{item.icon}</span> {item.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'products' && (
              <div className="border border-gray-100 shadow-sm rounded-[20px] bg-white p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-[22px] font-bold text-[#1a1f1d]">Live Inventory</h2>
                    <span className="bg-[#eef7f4] text-[#185546] font-bold px-4 py-1.5 rounded-full text-[13px]">{products.length} Items</span>
                </div>

                {loadingProducts ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#185546]"></div>
                      <p className="text-gray-500 mt-4 font-medium">Loading inventory...</p>
                    </div>
                  </div>
                ) : products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-50">
                          <th className="pb-4 px-2 font-medium text-gray-400 uppercase tracking-wider text-[11px]">Product Name</th>
                          <th className="pb-4 px-2 font-medium text-gray-400 uppercase tracking-wider text-[11px]">Price</th>
                          <th className="pb-4 px-2 font-medium text-gray-400 uppercase tracking-wider text-[11px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-[#fafbfb] transition-colors">
                            <td className="py-6 px-2 font-medium text-[#1a1f1d] text-[15px]">{product.name}</td>
                            <td className="py-6 px-2 text-[#185546] font-bold text-[15px]">₹{parseFloat(product.price).toFixed(2)}</td>
                            <td className="py-6 px-2 text-right">
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-semibold text-[13px] transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-[#fafbfb] rounded-2xl border border-dashed border-gray-200">
                    <div className="text-5xl mb-4 opacity-50">📋</div>
                    <p className="text-[#1a1f1d] font-bold text-xl mb-2">No products loaded</p>
                    <p className="text-gray-500 text-[15px]">Your inventory is empty. Add a product to get started.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'add-product' && (
              <AddProductForm onSuccess={() => { fetchProducts(); setActiveTab('products') }} />
            )}

            {activeTab === 'orders' && (
              <div className="border border-gray-100 shadow-sm rounded-[20px] bg-white p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-[22px] font-bold text-[#1a1f1d]">Order Queue</h2>
                    <span className="bg-[#eef7f4] text-[#185546] font-bold px-4 py-1.5 rounded-full text-[13px]">{orders.length} Active</span>
                </div>

                {loadingOrders ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#185546]"></div>
                      <p className="text-gray-500 mt-4 font-medium">Loading orders...</p>
                    </div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white border text-left border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        {order.status === 'shipped' && <div className="absolute top-0 left-0 w-1.5 h-full bg-[#185546]"></div>}
                        {order.status === 'sent_to_factory' && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>}
                        {order.status === 'pending' && <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ef6b4c]"></div>}
                        {order.status === 'delivered' && <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>}

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pl-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                                <h3 className="font-bold text-[18px] text-[#1a1f1d]">
                                  {order.product_details?.name || `Product #${order.product}`}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                                  {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div className="text-gray-500 grid md:grid-cols-2 gap-4 mt-4 text-[14px] bg-[#fafbfb] p-4 rounded-xl border border-gray-50">
                                <div>
                                  <p className="mb-2"><strong className="text-[#1a1f1d]">Buyer:</strong> {order.buyer_name} ({order.buyer_email})</p>
                                  <p><strong className="text-[#1a1f1d]">Quantity:</strong> {order.quantity}</p>
                                </div>
                                <div>
                                  <p className="mb-2"><strong className="text-[#1a1f1d]">Address:</strong> {order.address}</p>
                                  <p><strong className="text-[#1a1f1d]">Phone:</strong> {order.phone}</p>
                                </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'sent_to_factory')}
                                className="w-full md:w-auto bg-[#1a1f1d] text-white px-5 py-2.5 rounded-lg hover:bg-black transition-colors font-semibold text-[14px]"
                              >
                                Dispatch to Factory 🏭
                              </button>
                            )}
                            {order.status === 'sent_to_factory' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                className="w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-[14px]"
                              >
                                Mark as Shipped 🚚
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                className="w-full md:w-auto bg-[#185546] text-white px-5 py-2.5 rounded-lg hover:bg-[#124236] transition-colors font-semibold text-[14px]"
                              >
                                Factory: Mark Delivered ✅
                              </button>
                            )}
                            {order.status === 'delivered' && (
                              <span className="text-purple-600 font-bold px-4 py-2 bg-purple-50 rounded-lg text-[14px]">
                                Delivered 🎉
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-[#fafbfb] rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-[15px]">No active orders right now.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AddProductForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('price', formData.price)
      data.append('description', formData.description)
      if (imageFile) {
        data.append('image', imageFile)
      }

      await api.post('/vendor/products/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setFormData({ name: '', price: '', description: '' })
      setImageFile(null)
      setImagePreview(null)
      toast.success('Product published successfully!')
      if (onSuccess) onSuccess()
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') {
        const errors = Object.entries(msg)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ')
        setError(errors || 'Failed to create product.')
      } else {
        setError('Failed to create product. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-gray-100 shadow-sm rounded-[20px] bg-white p-8">
      <h2 className="text-[22px] font-bold text-[#1a1f1d] mb-2">Create New Product</h2>
      <p className="text-gray-500 mb-8 text-[15px]">Fill in the details to list your item on the marketplace.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-6">
          <label className="block text-[11px] font-semibold text-gray-400 mb-3 uppercase tracking-wider">Product Image</label>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className={`w-32 h-32 flex-shrink-0 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${imagePreview ? 'border-[#185546]' : 'border-gray-200 bg-gray-50'}`}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl opacity-40">📸</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="image-upload"
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-white border border-gray-200 text-[#1a1f1d] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors inline-block text-[14px]"
              >
                Choose Image
              </label>
              <p className="text-gray-400 text-[13px] mt-3">Recommended size: 800x800px</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
            <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Product Title</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-[#1a1f1d] focus:border-[#185546] focus:ring-4 focus:ring-[#185546]/10 bg-[#fafbfb] focus:bg-white transition-all outline-none font-medium text-[15px]"
                placeholder="e.g. Vintage Leather Boots"
            />
            </div>

            <div className="md:col-span-1">
            <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Price (₹)</label>
            <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-[#1a1f1d] focus:border-[#185546] focus:ring-4 focus:ring-[#185546]/10 bg-[#fafbfb] focus:bg-white transition-all outline-none font-medium text-[15px]"
                placeholder="0.00"
            />
            </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Story & Details</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-[#1a1f1d] focus:border-[#185546] focus:ring-4 focus:ring-[#185546]/10 bg-[#fafbfb] focus:bg-white transition-all outline-none text-[15px]"
            placeholder="Describe what makes this product amazing..."
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto bg-[#ef6b4c] text-white px-8 py-3.5 rounded-lg hover:bg-[#d65a3d] transition-all font-semibold text-[15px] shadow-sm disabled:opacity-70"
        >
          {loading ? 'Publishing...' : 'Publish Product 🚀'}
        </button>
      </form>
    </div>
  )
}
