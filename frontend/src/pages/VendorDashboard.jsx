/* src/pages/VendorDashboard.jsx */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

/* ── fade-up on intersection ── */
const useFadeIn = (delay = 0) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  }]
}

/* ── tab content fade-slide ── */
const TabPanel = ({ children }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 20); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(14px)',
      transition: 'opacity 0.45s ease, transform 0.45s ease',
    }}>
      {children}
    </div>
  )
}

/* ── labelled field with staggered fade ── */
const Field = ({ label, delay = 0, children }) => {
  const [ref, style] = useFadeIn(delay)
  return (
    <div ref={ref} style={style}>
      <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-[#8E7A60] mb-3">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = `w-full bg-transparent border-b border-[#111111]/20 py-3 text-[#111111]
  font-serif text-lg placeholder:text-[#111111]/20 outline-none
  focus:border-[#111111] transition-colors duration-300`

export const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts]   = useState([])
  const [orders, setOrders]       = useState([])
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  /* form state */
  const [formData, setFormData]       = useState({ name: '', price: '', description: '' })
  const [imageFile, setImageFile]     = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [dragOver, setDragOver]       = useState(false)
  const fileInputRef = useRef(null)

  /* heading refs */
  const [labelRef,   labelStyle]   = useFadeIn(0)
  const [headingRef, headingStyle] = useFadeIn(120)

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get('/vendor/products/'),
        api.get('/orders/'),
      ])
      setProducts(prodRes.data)
      setOrders(orderRes.data)
    } catch {
      console.error('Sync failed')
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') { navigate('/'); return }
    fetchData()
  }, [isAuthenticated, user, navigate, fetchData])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/vendor/orders/${orderId}/status/`, { status: newStatus })
      fetchData()
      toast.success('Status synchronized')
    } catch {
      toast.error('Sync failed')
    }
  }

  /* ── image helpers ── */
  const applyImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!imageFile) { toast.error('Please add a product image'); return }
    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('name',        formData.name)
      payload.append('price',       formData.price)
      payload.append('description', formData.description)
      payload.append('image',       imageFile)
      await api.post('/vendor/products/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Product published')
      setFormData({ name: '', price: '', description: '' })
      setImageFile(null)
      setImagePreview(null)
      fetchData()
      setActiveTab('products')
    } catch {
      toast.error('Failed to publish product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] font-sans pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
        <div className="mb-16">
          <span ref={labelRef} style={labelStyle}
            className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8E7A60] mb-4 block">
            Studio
          </span>
          <h1 ref={headingRef} style={headingStyle}
            className="text-6xl font-serif text-[#111111]">
            Command <span className="italic">Center.</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">

          {/* ── Sidebar ── */}
          <div className="lg:w-48 flex-shrink-0">
            <nav className="flex lg:flex-col gap-8 sticky top-40">
              {[
                { id: 'products', name: 'Inventory', count: products.length },
                { id: 'orders',   name: 'Queue',     count: orders.length   },
                { id: 'add',      name: 'List New',  count: null            },
              ].map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{ animation: `fadeSlideIn 0.5s ease ${i * 100 + 200}ms both` }}
                  className="text-left group transition-all duration-500"
                >
                  <p className={`text-[11px] uppercase tracking-[0.3em] font-bold transition-colors duration-300 ${
                    activeTab === item.id ? 'text-[#111111]' : 'text-[#111111]/20 group-hover:text-[#111111]'
                  }`}>
                    {item.name}
                  </p>
                  {item.count !== null && (
                    <span className="text-[10px] font-medium text-[#8E7A60]">{item.count} items</span>
                  )}
                  <div className="h-[1px] bg-[#111111] mt-2 transition-all duration-500"
                    style={{ width: activeTab === item.id ? '100%' : '0px' }} />
                </button>
              ))}
            </nav>
          </div>

          {/* ── Content ── */}
          <div className="flex-1">

            {/* INVENTORY */}
            {activeTab === 'products' && (
              <TabPanel key="products">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {products.length > 0 ? products.map((p, i) => (
                    <div key={p.id}
                      style={{ animation: `fadeSlideIn 0.55s ease ${i * 100}ms both` }}
                      className="group relative aspect-square bg-[#EBE7DF] overflow-hidden rounded-lg cursor-pointer">
                      {p.image && (
                        <img src={p.image} alt=""
                          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-[900ms] ease-out" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                        <h3 className="text-white font-serif text-2xl group-hover:-translate-y-1 transition-transform duration-400">
                          {p.name}
                        </h3>
                        <p className="text-white/60 text-xs uppercase tracking-widest mt-2 group-hover:text-white/80 transition-colors duration-400">
                          ₹{parseFloat(p.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div style={{ animation: 'fadeSlideIn 0.5s ease 100ms both' }}
                      className="col-span-2 py-20 text-center border border-dashed border-[#111111]/10 rounded-2xl">
                      <p className="font-serif italic text-2xl text-[#111111]/20">No items in inventory yet.</p>
                      <button onClick={() => setActiveTab('add')}
                        className="mt-6 text-[11px] uppercase tracking-widest font-bold border-b border-[#111111] pb-1 hover:text-[#8E7A60] hover:border-[#8E7A60] transition-colors duration-300">
                        Add First Product →
                      </button>
                    </div>
                  )}
                </div>
              </TabPanel>
            )}

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <TabPanel key="orders">
                <div className="space-y-8">
                  {orders.length > 0 ? orders.map((order, i) => (
                    <div key={order.id}
                      style={{ animation: `fadeSlideIn 0.5s ease ${i * 90}ms both` }}
                      className="p-8 border border-[#111111]/5 bg-[#EBE7DF]/30 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-[#EBE7DF]/60 hover:shadow-sm transition-all duration-400">
                      <div className="text-center md:text-left">
                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8E7A60] mb-2">Order #{order.id}</p>
                        <h3 className="text-2xl font-serif text-[#111111]">{order.product_details?.name}</h3>
                        <p className="text-sm text-[#111111]/40 mt-1">To: {order.buyer_name} • {order.address}</p>
                      </div>
                      <div className="flex flex-col gap-4 w-full md:w-auto">
                        <span className="text-center text-[10px] uppercase tracking-widest font-bold py-2 px-4 bg-[#111111] text-[#F8F6F0] rounded-full">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        {order.status === 'pending' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'shipped')}
                            className="text-[10px] uppercase tracking-widest font-bold border-b border-[#111111] pb-1 hover:text-[#8E7A60] hover:border-[#8E7A60] transition-colors duration-300">
                            Dispatch Good →
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div style={{ animation: 'fadeSlideIn 0.5s ease 100ms both' }} className="py-20 text-center">
                      <p className="font-serif italic text-2xl text-[#111111]/20">No orders yet.</p>
                    </div>
                  )}
                </div>
              </TabPanel>
            )}

            {/* ADD PRODUCT */}
            {activeTab === 'add' && (
              <TabPanel key="add">
                <div className="max-w-xl">
                  <p style={{ animation: 'fadeSlideIn 0.5s ease 0ms both' }}
                    className="font-serif italic text-3xl text-[#111111] mb-14 leading-snug">
                    Introduce a new good<br />to the collection.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Image drop zone */}
                    <Field label="Product Image" delay={80}>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); applyImage(e.dataTransfer.files[0]) }}
                        className={`relative w-full aspect-video rounded-xl border-2 border-dashed cursor-pointer
                          flex items-center justify-center overflow-hidden transition-all duration-300
                          ${dragOver
                            ? 'border-[#111111] bg-[#EBE7DF]/60 scale-[1.01]'
                            : 'border-[#111111]/15 bg-[#EBE7DF]/30 hover:border-[#111111]/35 hover:bg-[#EBE7DF]/50'
                          }`}
                      >
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="preview"
                              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                            <div className="absolute inset-0 bg-[#111111]/0 hover:bg-[#111111]/30 transition-all duration-300 flex items-center justify-center">
                              <span className="opacity-0 hover:opacity-100 text-white text-[10px] uppercase tracking-widest font-bold transition-opacity duration-300">
                                Change Image
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center px-8 pointer-events-none">
                            <p className="text-4xl mb-3 text-[#111111]/20">↑</p>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#111111]/25">
                              Drop image here or click to browse
                            </p>
                            <p className="text-[9px] text-[#8E7A60]/60 mt-2 tracking-wider">PNG, JPG, WEBP</p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => applyImage(e.target.files[0])}
                          className="hidden"
                        />
                      </div>
                    </Field>

                    {/* Name */}
                    <Field label="Product Name" delay={160}>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        required
                        placeholder="e.g. Hand-loomed Silk Scarf"
                        className={inputCls}
                      />
                    </Field>

                    {/* Price */}
                    <Field label="Price (₹)" delay={240}>
                      <div className="relative">
                        <span className="absolute left-0 top-3 font-serif text-lg text-[#111111]/25 pointer-events-none select-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                          required
                          placeholder="0.00"
                          className={`${inputCls} pl-5`}
                        />
                      </div>
                    </Field>

                    {/* Description */}
                    <Field label="Story & Details" delay={320}>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                        placeholder="Describe what makes this product special..."
                        className={`${inputCls} resize-none`}
                      />
                    </Field>

                    {/* Submit */}
                    <div style={{ animation: 'fadeSlideIn 0.5s ease 420ms both' }}>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`group flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] font-bold
                          transition-all duration-300
                          ${submitting ? 'opacity-40 cursor-not-allowed' : 'hover:gap-6'}`}
                      >
                        <span className="w-10 h-[1px] bg-[#111111] transition-all duration-300 group-hover:w-14 group-hover:bg-[#8E7A60]" />
                        <span className="transition-colors duration-300 group-hover:text-[#8E7A60]">
                          {submitting ? 'Publishing...' : 'Publish Product'}
                        </span>
                      </button>
                    </div>

                  </form>
                </div>
              </TabPanel>
            )}

          </div>
        </div>
      </div>


    </div>
  )
}