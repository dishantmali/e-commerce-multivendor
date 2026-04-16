// import { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import api from '../api/axios'
// import toast from 'react-hot-toast'

// export const ProductDetailPage = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const { user, isAuthenticated } = useAuth()
//   const [product, setProduct] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [ordering, setOrdering] = useState(false)
//   const [orderError, setOrderError] = useState('')
//   const [showOrderForm, setShowOrderForm] = useState(false)
//   const [orderForm, setOrderForm] = useState({ address: '', phone: '' })
//   const [quantity, setQuantity] = useState(1)
//   const [paymentSuccess, setPaymentSuccess] = useState(false)

//   const basePrice = product ? product.price * quantity : 0
//   const platformFee = basePrice * 0.05
//   const gst = platformFee * 0.18
//   const totalAmount = basePrice + platformFee + gst

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const res = await api.get(`/products/${id}/`)
//         setProduct({
//           id: res.data.id,
//           name: res.data.name,
//           price: res.data.price,
//           image: res.data.image,
//           vendorName: res.data.vendor_shop,
//           description: res.data.description,
//           vendorId: res.data.vendor,
//         })
//       } catch {
//         setProduct(null)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchProduct()
//   }, [id])

//   const handleBuyNow = () => {
//     if (!isAuthenticated) {
//       navigate('/login')
//       return
//     }
//     if (user?.role !== 'buyer') {
//       setOrderError('Only buyers can purchase products')
//       return
//     }
//     setShowOrderForm(true)
//   }

//   const openRazorpayCheckout = (orderData) => {
//     const options = {
//       key: orderData.razorpay_key_id,
//       amount: orderData.amount,
//       currency: orderData.currency,
//       name: 'MarketHub Purchase',
//       description: `Purchase: ${orderData.product_name}`,
//       order_id: orderData.razorpay_order_id,
//       handler: async function (response) {
//         try {
//           setOrdering(true)
//           const verifyRes = await api.post('/payment/verify/', {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             product_id: orderData.delivery_info.product_id,
//             address: orderData.delivery_info.address,
//             phone: orderData.delivery_info.phone,
//             quantity: orderData.delivery_info.quantity,
//           })

//           if (verifyRes.status === 201) {
//             setPaymentSuccess(true)
//             toast.success('Payment verified successfully!')
//             setTimeout(() => navigate('/buyer'), 2500)
//           }
//         } catch (err) {
//           const msg = err.response?.data?.error || 'Payment verification failed. Please contact support.'
//           setOrderError(msg)
//           toast.error('Payment failed')
//         } finally {
//           setOrdering(false)
//         }
//       },
//       prefill: {
//         name: user?.name || '',
//         email: user?.email || '',
//         contact: orderForm.phone,
//       },
//       theme: {
//         color: '#185546',
//       },
//       modal: {
//         ondismiss: function () {
//           setOrdering(false)
//           setOrderError('Payment was cancelled. You can try again.')
//         },
//       },
//     }

//     const rzp = new window.Razorpay(options)
//     rzp.on('payment.failed', function (response) {
//       setOrdering(false)
//       setOrderError(`Payment failed: ${response.error.description}`)
//     })
//     rzp.open()
//   }

//   const handlePlaceOrder = async (e) => {
//     e.preventDefault()
//     setOrderError('')
//     setOrdering(true)

//     try {
//       const res = await api.post('/payment/create-order/', {
//         product_id: product.id,
//         address: orderForm.address,
//         phone: orderForm.phone,
//         quantity: quantity,
//       })

