import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderForm, setOrderForm] = useState({ address: '', phone: '' })
  const [quantity, setQuantity] = useState(1)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const basePrice = product ? product.price * quantity : 0
  const platformFee = basePrice * 0.05
  const gst = platformFee * 0.18
  const totalAmount = basePrice + platformFee + gst

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}/`)
        setProduct({
          id: res.data.id,
          name: res.data.name,
          price: res.data.price,
          image: res.data.image,
          vendorName: res.data.vendor_shop,
          description: res.data.description,
          vendorId: res.data.vendor,
        })
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user?.role !== 'buyer') {
      setOrderError('Only buyers can purchase products')
      return
    }
    setShowOrderForm(true)
  }

  const openRazorpayCheckout = (orderData) => {
    const options = {
      key: orderData.razorpay_key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'E-Commerce Store',
      description: `Purchase: ${orderData.product_name}`,
      order_id: orderData.razorpay_order_id,
      handler: async function (response) {
        // Payment successful on Razorpay's end — now verify on our backend
        try {
          setOrdering(true)
          const verifyRes = await api.post('/payment/verify/', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            product_id: orderData.delivery_info.product_id,
            address: orderData.delivery_info.address,
            phone: orderData.delivery_info.phone,
            quantity: orderData.delivery_info.quantity,
          })

          if (verifyRes.status === 201) {
            setPaymentSuccess(true)
            toast.success('Payment verified successfully!')
            // Redirect to buyer dashboard after a short delay
            setTimeout(() => navigate('/buyer'), 2500)
          }
        } catch (err) {
          const msg = err.response?.data?.error || 'Payment verification failed. Please contact support.'
          setOrderError(msg)
          toast.error('Payment failed')
        } finally {
          setOrdering(false)
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: orderForm.phone,
      },
      theme: {
        color: '#7c3aed',
      },
      modal: {
        ondismiss: function () {
          setOrdering(false)
          setOrderError('Payment was cancelled. You can try again.')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', function (response) {
      setOrdering(false)
      setOrderError(`Payment failed: ${response.error.description}`)
    })
    rzp.open()
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setOrderError('')
    setOrdering(true)

    try {
      // Step 1: Create Razorpay order on backend
      const res = await api.post('/payment/create-order/', {
        product_id: product.id,
        address: orderForm.address,
        phone: orderForm.phone,
        quantity: quantity,
      })

      // Step 2: Open Razorpay checkout modal
      openRazorpayCheckout(res.data)
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object' && msg.error) {
        setOrderError(msg.error)
      } else if (typeof msg === 'object') {
        const errors = Object.values(msg).flat().join(' ')
        setOrderError(errors || 'Failed to initiate payment.')
      } else {
        setOrderError('Failed to initiate payment. Please try again.')
      }
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-500 mt-4 font-medium">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <p className="text-gray-600 font-display text-2xl mb-4">Product not found</p>
          <Button onClick={() => navigate('/home')}>Back to Products</Button>
        </div>
      </div>
    )
  }

  // Payment success state
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
            <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-dark font-display mb-3">Payment Successful!</h2>
          <p className="text-gray-500 text-lg mb-2">Your order for <span className="font-bold text-dark">{product.name}</span> has been placed.</p>
          <p className="text-gray-400 text-sm">Redirecting to your dashboard...</p>
          <div className="mt-8">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-[progress_2.5s_ease-in-out]" style={{animation: 'progress 2.5s ease-in-out forwards'}}></div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate('/home')} className="mb-8 font-semibold">
          ← Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image */}
          <div className="relative group">
            <div className="absolute inset-4 bg-gradient-to-tr from-primary/30 to-fuchsia-400/30 blur-2xl rounded-3xl -z-10 group-hover:blur-3xl transition-all duration-500"></div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-white/50">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-72 sm:h-96 lg:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-72 sm:h-96 lg:h-[600px] bg-gray-100 flex items-center justify-center">
                  <span className="text-8xl opacity-40">📦</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-dark mb-4 font-display leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {product.vendorName?.[0] || 'V'}
              </div>
              <div>
                <p className="text-sm text-gray-500">Sold by</p>
                <p className="text-lg font-semibold text-dark leading-none">{product.vendorName}</p>
              </div>
            </div>

            <div className="mb-8 p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wider block mb-2">Price</span>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-fuchsia-600 inline-block">₹{product.price}</p>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold font-display text-dark mb-4">Description</h3>
              <p className="text-gray-500 leading-relaxed text-lg">{product.description}</p>
            </div>

            {/* Order Error */}
            {orderError && (
              <div className="bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                <span>⚠️</span> {orderError}
              </div>
            )}

            {/* Buy / Order Form */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              {!showOrderForm ? (
                <>
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleBuyNow}
                    className="mt-2 py-5 text-xl font-bold shadow-2xl"
                  >
                    Checkout & Buy Now
                  </Button>

                  {!isAuthenticated && (
                    <div className="text-sm text-gray-500 text-center bg-gray-100 py-3 rounded-xl mt-4">
                      Please{' '}
                      <button
                        onClick={() => navigate('/login')}
                        className="text-primary font-bold hover:underline"
                      >
                        sign in
                      </button>
                      {' '}to purchase securely
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  <div className="p-6 bg-white border border-gray-100 rounded-2xl space-y-5">
                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border-2 border-gray-100">
                      <label className="block text-sm font-bold text-dark uppercase tracking-wide">Quantity</label>
                      <div className="flex items-center gap-4">
                        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-lg text-dark shadow-sm hover:bg-gray-50 transition-colors">-</button>
                        <span className="font-bold text-xl text-dark w-6 text-center">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-lg text-dark shadow-sm hover:bg-gray-50 transition-colors">+</button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-dark font-display pt-2">Delivery Details</h3>
                    <div>
                      <label className="block text-sm font-bold text-dark mb-2 uppercase tracking-wide">Delivery Address</label>
                      <textarea
                        value={orderForm.address}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, address: e.target.value }))}
                        required
                        rows="3"
                        placeholder="Enter your full delivery address..."
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 text-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all font-medium bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-dark mb-2 uppercase tracking-wide">Phone Number</label>
                      <input
                        type="tel"
                        value={orderForm.phone}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                        required
                        placeholder="Enter your phone number"
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 text-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all font-medium bg-gray-50/50"
                      />
                    </div>
                  </div>

                  {/* Razorpay security badge */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-sm text-green-700 font-medium">
                      Secured by <span className="font-bold">Razorpay</span> — 100% safe & encrypted payment
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border-2 border-gray-100 space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>Items Total ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
                      <span>₹{basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>Platform Fee (5%)</span>
                      <span>₹{platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>GST (18%)</span>
                      <span>₹{gst.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between text-lg text-dark font-black">
                      <span>Total Amount</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => { setShowOrderForm(false); setOrderError(''); }}
                      className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={ordering}
                      className="flex-1 py-5 text-lg font-bold shadow-2xl"
                    >
                      {ordering ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>💳 Pay ₹{totalAmount.toFixed(2)}</>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
