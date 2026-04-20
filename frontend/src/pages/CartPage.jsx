/* src/pages/CartPage.jsx */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const CartPage = () => {
  const [cart, setCart] = useState(null)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = () => {
    api.get('/cart/')
      .then(res => setCart(res.data))
      .catch(() => setCart(null))
  }

  // --- NEW: Remove Item Function ---
  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}/`)
      // Update the UI instantly by filtering out the deleted item
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.filter(item => item.id !== itemId)
      }))
      toast.success("Item removed from cart")
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item")
    }
  }

  const handleCheckout = async (e) => {
    e.preventDefault()

    // 1. Validation for the 10-digit mobile number
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(phone)) {
      return toast.error("Mobile number must be exactly 10 digits (0-9).")
    }

    // 2. Validation for address
    if (!address.trim()) {
      return toast.error("Please provide a shipping address.")
    }

    setCheckingOut(true)

    try {
      // FIX: Change 'formData.address' to 'address' and 'formData.phone' to 'phone'
      const res = await api.post('/checkout/', { address, phone })
      const orderData = res.data

      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MarketHub Checkout',
        description: 'Complete your purchase',
        order_id: orderData.razorpay_order_id,
        handler: async function (response) {
          try {
            await api.post('/payment/verify-cart/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              address: address, // Used 'address' directly
              phone: phone     // Used 'phone' directly
            })

            toast.success("Payment Successful! Order Placed.")
            navigate('/buyer')

          } catch (err) {
            toast.error(err.response?.data?.error || "Payment verification failed.")
          }
        },
        theme: { color: '#fe4c50' },
      }
      new window.Razorpay(options).open()

    } catch (err) {
      toast.error(err.response?.data?.error || "Checkout failed.")
    } finally {
      setCheckingOut(false)
    }
  }

  if (!cart || !cart.items) return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>

  const total = cart.items.reduce((acc, item) => acc + (parseFloat(item.product_details.price) * item.quantity), 0)
  const platformFee = total * 0.05
  const gst = platformFee * 0.18
  const finalTotal = total + platformFee + gst

  if (cart.items.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-500 mb-4">Your Cart is Empty</h2>
      <button onClick={() => navigate('/')} className="bg-[#fe4c50] text-white px-6 py-2 rounded shadow-md hover:bg-[#e04347] transition-colors">Return to Shop</button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <h1 className="text-3xl font-bold text-[#1e1e27] mb-10 border-b pb-4">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <div className="border border-gray-200 rounded-sm overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-[#1e1e27]">
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
                  <tr key={item.id} className="bg-white">
                    <td className="p-4 flex items-center gap-4">
                      <img src={item.product_details.image} alt={item.product_details.name} className="w-16 h-16 object-cover bg-gray-50 border border-gray-100" />
                      <span className="font-medium text-[#1e1e27]">{item.product_details.name}</span>
                    </td>
                    <td className="p-4 text-gray-600">₹{item.product_details.price}</td>
                    <td className="p-4 font-medium">{item.quantity}</td>
                    <td className="p-4 text-[#fe4c50] font-bold">₹{parseFloat(item.product_details.price) * item.quantity}</td>

                    {/* NEW: Remove Button */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-[#fe4c50] transition-colors p-2 rounded-full hover:bg-red-50"
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

        <div className="lg:w-1/3">
          <div className="bg-[#f5f5f5] p-8 rounded-sm shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#1e1e27] mb-6">Order Summary</h2>
            <div className="flex justify-between mb-3 text-gray-600"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
            <div className="flex justify-between mb-3 text-gray-600"><span>Platform Fee</span><span>₹{platformFee.toFixed(2)}</span></div>
            <div className="flex justify-between mb-4 text-gray-600 border-b border-gray-300 pb-4"><span>GST (18%)</span><span>₹{gst.toFixed(2)}</span></div>
            <div className="flex justify-between mb-8 text-xl font-bold text-[#1e1e27]"><span>Total</span><span className="text-[#fe4c50]">₹{finalTotal.toFixed(2)}</span></div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Full Shipping Address" className="w-full p-3 border border-gray-300 outline-none focus:border-[#fe4c50] transition-colors" rows="3" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Phone Number" className="w-full p-3 border border-gray-300 outline-none focus:border-[#fe4c50] transition-colors" />
              <button type="submit" disabled={checkingOut} className="w-full bg-[#1e1e27] text-white py-4 font-bold uppercase tracking-widest hover:bg-[#fe4c50] transition-colors mt-4 disabled:opacity-50">
                {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}