//       openRazorpayCheckout(res.data)
//     } catch (err) {
//       const msg = err.response?.data
//       if (typeof msg === 'object' && msg.error) {
//         setOrderError(msg.error)
//       } else if (typeof msg === 'object') {
//         const errors = Object.values(msg).flat().join(' ')
//         setOrderError(errors || 'Failed to initiate payment.')
//       } else {
//         setOrderError('Failed to initiate payment. Please try again.')
//       }
//       setOrdering(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[80vh] bg-white">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#185546]"></div>
//           <p className="text-gray-500 mt-4 font-medium text-[15px]">Loading product...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!product) {
//     return (
//       <div className="flex items-center justify-center min-h-[80vh] bg-white">
//         <div className="text-center border border-gray-100 p-12 rounded-[24px]">
//           <p className="text-[#1a1f1d] font-bold text-[22px] mb-4">Product not found</p>
//           <button 
//             onClick={() => navigate('/home')}
//             className="text-[#185546] font-semibold hover:underline"
//           >
//             ← Back to Products
//           </button>
//         </div>
//       </div>
//     )
//   }

//   if (paymentSuccess) {
//     return (
//       <div className="min-h-screen bg-[#fafbfb] flex items-center justify-center font-sans">
//         <div className="text-center max-w-md mx-auto px-8 py-12 bg-white border border-gray-100 rounded-[24px] shadow-sm">
//           <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#185546] flex items-center justify-center">
//             <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
//               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//             </svg>
//           </div>
//           <h2 className="text-[28px] font-bold text-[#1a1f1d] mb-3 leading-tight">Payment Successful!</h2>
//           <p className="text-gray-500 text-[15px] mb-2">Your order for <span className="font-bold text-[#1a1f1d]">{product.name}</span> has been securely placed.</p>
//           <p className="text-gray-400 text-[14px]">Redirecting to your order dashboard...</p>
//           <div className="mt-8">
//             <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
//               <div className="h-full bg-[#185546] rounded-full animate-[progress_2.5s_ease-in-out]" style={{animation: 'progress 2.5s ease-in-out forwards'}}></div>
//             </div>
//           </div>
//         </div>
//         <style>{`
//           @keyframes progress {
//             from { width: 0%; }
//             to { width: 100%; }
//           }
//         `}</style>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-white font-sans">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <button 
//           onClick={() => navigate('/home')} 
//           className="mb-8 font-semibold text-gray-400 hover:text-[#185546] transition-colors flex items-center gap-2"
//         >
//           <span>←</span> Back to Collection
//         </button>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
//           {/* Product Image */}
//           <div className="relative">
//             <div className="bg-[#fafbfb] rounded-[24px] overflow-hidden border border-gray-100 p-4">
//               {product.image ? (
//                 <img
//                   src={product.image}
//                   alt={product.name}
//                   className="w-full h-80 sm:h-96 lg:h-[550px] object-contain rounded-[16px] mix-blend-multiply"
//                 />
//               ) : (
//                 <div className="w-full h-80 sm:h-96 lg:h-[550px] bg-[#fafbfb] flex items-center justify-center rounded-[16px]">
//                   <span className="text-8xl opacity-20">🏷️</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Product Info */}
//           <div className="flex flex-col justify-center">
//             <h1 className="text-[36px] md:text-[44px] font-bold text-[#1a1f1d] mb-4 leading-tight tracking-tight">{product.name}</h1>

//             <div className="flex items-center gap-3 mb-8">
//               <div className="w-10 h-10 rounded-full bg-[#eef7f4] flex items-center justify-center text-[#185546] font-bold shadow-sm border border-[#185546]/10">
//                 {product.vendorName?.[0] || 'V'}
//               </div>
//               <div>
//                 <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Verified Vendor</p>
//                 <p className="text-[15px] font-bold text-[#1a1f1d] leading-none mt-1">{product.vendorName}</p>
//               </div>
//             </div>

//             <div className="mb-8 pb-8 border-b border-gray-100 flex items-baseline gap-2">
//               <span className="text-[44px] font-bold text-[#185546] leading-none">₹{parseFloat(product.price).toFixed(2)}</span>
//             </div>

