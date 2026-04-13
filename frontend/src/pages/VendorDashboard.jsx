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
      navigate('/login')
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

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-dark tracking-tight">Vendor <span className="gradient-text">Command Center</span></h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your products and dispatch orders seamlessly.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-28 bg-white/60">
              <nav className="space-y-3 relative">
                {[
                  { id: 'products', name: 'Inventory', icon: '📦' },
                  { id: 'add-product', name: 'New Product', icon: '➕' },
                  { id: 'orders', name: 'Order Queue', icon: '🧾' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl flex items-center gap-3 font-semibold transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95'
                        : 'text-gray-600 hover:bg-white hover:shadow-sm active:scale-95'
                    }`}
                  >
                    <span>{item.icon}</span> {item.name}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'products' && (
              <Card>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold font-display text-dark">Live Inventory</h2>
                    <span className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-lg">{products.length} Items</span>
                </div>

                {loadingProducts ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                      <p className="text-gray-500 mt-4 font-medium">Loading inventory...</p>
                    </div>
                  </div>
                ) : products.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-5 px-6 font-semibold text-gray-500 uppercase tracking-wider text-xs">Product Name</th>
                          <th className="py-5 px-6 font-semibold text-gray-500 uppercase tracking-wider text-xs">Price</th>
                          <th className="py-5 px-6 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-5 px-6 font-bold text-dark">{product.name}</td>
                            <td className="py-5 px-6 text-primary font-bold">₹{product.price}</td>
                            <td className="py-5 px-6 text-right">
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors active:scale-95"
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
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="text-6xl mb-4 opacity-50">📋</div>
                    <p className="text-dark font-bold text-xl mb-2">No products loaded</p>
                    <p className="text-gray-500">Your inventory is empty. Add a product to get started.</p>
                  </div>
                )}
              </Card>
            )}

            {activeTab === 'add-product' && (
              <AddProductForm onSuccess={() => { fetchProducts(); setActiveTab('products') }} />
            )}

            {activeTab === 'orders' && (
              <Card>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold font-display text-dark">Order Queue</h2>
                    <span className="bg-fuchsia-100 text-fuchsia-700 font-bold px-4 py-1.5 rounded-lg">{orders.length} Active</span>
                </div>

                {loadingOrders ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                      <p className="text-gray-500 mt-4 font-medium">Loading orders...</p>
                    </div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white border text-left border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        {order.status === 'shipped' && <div className="absolute top-0 right-0 w-2 h-full bg-emerald-400"></div>}
                        {order.status === 'sent_to_factory' && <div className="absolute top-0 right-0 w-2 h-full bg-green-400"></div>}
                        {order.status === 'pending' && <div className="absolute top-0 right-0 w-2 h-full bg-yellow-400"></div>}

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-xl text-dark font-display">
                                  {order.product_details?.name || `Product #${order.product}`}
                                </h3>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'sent_to_factory' ? 'bg-green-100 text-green-800'
                                  : order.status === 'shipped' ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div className="text-gray-500 grid md:grid-cols-2 gap-4 mt-4 text-sm bg-gray-50 p-4 rounded-xl">
                                <div>
                                  <p className="mb-1"><strong className="text-dark">Buyer:</strong> {order.buyer_name} ({order.buyer_email})</p>
                                  <p><strong className="text-dark">Quantity:</strong> {order.quantity}</p>
                                </div>
                                <div>
                                  <p className="mb-1"><strong className="text-dark">Address:</strong> {order.address}</p>
                                  <p><strong className="text-dark">Phone:</strong> {order.phone}</p>
                                </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            {order.status === 'pending' && (
                              <Button
                                size="md"
                                onClick={() => handleUpdateStatus(order.id, 'sent_to_factory')}
                                className="w-full md:w-auto bg-dark text-white"
                              >
                                Dispatch to Factory 🏭
                              </Button>
                            )}
                            {order.status === 'sent_to_factory' && (
                              <Button
                                size="md"
                                onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700"
                              >
                                Mark as Shipped 🚚
                              </Button>
                            )}
                            {order.status === 'shipped' && (
                              <Button
                                size="md"
                                onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                className="w-full md:w-auto bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Factory: Mark Delivered ✅
                              </Button>
                            )}
                            {order.status === 'delivered' && (
                              <span className="text-purple-600 font-bold px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                                Delivered 🎉
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No active orders right now.</p>
                  </div>
                )}
              </Card>
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
      // Use FormData for multipart file upload
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
    <Card>
      <h2 className="text-3xl font-bold font-display text-dark mb-2">Create New Product</h2>
      <p className="text-gray-500 mb-8">Fill in the details to list your item on the marketplace.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-6">
          <label className="block text-sm font-bold text-dark mb-3 uppercase tracking-wide">Product Image</label>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className={`w-32 h-32 flex-shrink-0 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${imagePreview ? 'border-primary' : 'border-gray-300 bg-gray-50'}`}>
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
                className="cursor-pointer bg-white border border-gray-200 text-dark font-bold px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm active:scale-95 transition-all inline-block"
              >
                Choose Image
              </label>
              <p className="text-gray-400 text-sm mt-3 font-medium">Recommended size: 800x800px</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
            <label className="block text-sm font-bold text-dark mb-2 uppercase tracking-wide">Product Title</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 text-dark focus:border-primary focus:ring-4 focus:ring-primary/20 bg-gray-50 focus:bg-white transition-all outline-none font-semibold text-lg"
                placeholder="e.g. Vintage Leather Boots"
            />
            </div>

            <div className="md:col-span-1">
            <label className="block text-sm font-bold text-dark mb-2 uppercase tracking-wide">Price (₹)</label>
            <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 text-dark focus:border-primary focus:ring-4 focus:ring-primary/20 bg-gray-50 focus:bg-white transition-all outline-none font-semibold text-lg"
                placeholder="0.00"
            />
            </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-dark mb-2 uppercase tracking-wide">Story & Details</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 text-dark focus:border-primary focus:ring-4 focus:ring-primary/20 bg-gray-50 focus:bg-white transition-all outline-none font-medium"
            placeholder="Describe what makes this product amazing..."
          ></textarea>
        </div>

        <Button type="submit" size="lg" className="px-10 h-14 w-full md:w-auto shadow-xl" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Product 🚀'}
        </Button>
      </form>
    </Card>
  )
}
