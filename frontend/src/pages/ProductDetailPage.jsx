import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
      name: 'MarketHub Purchase',
      description: `Purchase: ${orderData.product_name}`,
      order_id: orderData.razorpay_order_id,
      handler: async function (response) {
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
        color: '#185546',
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
      const res = await api.post('/payment/create-order/', {
        product_id: product.id,
        address: orderForm.address,
        phone: orderForm.phone,
        quantity: quantity,
      })

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
      <div className="flex items-center justify-center min-h-[80vh] bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#185546]"></div>
          <p className="text-gray-500 mt-4 font-medium text-[15px]">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-white">
        <div className="text-center border border-gray-100 p-12 rounded-[24px]">
          <p className="text-[#1a1f1d] font-bold text-[22px] mb-4">Product not found</p>
          <button 
            onClick={() => navigate('/home')}
            className="text-[#185546] font-semibold hover:underline"
          >
            ← Back to Products
          </button>
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#fafbfb] flex items-center justify-center font-sans">
        <div className="text-center max-w-md mx-auto px-8 py-12 bg-white border border-gray-100 rounded-[24px] shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#185546] flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[28px] font-bold text-[#1a1f1d] mb-3 leading-tight">Payment Successful!</h2>
          <p className="text-gray-500 text-[15px] mb-2">Your order for <span className="font-bold text-[#1a1f1d]">{product.name}</span> has been securely placed.</p>
          <p className="text-gray-400 text-[14px]">Redirecting to your order dashboard...</p>
          <div className="mt-8">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#185546] rounded-full animate-[progress_2.5s_ease-in-out]" style={{animation: 'progress 2.5s ease-in-out forwards'}}></div>
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
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button 
          onClick={() => navigate('/home')} 
          className="mb-8 font-semibold text-gray-400 hover:text-[#185546] transition-colors flex items-center gap-2"
        >
          <span>←</span> Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Product Image */}
          <div className="relative">
            <div className="bg-[#fafbfb] rounded-[24px] overflow-hidden border border-gray-100 p-4">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 sm:h-96 lg:h-[550px] object-contain rounded-[16px] mix-blend-multiply"
                />
              ) : (
                <div className="w-full h-80 sm:h-96 lg:h-[550px] bg-[#fafbfb] flex items-center justify-center rounded-[16px]">
                  <span className="text-8xl opacity-20">🏷️</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-[36px] md:text-[44px] font-bold text-[#1a1f1d] mb-4 leading-tight tracking-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#eef7f4] flex items-center justify-center text-[#185546] font-bold shadow-sm border border-[#185546]/10">
                {product.vendorName?.[0] || 'V'}
              </div>
              <div>
                <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Verified Vendor</p>
                <p className="text-[15px] font-bold text-[#1a1f1d] leading-none mt-1">{product.vendorName}</p>
              </div>
            </div>

            <div className="mb-8 pb-8 border-b border-gray-100 flex items-baseline gap-2">
              <span className="text-[44px] font-bold text-[#185546] leading-none">₹{parseFloat(product.price).toFixed(2)}</span>
            </div>

            <div className="mb-10">
              <h3 className="text-[18px] font-bold text-[#1a1f1d] mb-3">Product Description</h3>
              <p className="text-gray-500 leading-relaxed text-[15.5px]">{product.description}</p>
            </div>

            {/* Order Error */}
            {orderError && (
              <div className="bg-red-50 border border-red-200 text-red-600 font-medium px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-[14px]">
                <span>⚠️</span> {orderError}
              </div>
            )}

            {/* Buy / Order Form */}
            <div className="space-y-6">
              {!showOrderForm ? (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-[#ef6b4c] text-white hover:bg-[#d65a3d] py-4 rounded-xl font-bold text-[17px] shadow-sm transition-all active:scale-[0.99] flex justify-center items-center gap-2"
                  >
                    Proceed to Checkout
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>

                  {!isAuthenticated && (
                    <div className="text-[14px] text-gray-500 text-center bg-[#fafbfb] border border-gray-100 py-3 rounded-xl mt-4">
                      Please{' '}
                      <button
                        onClick={() => navigate('/login')}
                        className="text-[#185546] font-bold hover:underline"
                      >
                        sign in
                      </button>
                      {' '}to complete your purchase securely
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="p-6 bg-white border border-gray-100 rounded-2xl space-y-6">
                    <div className="flex justify-between items-center bg-[#fafbfb] p-4 rounded-xl border border-gray-100">
                      <label className="block text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Quantity</label>
                      <div className="flex items-center gap-4">
                        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-[#1a1f1d] shadow-sm hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#185546]">-</button>
                        <span className="font-bold text-[18px] text-[#1a1f1d] w-6 text-center">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-[#1a1f1d] shadow-sm hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#185546]">+</button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-[16px] font-bold text-[#1a1f1d] pt-2 mb-4">Delivery Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Full Delivery Address</label>
                          <textarea
                            value={orderForm.address}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, address: e.target.value }))}
                            required
                            rows="3"
                            placeholder="Apartment, Street, City, Zip..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1a1f1d] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#185546]/10 focus:border-[#185546] transition-all font-medium bg-[#fafbfb] focus:bg-white text-[15px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Mobile Number</label>
                          <input
                            type="tel"
                            value={orderForm.phone}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                            required
                            placeholder="+91 XXXXX XXXXX"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#1a1f1d] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#185546]/10 focus:border-[#185546] transition-all font-medium bg-[#fafbfb] focus:bg-white text-[15px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-3 bg-[#eef7f4] border border-[#185546]/10 rounded-xl">
                    <svg className="w-5 h-5 text-[#185546] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-[13px] text-[#185546]">
                      Secured by <span className="font-bold">Razorpay</span> — Payment is fully encrypted.
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-[#fafbfb] p-5 rounded-2xl border border-gray-100 space-y-3 mb-4">
                    <div className="flex justify-between text-[14px] text-gray-500 font-medium">
                      <span>Subtotal ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
                      <span className="text-[#1a1f1d]">₹{basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[14px] text-gray-500 font-medium">
                      <span>Platform Fee (5%)</span>
                      <span className="text-[#1a1f1d]">₹{platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[14px] text-gray-500 font-medium">
                      <span>Taxes (GST 18%)</span>
                      <span className="text-[#1a1f1d]">₹{gst.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center text-[18px] text-[#1a1f1d] font-bold">
                      <span>Total</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => { setShowOrderForm(false); setOrderError(''); }}
                      className="flex-1 py-4 rounded-xl border border-gray-200 text-[#1a1f1d] font-bold hover:bg-[#fafbfb] transition-colors text-[15px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={ordering}
                      className="flex-[2] bg-[#185546] text-white py-4 rounded-xl font-bold hover:bg-[#124236] transition-all text-[15px] shadow-sm disabled:opacity-80 flex justify-center items-center gap-2"
                    >
                      {ordering ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Confirming...
                        </span>
                      ) : (
                        <>💳 Pay ₹{totalAmount.toFixed(2)}</>
                      )}
                    </button>
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