//             <div className="mb-10">
//               <h3 className="text-[18px] font-bold text-[#1a1f1d] mb-3">Product Description</h3>
//               <p className="text-gray-500 leading-relaxed text-[15.5px]">{product.description}</p>
//             </div>

//             {/* Order Error */}
//             {orderError && (
//               <div className="bg-red-50 border border-red-200 text-red-600 font-medium px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-[14px]">
//                 <span>⚠️</span> {orderError}
//               </div>
//             )}

//             {/* Buy / Order Form */}
//             <div className="space-y-6">
//               {!showOrderForm ? (
//                 <>
//                   <button
//                     onClick={handleBuyNow}
//                     className="w-full bg-[#ef6b4c] text-white hover:bg-[#d65a3d] py-4 rounded-xl font-bold text-[17px] shadow-sm transition-all active:scale-[0.99] flex justify-center items-center gap-2"
//                   >
//                     Proceed to Checkout
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
//                   </button>

//                   {!isAuthenticated && (
//                     <div className="text-[14px] text-gray-500 text-center bg-[#fafbfb] border border-gray-100 py-3 rounded-xl mt-4">
//                       Please{' '}
//                       <button
//                         onClick={() => navigate('/login')}
//                         className="text-[#185546] font-bold hover:underline"
//                       >
//                         sign in
//                       </button>
//                       {' '}to complete your purchase securely
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <form onSubmit={handlePlaceOrder} className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
//                   <div className="p-6 bg-white border border-gray-100 rounded-2xl space-y-6">
//                     <div className="flex justify-between items-center bg-[#fafbfb] p-4 rounded-xl border border-gray-100">
//                       <label className="block text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Quantity</label>
//                       <div className="flex items-center gap-4">
//                         <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-[#1a1f1d] shadow-sm hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#185546]">-</button>
//                         <span className="font-bold text-[18px] text-[#1a1f1d] w-6 text-center">{quantity}</span>
//                         <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-[#1a1f1d] shadow-sm hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#185546]">+</button>
//                       </div>
//                     </div>
                    
//                     <div>
//                       <h3 className="text-[16px] font-bold text-[#1a1f1d] pt-2 mb-4">Delivery Information</h3>
//                       <div className="space-y-4">
//                         <div>
//                           <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Full Delivery Address</label>
//                           <textarea
//                             value={orderForm.address}
//                             onChange={(e) => setOrderForm(prev => ({ ...prev, address: e.target.value }))}
//                             required
//                             rows="3"
//                             placeholder="Apartment, Street, City, Zip..."
//                             className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1a1f1d] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#185546]/10 focus:border-[#185546] transition-all font-medium bg-[#fafbfb] focus:bg-white text-[15px]"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Mobile Number</label>
//                           <input
//                             type="tel"
//                             value={orderForm.phone}
//                             onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
//                             required
//                             placeholder="+91 XXXXX XXXXX"
//                             className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1a1f1d] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#185546]/10 focus:border-[#185546] transition-all font-medium bg-[#fafbfb] focus:bg-white text-[15px]"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 px-4 py-3 bg-[#eef7f4] border border-[#185546]/10 rounded-xl">
//                     <svg className="w-5 h-5 text-[#185546] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                     </svg>
//                     <p className="text-[13px] text-[#185546]">
//                       Secured by <span className="font-bold">Razorpay</span> — Payment is fully encrypted.
//                     </p>
//                   </div>

//                   {/* Price Breakdown */}
//                   <div className="bg-[#fafbfb] p-5 rounded-2xl border border-gray-100 space-y-3 mb-4">
//                     <div className="flex justify-between text-[14px] text-gray-500 font-medium">
//                       <span>Subtotal ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
//                       <span className="text-[#1a1f1d]">₹{basePrice.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between text-[14px] text-gray-500 font-medium">
//                       <span>Platform Fee (5%)</span>
//                       <span className="text-[#1a1f1d]">₹{platformFee.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between text-[14px] text-gray-500 font-medium">
//                       <span>Taxes (GST 18%)</span>
//                       <span className="text-[#1a1f1d]">₹{gst.toFixed(2)}</span>
//                     </div>
//                     <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center text-[18px] text-[#1a1f1d] font-bold">
//                       <span>Total</span>
//                       <span>₹{totalAmount.toFixed(2)}</span>
//                     </div>
//                   </div>

