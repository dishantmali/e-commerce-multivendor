import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SkeletonOrderCard = () => (
  <div className="border border-gray-200 rounded-xl p-6 bg-white">
    <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
      <div className="space-y-2">
        <div className="skeleton-shimmer h-3 w-24 rounded-full" />
        <div className="skeleton-shimmer h-4 w-32 rounded-full" />
      </div>
      <div className="text-right space-y-2">
        <div className="skeleton-shimmer h-3 w-12 rounded-full ml-auto" />
        <div className="skeleton-shimmer h-6 w-20 rounded-full ml-auto" />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="skeleton-shimmer w-16 h-16 rounded-md shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="skeleton-shimmer h-4 w-3/4 rounded-full" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded-full" />
      </div>
    </div>
  </div>
);

// Helper component for interactive 5-star rating
const StarRatingInput = ({ rating, setRating }) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => setRating(star)}
          className={`transition-colors duration-200 focus:outline-none ${star <= rating ? 'text-[#A87C51]' : 'text-gray-200 hover:text-[#A87C51]/60'}`}
        >
          <svg className="w-10 h-10 fill-current drop-shadow-sm" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export const BuyerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Review States ---
  const [reviewedItemIds, setReviewedItemIds] = useState(new Set()); // Locally track submitted reviews

  // Product Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItemToReview, setSelectedItemToReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Platform Review Modal State
  const [platformReviewModalOpen, setPlatformReviewModalOpen] = useState(false);
  const [platformRating, setPlatformRating] = useState(5);
  const [platformFeedback, setPlatformFeedback] = useState('');
  const [submittingPlatform, setSubmittingPlatform] = useState(false);

  useEffect(() => {
    api.get('/orders/')
      .then(res => setOrders(res.data.results !== undefined ? res.data.results : res.data))
      .catch(err => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, []);

  // --- Handlers ---
  const openProductReviewModal = (item) => {
    setSelectedItemToReview(item);
    setReviewRating(5);
    setReviewText('');
    setReviewModalOpen(true);
  };

  const handleProductReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/products/${selectedItemToReview.product_details.id}/reviews/`, {
        order_item: selectedItemToReview.id,
        rating: reviewRating,
        review_text: reviewText
      });
      toast.success("Review submitted successfully!");
      setReviewedItemIds(prev => new Set(prev).add(selectedItemToReview.id));
      setReviewModalOpen(false);
    } catch (error) {
      // Extract backend validation error message gracefully
      const errorMsg = error.response?.data?.[0] || error.response?.data?.non_field_errors?.[0] || "Failed to submit review or already reviewed.";
      toast.error(errorMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePlatformReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingPlatform(true);
    try {
      await api.post('/platform-reviews/', {
        rating: platformRating,
        feedback_text: platformFeedback
      });
      toast.success("Thank you for your feedback!");
      setPlatformReviewModalOpen(false);
    } catch (error) {
      toast.error("Failed to submit feedback.");
    } finally {
      setSubmittingPlatform(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans relative">
      
      {/* Header with Platform Review Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-200 pb-4 gap-4">
        <h1 className="animate-fade-in text-3xl font-bold text-[#2C1E16]">
          My Orders
        </h1>
        <button
          onClick={() => {
            setPlatformRating(5);
            setPlatformFeedback('');
            setPlatformReviewModalOpen(true);
          }}
          className="animate-fade-in flex items-center gap-2 bg-[#FAF8F5] text-[#5A3825] border border-[#A87C51]/30 hover:border-[#5A3825] px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Rate Platform
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => <SkeletonOrderCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-[#FAF8F5] rounded-xl border border-dashed border-gray-300 animate-fade-in">
          <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6 stagger-children">
          {orders.map(order => (
            <div key={order.id} className="order-card animate-fade-in-up border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4 bg-[#FAF8F5] -mx-6 -mt-6 px-6 pt-6 rounded-t-xl">
                <div>
                  <p className="text-sm text-gray-500 font-bold tracking-widest">ORDER #{order.id}</p>
                  <p className="font-bold text-[#2C1E16] mt-1 text-sm">
                    Payment: <span className="uppercase text-green-600 bg-green-100 px-2 py-0.5 rounded ml-1">{order.payment_status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-bold">Total</p>
                  <p className="font-bold text-xl text-[#5A3825]">
                    ₹{parseFloat(order.total_price).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="order-item-row flex items-center justify-between gap-4 px-4 py-3 border border-gray-100 rounded-lg bg-white">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product_details?.image}
                        className="w-16 h-16 object-cover bg-[#FAF8F5] rounded-md border border-gray-100 shrink-0"
                        alt=""
                      />
                      <div>
                        <p className="font-bold text-[#2C1E16]">{item.product_details?.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} | Vendor: {item.vendor_shop}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full ${
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        item.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.status}
                      </span>
                      
                      {/* Product Review Button Condition */}
                      {item.status === 'delivered' && !reviewedItemIds.has(item.id) && (
                        <button
                          onClick={() => openProductReviewModal(item)}
                          className="text-[11px] font-bold text-[#A87C51] hover:text-[#5A3825] underline underline-offset-2 transition-colors"
                        >
                          Leave a Review
                        </button>
                      )}
                      {reviewedItemIds.has(item.id) && (
                        <span className="text-[11px] font-bold text-gray-400">Reviewed ✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Product Review Modal --- */}
      {reviewModalOpen && selectedItemToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E16]/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#2C1E16]">Rate Product</h2>
              <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleProductReviewSubmit} className="p-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <img src={selectedItemToReview.product_details?.image} className="w-12 h-12 object-cover rounded-md border border-gray-200 bg-white" alt="" />
                <div>
                  <p className="font-bold text-sm text-[#2C1E16]">{selectedItemToReview.product_details?.name}</p>
                  <p className="text-xs text-gray-500">Sold by {selectedItemToReview.vendor_shop}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Your Rating</p>
                <StarRatingInput rating={reviewRating} setRating={setReviewRating} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Write a Review (Optional)</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How was the quality? Did it meet your expectations?"
                  rows="3"
                  className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary w-full bg-[#5A3825] text-white py-3.5 rounded-full font-bold uppercase tracking-widest hover:bg-[#3E2723] disabled:bg-gray-400 shadow-md"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- Platform Review Modal --- */}
      {platformReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E16]/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF8F5] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#2C1E16]">Rate Gujju Ni Dukan</h2>
              <button onClick={() => setPlatformReviewModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handlePlatformReviewSubmit} className="p-6">
              <div className="flex flex-col items-center mb-6 pt-2">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Overall Experience</p>
                <StarRatingInput rating={platformRating} setRating={setPlatformRating} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Your Feedback <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={platformFeedback}
                  onChange={(e) => setPlatformFeedback(e.target.value)}
                  placeholder="What did you love? How can we improve?"
                  rows="4"
                  className="input-animated w-full p-3 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPlatform}
                className="btn-primary w-full bg-[#5A3825] text-white py-3.5 rounded-full font-bold uppercase tracking-widest hover:bg-[#3E2723] disabled:bg-gray-400 shadow-md"
              >
                {submittingPlatform ? 'Submitting...' : 'Send Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};