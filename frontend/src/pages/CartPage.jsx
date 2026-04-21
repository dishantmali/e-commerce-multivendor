// src/pages/CartPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const CartPage = () => {
  const [cart, setCart] = useState(null)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      if (user?.role === 'vendor' || user?.role === 'admin') {
        navigate('/');
        return;
      }
      api.get('/cart/')
        .then(res => setCart(res.data))
        .catch(() => setCart({ items: [] }))
    } else {
      let parsedCart = [];
      try {
        const storedCart = JSON.parse(localStorage.getItem('guestCart'));
        if (Array.isArray(storedCart)) {
          parsedCart = storedCart;
        } else {
          localStorage.removeItem('guestCart');
        }
      } catch (e) {
        console.error("Corrupted guest cart data, resetting...", e);
        localStorage.removeItem('guestCart');
      }

      setCart({
        items: parsedCart.map((item, index) => ({
          id: `guest-${index}`,
          product_id: item.product_id,
          product_details: item.product_details,
          quantity: item.quantity
        }))
      });
    }
  }, [isAuthenticated, user, loading, navigate])

  const handleRemoveItem = async (itemId, productId) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/cart/remove/${itemId}/`)
        setCart(prevCart => ({
          ...prevCart,
          items: prevCart.items.filter(item => item.id !== itemId)
        }))
        toast.success("Item removed from cart")
      } catch (error) {
        toast.error("Failed to remove item")
      }
    } else {
      let guestCart = [];
      try {
        const stored = JSON.parse(localStorage.getItem('guestCart'));
        if (Array.isArray(stored)) guestCart = stored;
      } catch (e) {}

      guestCart = guestCart.filter(item => item.product_id !== productId);
      localStorage.setItem('guestCart', JSON.stringify(guestCart));

      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.filter(item => item.product_id !== productId)
      }))
      toast.success("Item removed from cart")
    }
  }

  const handleCheckout = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error("Please log in or sign up to proceed with checkout.");
      navigate('/login');
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(phone)) {
      return toast.error("Mobile number must be exactly 10 digits (0-9).")
    }

    if (!address.trim()) {
      return toast.error("Please provide a shipping address.")
    }

    setCheckingOut(true)

    try {
      const res = await api.post('/checkout/', { address, phone })
      const orderData = res.data

      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Gujju Ni Dukan',
        description: 'Complete your purchase',
        order_id: orderData.razorpay_order_id,
        handler: async function (response) {
          try {
            await api.post('/payment/verify-cart/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              address: address,
              phone: phone
            })
            toast.success("Payment Successful! Order Placed.")
            navigate('/buyer')
          } catch (err) {
            toast.error(err.response?.data?.error || "Payment verification failed.")
          }
        },
        theme: { color: '#5A3825' },
      }
      new window.Razorpay(options).open()

    } catch (err) {
      toast.error(err.response?.data?.error || "Checkout failed.")
    } finally {
      setCheckingOut(false)
    }
  }

  if (!cart) return (
    <div className="min-h-[60vh] flex items-center justify-center text-[#5A3825]">
      Loading...
    </div>
  )

  const total = cart.items.reduce((acc, item) => acc + (parseFloat(item.product_details.price) * item.quantity), 0)
  const platformFee = total * 0.05
  const gst = platformFee * 0.18
  const finalTotal = total + platformFee + gst

  if (cart.items.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans bg-[#FAF8F5]">
      <div className="animate-fade-in-up text-center">
        <h2 className="text-2xl font-bold text-[#2C1E16] mb-4">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/')}
          className="btn-primary bg-[#5A3825] text-white px-8 py-3 rounded-full shadow-md hover:bg-[#3E2723] font-bold tracking-wider uppercase text-sm"
        >
          Return to Shop
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <h1 className="animate-fade-in text-3xl font-bold text-[#2C1E16] mb-10 border-b border-gray-200 pb-4">
        Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">

        {/* Cart Table */}
        <div className="animate-fade-in-up lg:w-2/3">
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-[#FAF8F5] border-b border-gray-200 text-[#2C1E16]">
                <tr>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Quantity</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cart.items.map(item => (
                  <tr key={item.id} className="cart-row bg-white">
                    <td className="p-4 flex items-center gap-4">
                      <div className="overflow-hidden rounded-lg border border-gray-100 w-16 h-16 bg-[#FAF8F5] shrink-0">
                        <img
                          src={item.product_details.image}
                          alt={item.product_details.name}
                          className="cart-product-img w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-[#2C1E16]">{item.product_details.name}</span>
                    </td>
                    <td className="p-4 text-gray-600">₹{item.product_details.price}</td>
                    <td className="p-4 font-medium">{item.quantity}</td>
                    <td className="p-4 text-[#A87C51] font-bold">
                      ₹{parseFloat(item.product_details.price) * item.quantity}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id, item.product_id || item.product_details.id)}
                        className="remove-btn text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50"
                        title="Remove Item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="animate-fade-in-right lg:w-1/3">
          <div className="bg-[#FAF8F5] p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-[#2C1E16] mb-6">Order Summary</h2>

            <div className="flex justify-between mb-3 text-gray-600">
              <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-3 text-gray-600">
              <span>Platform Fee</span><span>₹{platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600 border-b border-gray-300 pb-4">
              <span>GST (18%)</span><span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-8 text-xl font-bold text-[#2C1E16]">
              <span>Total</span>
              <span className="text-[#A87C51]">₹{finalTotal.toFixed(2)}</span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="Full Shipping Address"
                className="input-animated w-full p-4 border border-gray-300 rounded-lg outline-none focus:border-[#A87C51] transition-colors"
                rows="3"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Phone Number"
                className="input-animated w-full p-4 border border-gray-300 rounded-lg outline-none focus:border-[#A87C51] transition-colors"
              />
              <button
                type="submit"
                disabled={checkingOut}
                className="btn-primary w-full bg-[#5A3825] text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#3E2723] mt-4 disabled:opacity-50"
              >
                {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </form>

            {!isAuthenticated && (
              <p className="text-sm text-center text-gray-500 mt-4">
                You will be asked to log in before checking out.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}