//                   <div className="flex gap-4">
//                     <button
//                       type="button"
//                       onClick={() => { setShowOrderForm(false); setOrderError(''); }}
//                       className="flex-1 py-4 rounded-xl border border-gray-200 text-[#1a1f1d] font-bold hover:bg-[#fafbfb] transition-colors text-[15px]"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={ordering}
//                       className="flex-[2] bg-[#185546] text-white py-4 rounded-xl font-bold hover:bg-[#124236] transition-all text-[15px] shadow-sm disabled:opacity-80 flex justify-center items-center gap-2"
//                     >
//                       {ordering ? (
//                         <span className="flex items-center justify-center gap-2">
//                           <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                           </svg>
//                           Confirming...
//                         </span>
//                       ) : (
//                         <>💳 Pay ₹{totalAmount.toFixed(2)}</>
//                       )}
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
/* src/pages/ProductDetailPage.jsx */
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'



/* Scroll-triggered reveal — same API as HomePage */
function usePdpReveal(dep) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io  = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el    = e.target
          const cls   = el.dataset.reveal || 'pdp-fade-up'
          const delay = el.dataset.delay  || '0'
          el.style.animationDelay = delay + 'ms'
          el.classList.add(...cls.split(' '))
          io.unobserve(el)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [dep])
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export const ProductDetailPage = () => {

  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [product,        setProduct]        = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [isDrawerOpen,   setIsDrawerOpen]   = useState(false)
  const [drawerClosing,  setDrawerClosing]  = useState(false)
  const [ordering,       setOrdering]       = useState(false)
  const [orderError,     setOrderError]     = useState('')
  const [orderForm,      setOrderForm]      = useState({ address: '', phone: '' })
  const [quantity,       setQuantity]       = useState(1)
  const [qtyKey,         setQtyKey]         = useState(0)   // triggers re-mount for qty pop
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const basePrice    = product ? product.price * quantity : 0
  const platformFee  = basePrice * 0.05
  const gst          = platformFee * 0.18
  const totalAmount  = basePrice + platformFee + gst

  usePdpReveal(product)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}/`)
        setProduct(res.data)
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  /* Body scroll lock */
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isDrawerOpen])

  /* Keyboard close */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer() }
    if (isDrawerOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isDrawerOpen])

  const closeDrawer = () => {
    setDrawerClosing(true)
    setTimeout(() => { setIsDrawerOpen(false); setDrawerClosing(false) }, 380)
  }

  const changeQty = (next) => {
    setQuantity(next)
    setQtyKey(k => k + 1)
  }

  const handleInitiatePurchase = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (user?.role !== 'buyer') {
      toast.error('Only consumer accounts can make purchases.')
      return
    }
    setIsDrawerOpen(true)
    setOrderError('')
  }

  const openRazorpayCheckout = (orderData) => {
    const options = {
      key: orderData.razorpay_key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'MarketHub Collection',
      description: `Acquiring: ${orderData.product_name}`,
      order_id: orderData.razorpay_order_id,
      handler: async function (response) {
        try {
          setOrdering(true)
          const verifyRes = await api.post('/payment/verify/', {
            razorpay_order_id:  response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            product_id: orderData.delivery_info.product_id,
            address:    orderData.delivery_info.address,
            phone:      orderData.delivery_info.phone,
            quantity:   orderData.delivery_info.quantity,
          })
          if (verifyRes.status === 201) {
            setPaymentSuccess(true)
            closeDrawer()
            setTimeout(() => navigate('/buyer'), 4000)
          }
        } catch {
          setOrderError('Transaction verification failed. Please contact concierge.')
          toast.error('Transaction Failed')
        } finally {
          setOrdering(false)
        }
      },
      prefill: { name: user?.name || '', email: user?.email || '', contact: orderForm.phone },
      theme:   { color: '#111111' },
      modal:   { ondismiss: () => { setOrdering(false); setOrderError('Transaction was closed.') } },
    }
    new window.Razorpay(options).open()
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setOrderError('')
    setOrdering(true)
    try {
      const res = await api.post('/payment/create-order/', {
        product_id: product.id,
        address:    orderForm.address,
        phone:      orderForm.phone,
        quantity,
      })
      openRazorpayCheckout(res.data)
    } catch {
      setOrderError('Failed to initialize secure checkout.')
      setOrdering(false)
    }
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] pt-32 pb-20 font-sans">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <div className="bg-[#EBE7DF] aspect-[4/5] md:aspect-[3/4] animate-pulse" />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6 pt-4">
            <div className="h-3 w-24 bg-[#EBE7DF] animate-pulse" />
            <div className="h-10 w-3/4 bg-[#EBE7DF] animate-pulse" />
            <div className="h-8 w-1/3 bg-[#EBE7DF] animate-pulse" />
            <div className="h-[1px] bg-[#EBE7DF]" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-[#EBE7DF] animate-pulse" />
              <div className="h-3 w-5/6 bg-[#EBE7DF] animate-pulse" />
              <div className="h-3 w-4/6 bg-[#EBE7DF] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center font-sans">
        <div className="text-center pdp-page-in">
          <p className="font-serif italic text-5xl text-[#111111]/20 mb-8">Not found.</p>
          <button onClick={() => navigate('/home')} className="pdp-back-link text-[11px] uppercase tracking-[0.3em] font-bold text-[#8E7A60]">
            ← Back to Collection
          </button>
        </div>
      </div>
    )
  }

  /* ── Success screen ── */
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center font-sans pdp-grain">
        <div className="text-center max-w-md mx-auto px-4">

          {/* Animated check ring */}
          <div className="flex justify-center mb-10">
            <div className="pdp-ring-scale w-20 h-20 rounded-full border-2 border-[#111111]/15 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  className="pdp-check-draw"
                  d="M6 14l6 6L22 8"
                  stroke="#8E7A60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <span
            data-reveal="pdp-fade-up" data-delay="0"
            className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8E7A60] mb-6 block"
          >
            Transaction Complete
          </span>
          <h2
            data-reveal="pdp-fade-up" data-delay="120"
            className="text-6xl md:text-7xl font-serif text-[#111111] mb-6 italic"
          >
            Acquired.
          </h2>
          <p
            data-reveal="pdp-fade-up" data-delay="240"
            className="text-[#111111]/60 text-sm tracking-wide mb-12 px-4 leading-relaxed"
          >
            Your piece has been secured. The studio will begin preparation shortly.
            Redirecting you to your collection.
          </p>

          <div data-reveal="pdp-fade-in" data-delay="400" className="w-full flex justify-center">
            <div className="h-[1px] bg-[#111111]/10 w-52 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-[#8E7A60] pdp-loading-line" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Main product page ── */
  return (
    <div className="pdp-grain min-h-screen bg-[#F8F6F0] font-sans pt-32 pb-20 pdp-page-in">
      <div className="max-w-7xl mx-auto px-4">

        {/* Back link */}
        <div data-reveal="pdp-fade-in" data-delay="0" className="mb-10">
          <button
            onClick={() => navigate('/home')}
            className="pdp-back-link text-[11px] uppercase tracking-[0.3em] font-bold text-[#111111]/40 hover:text-[#8E7A60] transition-colors"
          >
            <span>←</span> Collection
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* ── LEFT: Image ── */}
          <div className="lg:col-span-7 relative group cursor-crosshair">

            {/* Clip-path reveal wrapper */}
            <div data-reveal="pdp-img-reveal" data-delay="100">
              <div className="bg-[#EBE7DF] aspect-[4/5] md:aspect-[3/4] overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    alt={product.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-4xl opacity-10 italic">Hub.</div>
                )}
              </div>
            </div>

            {/* Floating edition label */}
            <div
              data-reveal="pdp-fade-up" data-delay="500"
              className="absolute bottom-6 left-6 pdp-tag bg-[#F8F6F0]/80 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8E7A60]" />
              Limited Edition
            </div>
          </div>

          {/* ── RIGHT: Info Panel ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-40 h-fit flex flex-col justify-center">

            {/* Vendor + Title */}
            <div className="mb-10">
              <span
                data-reveal="pdp-fade-up" data-delay="180"
                className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8E7A60] mb-4 block"
              >
                {product.vendor_shop || 'Essential Collection'}
              </span>
              <h1
                data-reveal="pdp-fade-up" data-delay="260"
                className="text-5xl md:text-6xl font-serif text-[#111111] mb-6 leading-[1.05]"
              >
                {product.name}
              </h1>

              {/* Price with pop animation */}
              <p
                data-reveal="pdp-price-pop" data-delay="380"
                className="text-2xl font-sans font-medium text-[#111111] tracking-tight"
              >
                ₹{parseFloat(product.price).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Divider */}
            <div data-reveal="pdp-line" data-delay="420" className="h-[1px] bg-[#111111]/10 mb-10" />

            {/* Description */}
            <div data-reveal="pdp-fade-up" data-delay="460" className="mb-12">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4 text-[#111111]/40">
                The Details
              </h3>
              <p className="text-[#111111]/75 leading-relaxed font-light text-sm">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            <div data-reveal="pdp-fade-up" data-delay="520" className="flex flex-wrap gap-2 mb-12">
              {['Verified Studio', 'Encrypted Checkout', 'Artisan Goods'].map(tag => (
                <span key={tag} className="pdp-tag">{tag}</span>
              ))}
            </div>

            {/* CTA */}
            <div data-reveal="pdp-fade-up" data-delay="580">
              <button
                onClick={handleInitiatePurchase}
                className="pdp-cta-shimmer w-full py-6 text-[#F8F6F0] text-[11px] font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-3 group"
              >
                {isAuthenticated ? 'Acquire Piece' : 'Sign in to Acquire'}
                <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-2">→</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── CHECKOUT DRAWER ── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">

          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-[#111111]/40 backdrop-blur-sm cursor-pointer ${drawerClosing ? 'pdp-overlay-exit' : 'pdp-overlay-enter'}`}
            onClick={closeDrawer}
          />

          {/* Panel */}
          <div className={`relative w-full max-w-md bg-[#111111] text-[#F8F6F0] h-full shadow-2xl flex flex-col border-l border-[#F8F6F0]/10 ${drawerClosing ? 'pdp-drawer-exit' : 'pdp-drawer-enter'}`}>

            {/* Header */}
            <div className="p-8 border-b border-[#F8F6F0]/10 flex justify-between items-center">
              <div>
                <span
                  className="pdp-drawer-row text-[10px] uppercase tracking-[0.3em] font-bold text-[#8E7A60]"
                  style={{ animationDelay: '80ms' }}
                >
                  Secure Checkout
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="w-8 h-8 flex items-center justify-center text-[#F8F6F0]/40 hover:text-[#F8F6F0] transition-colors text-2xl font-light leading-none hover:rotate-90 duration-300"
                style={{ transition: 'transform 0.3s ease, color 0.2s' }}
              >
                ×
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">

              {/* Product summary */}
              <div className="pdp-drawer-row flex gap-5 items-center" style={{ animationDelay: '120ms' }}>
                <div className="w-16 h-20 bg-[#1A1A1A] overflow-hidden flex-shrink-0">
                  {product.image && (
                    <img src={product.image} className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-110" alt="" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-1 leading-snug">{product.name}</h3>
                  <p className="text-[10px] text-[#F8F6F0]/40 uppercase tracking-widest font-bold">{product.vendor_shop}</p>
                </div>
              </div>

              {/* Error */}
              {orderError && (
                <div className="pdp-drawer-row border-l-2 border-red-500 pl-4 py-2 text-red-400 text-[11px] uppercase tracking-widest font-bold bg-red-500/10">
                  {orderError}
                </div>
              )}

              <form id="pdp-checkout-form" onSubmit={handlePlaceOrder} className="space-y-10">

                {/* Quantity */}
                <div className="pdp-drawer-row space-y-4" style={{ animationDelay: '160ms' }}>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F8F6F0]/40">Quantity</label>
                  <div className="flex items-center gap-8 border-b border-[#F8F6F0]/15 pb-4 w-fit">
                    <button
                      type="button"
                      onClick={() => changeQty(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-xl hover:text-[#8E7A60] transition-colors active:scale-90"
                    >−</button>
                    <span key={qtyKey} className="pdp-qty-pop font-serif text-2xl w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQty(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-xl hover:text-[#8E7A60] transition-colors active:scale-90"
                    >+</button>
                  </div>
                </div>

                {/* Shipping */}
                <div className="pdp-drawer-row space-y-8" style={{ animationDelay: '200ms' }}>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F8F6F0]/40">Shipping Address</label>
                    <textarea
                      value={orderForm.address}
                      onChange={(e) => setOrderForm(p => ({ ...p, address: e.target.value }))}
                      required rows="2"
                      placeholder="Enter full destination..."
                      className="w-full bg-transparent border-b border-[#F8F6F0]/15 pb-3 text-[14px] outline-none focus:border-[#8E7A60] transition-colors duration-300 placeholder:text-[#F8F6F0]/20 resize-none font-light"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F8F6F0]/40">Contact Number</label>
                    <input
                      type="tel"
                      value={orderForm.phone}
                      onChange={(e) => setOrderForm(p => ({ ...p, phone: e.target.value }))}
                      required placeholder="+91"
                      className="w-full bg-transparent border-b border-[#F8F6F0]/15 pb-3 text-[14px] outline-none focus:border-[#8E7A60] transition-colors duration-300 placeholder:text-[#F8F6F0]/20 font-light"
                    />
                  </div>
                </div>
              </form>

              {/* Price breakdown — staggered rows */}
              <div className="pt-6 border-t border-[#F8F6F0]/10 space-y-4">
                {[
                  { label: 'Subtotal',        val: basePrice },
                  { label: 'Platform Fee (5%)', val: platformFee },
                  { label: 'Taxes (18%)',      val: gst },
                ].map(({ label, val }, i) => (
                  <div
                    key={label}
                    className="pdp-drawer-row flex justify-between text-[10px] uppercase tracking-widest text-[#F8F6F0]/55"
                    style={{ animationDelay: `${240 + i * 60}ms` }}
                  >
                    <span>{label}</span>
                    <span className="font-sans font-medium text-[#F8F6F0]">
                      ₹{val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-[#F8F6F0]/10 bg-[#0A0A0A]">
              <div className="pdp-drawer-row flex justify-between items-end mb-6" style={{ animationDelay: '380ms' }}>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F8F6F0]/40">Total</span>
                <span className="font-sans font-medium text-3xl">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <button
                type="submit"
                form="pdp-checkout-form"
                disabled={ordering}
                className="pdp-drawer-row w-full py-5 bg-[#F8F6F0] text-[#111111] text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-[#8E7A60] hover:text-[#F8F6F0] transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={{ animationDelay: '420ms' }}
              >
                {ordering ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40" strokeDashoffset="10" />
                    </svg>
                    Encrypting…
                  </>
                ) : (
                  <>Complete Payment →</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}