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
  // --- Layout State ---
  const [activeTab, setActiveTab] = useState('overview'); // default to orders
  const [wishlistItems, setWishlistItems] = useState([]);

  // --- Orders State ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Profile & Address State ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '' });
  const [addresses, setAddresses] = useState([]);
  
  // Password State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // OTP Modal State
  const [otpModal, setOtpModal] = useState({ isOpen: false, type: '', step: 1, newValue: '', otp: '', loading: false });

  // Address Modal State
  const [addressModal, setAddressModal] = useState({ isOpen: false, isEditing: false, id: null, street: '', city: '', state: '', pincode: '', is_default: false });
  // --- Review States ---
  const [reviewedItemIds, setReviewedItemIds] = useState(new Set());
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItemToReview, setSelectedItemToReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [platformReviewModalOpen, setPlatformReviewModalOpen] = useState(false);
  const [platformRating, setPlatformRating] = useState(5);
  const [platformFeedback, setPlatformFeedback] = useState('');
  const [submittingPlatform, setSubmittingPlatform] = useState(false);

  useEffect(() => {
    // Fetch Orders
    api.get('/orders/')
      .then(res => setOrders(res.data.results !== undefined ? res.data.results : res.data))
      .catch(err => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));

    api.get('/wishlist/')
      .then(res => setWishlistItems(res.data.results || res.data))
      .catch(err => console.error("Failed to fetch wishlist:", err));
      
    // Fetch Profile & Addresses
    fetchProfileData();
  }, []);

  const fetchProfileData = () => {
    api.get('/profile/').then(res => {
      setProfileData({ name: res.data.name, email: res.data.email, phone: res.data.profile?.phone || '' });
      setAddresses(res.data.addresses || []);
    }).catch(err => console.error("Failed to fetch profile:", err));
  };

  // --- OTP Handlers for Email/Phone ---
  const requestOtp = async (e) => {
    e.preventDefault();
    setOtpModal(prev => ({ ...prev, loading: true }));
    try {
      await api.post('/request-contact-otp/', { type: otpModal.type, new_value: otpModal.newValue });
      setOtpModal(prev => ({ ...prev, step: 2, loading: false }));
      toast.success(`OTP sent to your new ${otpModal.type}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send OTP");
      setOtpModal(prev => ({ ...prev, loading: false }));
    }
  };

  const verifyOtpAndUpdate = async (e) => {
    e.preventDefault();
    setOtpModal(prev => ({ ...prev, loading: true }));
    try {
      await api.post('/verify-contact-otp/', { type: otpModal.type, new_value: otpModal.newValue, otp: otpModal.otp });
      toast.success(`${otpModal.type} updated successfully!`);
      setOtpModal({ isOpen: false, type: '', step: 1, newValue: '', otp: '', loading: false });
      fetchProfileData(); // Refresh data
    } catch (error) {
      toast.error("Invalid OTP");
      setOtpModal(prev => ({ ...prev, loading: false }));
    }
  };

  // --- Password Handler ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("New passwords do not match!");
    setUpdatingPassword(true);
    try {
      await api.post('/change-password/', { current_password: passwords.current, new_password: passwords.new });
      toast.success("Password updated successfully!");
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // --- Address Handlers ---
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addressModal.isEditing) {
        await api.put(`/addresses/${addressModal.id}/`, addressModal);
        toast.success("Address updated!");
      } else {
        await api.post('/addresses/', addressModal);
        toast.success("Address added!");
      }
      setAddressModal({ isOpen: false });
      fetchProfileData();
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  const deleteAddress = async (id) => {
    if(!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/addresses/${id}/`);
      toast.success("Address removed");
      fetchProfileData();
    } catch (err) { toast.error("Failed to delete"); }
  };

  // --- Handlers for Reviews ---
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

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { id: 'orders', label: 'My Orders', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { id: 'wishlist', label: 'My Wishlist', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
    { id: 'settings', label: 'Account Settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 font-sans relative">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-[#2C1E16] mb-4 px-4">My Account</h2>
            <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 hide-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap md:whitespace-normal
                    ${activeTab === tab.id 
                      ? 'bg-[#FAF8F5] text-[#5A3825] border-l-4 border-[#A87C51]' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#2C1E16] border-l-4 border-transparent'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-3xl font-bold text-[#2C1E16] mb-8 border-b border-gray-200 pb-4">Dashboard Overview</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
                  <div className="bg-[#FAF8F5] p-4 rounded-full text-[#A87C51]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Total Orders</p>
                    <p className="text-2xl font-black text-[#5A3825]">{orders.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#FAF8F5] border border-dashed border-[#A87C51]/30 rounded-xl p-10 text-center mt-6">
                <p className="text-[#5A3825] font-bold">Welcome back, {profileData.name || 'User'}! Keep track of your recent activity here.</p>
              </div>
            </div>
          )}

          {/* TAB: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-200 pb-4 gap-4">
                <h1 className="text-3xl font-bold text-[#2C1E16]">My Orders</h1>
                <button
                  onClick={() => {
                    setPlatformRating(5);
                    setPlatformFeedback('');
                    setPlatformReviewModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-[#FAF8F5] text-[#5A3825] border border-[#A87C51]/30 hover:border-[#5A3825] px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 shadow-sm active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Rate Platform
                </button>
              </div>

              {loading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => <SkeletonOrderCard key={i} />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-[#FAF8F5] rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-6 stagger-children">
                  {orders.map(order => (
                    <div key={order.id} className="order-card border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
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
                          <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 border border-gray-100 rounded-lg bg-white">
                            <div className="flex items-center gap-4">
                              <img src={item.product_details?.image} className="w-16 h-16 object-cover bg-[#FAF8F5] rounded-md border border-gray-100 shrink-0" alt="" />
                              <div>
                                <p className="font-bold text-[#2C1E16]">{item.product_details?.name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity} | Vendor: {item.vendor_shop}</p>
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
                              
                              {item.status === 'delivered' && !reviewedItemIds.has(item.id) && (
                                <button onClick={() => openProductReviewModal(item)} className="text-[11px] font-bold text-[#A87C51] hover:text-[#5A3825] underline underline-offset-2 transition-colors">
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
            </div>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === 'wishlist' && (
             <div className="animate-fade-in">
               <h1 className="text-3xl font-bold text-[#2C1E16] mb-8 border-b border-gray-200 pb-4">My Wishlist</h1>
               
               {wishlistItems.length === 0 ? (
                 <div className="bg-[#FAF8F5] border border-dashed border-[#A87C51]/30 rounded-xl p-16 text-center">
                   <svg className="w-12 h-12 text-[#A87C51] mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                   <p className="text-[#5A3825] font-bold">Your wishlist is empty.</p>
                   <p className="text-sm text-gray-500 mt-2">Start saving items you love!</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                   {wishlistItems.map(item => (
                     <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                       <img src={item.product?.image} alt={item.product?.name} className="w-full h-48 object-cover" />
                       <div className="p-4 flex-1 flex flex-col">
                         <h3 className="font-bold text-[#2C1E16]">{item.product?.name}</h3>
                         <p className="text-[#A87C51] font-black mt-2">₹{item.product?.price}</p>
                         <button className="mt-auto w-full py-2 bg-[#5A3825] text-white rounded-lg font-bold text-sm hover:bg-[#3E2723] transition-colors mt-4">
                           View Product
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in space-y-8">
              <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-[#2C1E16]">Account Settings</h1>
                <p className="text-gray-500 mt-2">Manage your security and address book.</p>
              </div>
              
              {/* --- SECTION 1: Profile Information --- */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                {!isEditingProfile ? (
                  /* READ-ONLY MODE */
                  <div>
                    <div className="flex justify-between items-start mb-10">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#A87C51]">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#2C1E16]">Profile Information</h3>
                          <p className="text-sm text-gray-500">Update your basic profile details</p>
                        </div>
                      </div>
                      <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#A87C51]/30 text-[#5A3825] rounded-lg text-sm font-bold hover:bg-[#FAF8F5] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Edit
                      </button>
                    </div>

                    <div className="space-y-6 max-w-2xl">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">Full Name</span>
                        <span className="col-span-2 text-sm font-medium text-[#2C1E16]">{profileData.name || 'Not provided'}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">Email Address</span>
                        <div className="col-span-2 flex items-center gap-3">
                          <span className="text-sm font-medium text-[#2C1E16] truncate">{profileData.email}</span>
                          {profileData.email && <span className="px-2.5 py-1 bg-[#E6F4EA] text-[#1E8E3E] text-xs font-bold rounded-md whitespace-nowrap">Verified</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">Phone Number</span>
                        <span className="col-span-2 text-sm font-medium text-[#2C1E16]">{profileData.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* EDIT MODE FORM */
                  <div className="animate-fade-in">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-[#2C1E16]">Edit Profile</h3>
                      <p className="text-sm text-gray-500">Update your details below.</p>
                    </div>
                    <div className="space-y-5 max-w-2xl">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                        <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full p-3.5 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51]" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                          <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                            <span className="text-gray-600 font-medium truncate">{profileData.email}</span>
                            <button onClick={() => setOtpModal({ isOpen: true, type: 'email', step: 1, newValue: '', otp: '' })} className="text-sm font-bold text-[#A87C51] hover:text-[#5A3825] ml-2 shrink-0">Change</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                          <div className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                            <span className="text-gray-600 font-medium">{profileData.phone || 'Not set'}</span>
                            <button onClick={() => setOtpModal({ isOpen: true, type: 'phone', step: 1, newValue: '', otp: '' })} className="text-sm font-bold text-[#A87C51] hover:text-[#5A3825]">{profileData.phone ? 'Change' : 'Add'}</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button onClick={() => { setIsEditingProfile(false); fetchProfileData(); }} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                        <button onClick={async () => { await api.put('/profile/', {name: profileData.name}); toast.success("Profile saved"); setIsEditingProfile(false); fetchProfileData(); }} className="px-8 py-3 bg-[#5A3825] text-white font-bold rounded-xl hover:bg-[#3E2723] transition-colors shadow-md">Save Changes</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* --- SECTION 2: Change Password (Matched to user image) --- */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#2C1E16] mb-6">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="flex flex-col md:flex-row gap-4 max-w-full">
                  <input type="password" placeholder="Current Password" required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="flex-1 p-3.5 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51] text-sm" />
                  <input type="password" placeholder="New Password" required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="flex-1 p-3.5 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51] text-sm" />
                  <input type="password" placeholder="Confirm New" required value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="flex-1 p-3.5 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51] text-sm" />
                  <button type="submit" disabled={updatingPassword} className="px-8 py-3.5 bg-[#5A3825] text-white font-bold rounded-xl hover:bg-[#3E2723] disabled:opacity-50 transition-colors whitespace-nowrap">Update</button>
                </form>
              </div>

              {/* --- SECTION 3: Address Book --- */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-[#2C1E16]">Address Book</h3>
                  <button onClick={() => setAddressModal({ isOpen: true, isEditing: false, street: '', city: '', state: '', pincode: '', is_default: false })} className="flex items-center gap-2 text-sm font-bold text-[#A87C51] hover:text-[#5A3825]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg> Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-10 bg-[#FAF8F5] rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No saved addresses yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`p-5 rounded-xl border ${addr.is_default ? 'border-[#A87C51] bg-[#FAF8F5]' : 'border-gray-200 bg-white'}`}>
                        {addr.is_default && <span className="inline-block px-2 py-1 bg-[#A87C51] text-white text-[10px] font-bold uppercase rounded mb-2">Default</span>}
                        <p className="text-[#2C1E16] font-medium leading-relaxed">{addr.street}<br/>{addr.city}, {addr.state} {addr.pincode}</p>
                        <div className="mt-4 flex gap-4 text-sm font-bold">
                          <button onClick={() => setAddressModal({ isOpen: true, isEditing: true, ...addr })} className="text-[#A87C51] hover:text-[#5A3825]">Edit</button>
                          <button onClick={() => deleteAddress(addr.id)} className="text-red-400 hover:text-red-600">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* --- MODALS BELOW --- */}

      {/* OTP Verification Modal */}
      {otpModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E16]/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <h2 className="text-xl font-bold text-[#2C1E16] mb-2">Change {otpModal.type}</h2>
            <p className="text-sm text-gray-500 mb-6">Verify your new {otpModal.type} to secure your account.</p>
            
            {otpModal.step === 1 ? (
              <form onSubmit={requestOtp}>
                <input required type={otpModal.type === 'email' ? 'email' : 'text'} placeholder={`Enter new ${otpModal.type}`} value={otpModal.newValue} onChange={e => setOtpModal({...otpModal, newValue: e.target.value})} className="w-full p-3.5 mb-4 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51]" />
                <button type="submit" disabled={otpModal.loading} className="w-full py-3.5 bg-[#5A3825] text-white font-bold rounded-xl hover:bg-[#3E2723] disabled:opacity-50 transition-colors">Send OTP</button>
              </form>
            ) : (
              <form onSubmit={verifyOtpAndUpdate}>
                <input required type="text" placeholder="Enter 6-digit OTP" value={otpModal.otp} onChange={e => setOtpModal({...otpModal, otp: e.target.value})} className="w-full p-3.5 mb-4 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none text-center tracking-widest text-lg focus:border-[#A87C51]" />
                <button type="submit" disabled={otpModal.loading} className="w-full py-3.5 bg-[#A87C51] text-white font-bold rounded-xl hover:bg-[#5A3825] disabled:opacity-50 transition-colors">Verify & Update</button>
              </form>
            )}
            <button type="button" onClick={() => setOtpModal({ isOpen: false, type: '', step: 1, newValue: '', otp: '', loading: false })} className="mt-4 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      {addressModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1E16]/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6">
            <h2 className="text-xl font-bold text-[#2C1E16] mb-6">{addressModal.isEditing ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <textarea required placeholder="Street Address" value={addressModal.street} onChange={e => setAddressModal({...addressModal, street: e.target.value})} className="w-full p-3.5 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51] resize-none" rows="2" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="City" value={addressModal.city} onChange={e => setAddressModal({...addressModal, city: e.target.value})} className="p-3.5 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51]" />
                <input required type="text" placeholder="State" value={addressModal.state} onChange={e => setAddressModal({...addressModal, state: e.target.value})} className="p-3.5 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51]" />
              </div>
              <input required type="text" placeholder="Pincode" value={addressModal.pincode} onChange={e => setAddressModal({...addressModal, pincode: e.target.value})} className="w-full p-3.5 bg-[#FAF8F5] border border-gray-200 rounded-xl outline-none focus:border-[#A87C51]" />
              
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" checked={addressModal.is_default} onChange={e => setAddressModal({...addressModal, is_default: e.target.checked})} className="w-4 h-4 text-[#A87C51] rounded border-gray-300 focus:ring-[#A87C51]" />
                <span className="text-sm font-medium text-gray-700">Set as default shipping address</span>
              </label>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setAddressModal({ isOpen: false })} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#5A3825] text-white font-bold rounded-xl hover:bg-[#3E2723] transition-colors">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Review Modal */}
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
                className="btn-primary w-full bg-[#5A3825] text-white py-3.5 rounded-full font-bold uppercase tracking-widest hover:bg-[#3E2723] disabled:bg-gray-400 shadow-md transition-colors"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Platform Review Modal */}
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
                className="btn-primary w-full bg-[#5A3825] text-white py-3.5 rounded-full font-bold uppercase tracking-widest hover:bg-[#3E2723] disabled:bg-gray-400 shadow-md transition-colors"
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