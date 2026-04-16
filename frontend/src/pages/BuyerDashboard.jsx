/* src/pages/BuyerDashboard.jsx */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

/* ── fade-up on intersection ── */
const useFadeIn = (delay = 0) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [
    ref,
    {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    },
  ]
}

/* ── counter that animates from 0 → target ── */
const AnimatedCounter = ({ target, delay = 0 }) => {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        obs.disconnect()
        if (target === 0) return
        const duration = 700
        const steps = 30
        const inc = target / steps
        let cur = 0
        setTimeout(() => {
          const id = setInterval(() => {
            cur += inc
            if (cur >= target) { setVal(target); clearInterval(id) }
            else setVal(Math.floor(cur))
          }, duration / steps)
        }, delay)
      }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, delay])

  return <span ref={ref}>{val}</span>
}

export const BuyerDashboard = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  /* heading refs */
  const [labelRef,   labelStyle]   = useFadeIn(0)
  const [headingRef, headingStyle] = useFadeIn(120)
  const [subRef,     subStyle]     = useFadeIn(220)
  const [titleRef,   titleStyle]   = useFadeIn(0)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'buyer') { navigate('/'); return }
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/')
        setOrders(res.data)
      } catch {
        console.error('Failed to load orders.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [isAuthenticated, user, navigate])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':          return 'bg-[#EBE7DF] text-[#111111]'
      case 'sent_to_factory':  return 'bg-[#8E7A60]/10 text-[#8E7A60]'
      case 'shipped':          return 'bg-[#111111] text-[#F8F6F0]'
      case 'delivered':        return 'bg-green-50 text-green-700'
      default:                 return 'bg-gray-100 text-gray-500'
    }
  }

  if (loading) return <div className="min-h-screen bg-[#F8F6F0]" />

  const stats = [
    { label: 'Total Orders', val: orders.length },
    { label: 'In Transit',   val: orders.filter(o => o.status === 'shipped').length },
    { label: 'Processing',   val: orders.filter(o => o.status === 'pending').length },
    { label: 'Received',     val: orders.filter(o => o.status === 'delivered').length },
  ]

  return (
    <div className="min-h-screen bg-[#F8F6F0] font-sans pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero Heading ── */}
        <div className="mb-16">
          <span ref={labelRef} style={labelStyle}
            className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8E7A60] mb-4 block">
            Account
          </span>
          <h1 ref={headingRef} style={headingStyle}
            className="text-6xl font-serif text-[#111111]">
            Purchase <span className="italic">History.</span>
          </h1>
          <p ref={subRef} style={subStyle}
            className="text-[#111111]/50 mt-4 text-sm font-medium">
            Tracking your curated collection
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{ animation: `fadeSlideIn 0.55s ease ${i * 90}ms both` }}
              className="p-8 bg-[#EBE7DF]/50 border border-[#111111]/5 rounded-2xl
                         hover:bg-[#EBE7DF]/80 hover:-translate-y-0.5 hover:shadow-sm
                         transition-all duration-400"
            >
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8E7A60] mb-2">
                {stat.label}
              </p>
              <p className="text-4xl font-serif text-[#111111]">
                <AnimatedCounter target={stat.val} delay={i * 90 + 200} />
              </p>
            </div>
          ))}
        </div>

        {/* ── Orders Section ── */}
        <div className="space-y-6">
          <h2
            ref={titleRef} style={titleStyle}
            className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#111111] mb-8 pb-4 border-b border-[#111111]/10"
          >
            Recent Orders
          </h2>

          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr
                    style={{ animation: 'fadeSlideIn 0.5s ease 300ms both' }}
                    className="text-[10px] uppercase tracking-widest text-[#111111]/40 border-b border-[#111111]/5"
                  >
                    <th className="pb-6 font-bold">Product</th>
                    <th className="pb-6 font-bold">Investment</th>
                    <th className="pb-6 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/5">
                  {orders.map((order, i) => (
                    <tr
                      key={order.id}
                      style={{ animation: `fadeSlideIn 0.5s ease ${i * 70 + 380}ms both` }}
                      className="group hover:bg-[#EBE7DF]/30 transition-colors duration-300"
                    >
                      <td className="py-8 font-serif text-xl text-[#111111]
                                     group-hover:translate-x-0.5 transition-transform duration-300">
                        {order.product_details?.name || 'Essential Item'}
                      </td>
                      <td className="py-8 font-medium text-[#111111]">
                        ₹{parseFloat(order.product_details?.price || 0).toLocaleString()}
                      </td>
                      <td className="py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest
                                          transition-all duration-300 ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{ animation: 'fadeSlideIn 0.6s ease 400ms both' }}
              className="py-20 text-center"
            >
              <p className="font-serif italic text-2xl text-[#111111]/20">
                Your collection is empty...
              </p>
              <button
                onClick={() => navigate('/home')}
                className="mt-8 text-[11px] uppercase tracking-widest font-bold border-b border-[#111111] pb-1
                           hover:text-[#8E7A60] hover:border-[#8E7A60] transition-colors duration-300"
              >
                Browse Collection
              </button>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}