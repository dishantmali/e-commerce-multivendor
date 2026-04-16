import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Formatting Utilities for Indian Numbering System
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatNum = (num) => {
  return new Intl.NumberFormat('en-IN').format(num)
}

// Dummy Data for Admin
const MOCK_STATS = {
  volume: 2540000,
  revenue: 127000,
  totalVendors: 42,
  totalBuyers: 1285,
  totalOrders: 1240
}

const MOCK_VENDORS = [
  { id: 1, shop: "Wellness Collective", email: "hello@wellness.co", products: 12, status: "Active" },
  { id: 2, shop: "Aura Essentials", email: "contact@aura.com", products: 8, status: "Active" },
  { id: 3, shop: "Minimalist Studio", email: "info@minimalist.net", products: 24, status: "Review" }
]

const MOCK_BUYERS = [
  { id: "C-001", name: "Eleanor Vance", email: "eleanor.v@example.com", totalOrders: 12, joined: "Oct 2025" },
  { id: "C-002", name: "Marcus Thorne", email: "m.thorne@example.com", totalOrders: 3, joined: "Jan 2026" },
  { id: "C-003", name: "Sophia Lin", email: "slin.design@example.com", totalOrders: 7, joined: "Feb 2026" },
  { id: "C-004", name: "Julian Hayes", email: "j.hayes@example.com", totalOrders: 1, joined: "Mar 2026" }
]

const MOCK_ORDERS = [
  { id: "ORD-099", product: "Unbothered Elixir", vendor: "Wellness Collective", amount: 4500, status: "shipped" },
  { id: "ORD-098", product: "Ceramic Plate", vendor: "Minimalist Studio", amount: 2400, status: "pending" },
  { id: "ORD-097", product: "Radiance Oil", vendor: "Aura Essentials", amount: 3200, status: "delivered" }
]

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans pt-24 pb-20 selection:bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
            <p className="text-sm font-medium text-gray-500 mt-2">Manage your marketplace network, consumers, and financials.</p>
          </div>
          <button onClick={() => navigate('/')} className="text-[12px] font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Exit to Storefront
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Admin Sidebar */}
          <div className="lg:w-60 flex-shrink-0">
            <nav className="flex lg:flex-col gap-2 sticky top-32 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
              {[
                { id: 'overview', name: 'The Ledger', icon: '📊' },
                { id: 'vendors', name: 'Network', icon: '🏪' },
                { id: 'buyers', name: 'Consumers', icon: '👥' },
                { id: 'orders', name: 'Global Queue', icon: '🧾' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm flex-shrink-0
                    ${activeTab === item.id 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-2">
                
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col justify-center">
                    <p className="text-[12px] uppercase tracking-wider font-bold text-gray-500 mb-2">Total Volume</p>
                    <p className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 flex items-baseline gap-1">
                      {formatINR(MOCK_STATS.volume).replace('₹', '')}
                      <span className="text-2xl text-gray-400 font-semibold">INR</span>
                    </p>
                  </div>
                  
                  <div className="p-8 bg-gray-900 text-white border border-gray-800 rounded-2xl shadow-md flex flex-col justify-center">
                    <p className="text-[12px] uppercase tracking-wider font-bold text-gray-400 mb-2">Platform Revenue (5%)</p>
                    <p className="text-4xl md:text-5xl font-bold tracking-tight flex items-baseline gap-1">
                      {formatINR(MOCK_STATS.revenue).replace('₹', '')}
                      <span className="text-2xl text-gray-500 font-semibold">INR</span>
                    </p>
                  </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                     <p className="text-[12px] uppercase tracking-wider font-bold text-gray-500 mb-2">Active Vendors</p>
                     <p className="text-3xl font-bold tracking-tight text-gray-900">{formatNum(MOCK_STATS.totalVendors)}</p>
                   </div>
                   <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                     <p className="text-[12px] uppercase tracking-wider font-bold text-gray-500 mb-2">Total Consumers</p>
                     <p className="text-3xl font-bold tracking-tight text-gray-900">{formatNum(MOCK_STATS.totalBuyers)}</p>
                   </div>
                   <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                     <p className="text-[12px] uppercase tracking-wider font-bold text-gray-500 mb-2">Total Orders</p>
                     <p className="text-3xl font-bold tracking-tight text-gray-900">{formatNum(MOCK_STATS.totalOrders)}</p>
                   </div>
                </div>
              </div>
            )}

            {/* VENDORS TAB */}
            {activeTab === 'vendors' && (
              <div className="animate-in fade-in duration-500 slide-in-from-bottom-2 bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900">Vendor Directory</h2>
                </div>
                <div className="overflow-x-auto p-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100">
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap">Studio / Shop</th>
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap">Contact</th>
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap">Catalog Size</th>
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {MOCK_VENDORS.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-4 font-semibold text-sm text-gray-900">{vendor.shop}</td>
                          <td className="py-4 px-4 text-sm text-gray-500 font-medium">{vendor.email}</td>
                          <td className="py-4 px-4 text-sm font-semibold text-gray-700">{formatNum(vendor.products)} items</td>
                          <td className="py-4 px-4 text-right">
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-md ${vendor.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {vendor.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BUYERS TAB */}
            {activeTab === 'buyers' && (
              <div className="animate-in fade-in duration-500 slide-in-from-bottom-2 bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900">Consumer Database</h2>
                </div>
                <div className="overflow-x-auto p-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100">
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap">Consumer</th>
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap">Contact</th>
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap">Engagement</th>
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {MOCK_BUYERS.map((buyer) => (
                        <tr key={buyer.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-4 font-semibold text-sm text-gray-900">{buyer.name}</td>
                          <td className="py-4 px-4 text-sm text-gray-500 font-medium">{buyer.email}</td>
                          <td className="py-4 px-4 text-sm font-semibold text-gray-700">{formatNum(buyer.totalOrders)} Orders</td>
                          <td className="py-4 px-4 text-right text-sm font-medium text-gray-400">{buyer.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in duration-500 slide-in-from-bottom-2 bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                 <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900">Global Order Queue</h2>
                </div>
                 <div className="overflow-x-auto p-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100">
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap">Order ID</th>
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap">Item & Vendor</th>
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap">Value</th>
                        <th className="pb-4 pt-2 px-4 whitespace-nowrap text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {MOCK_ORDERS.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-4 text-[12px] font-bold text-gray-500">{order.id}</td>
                          <td className="py-4 px-4">
                             <p className="font-semibold text-sm text-gray-900">{order.product}</p>
                             <p className="text-[11px] font-medium text-gray-500 mt-0.5">{order.vendor}</p>
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-gray-800">{formatINR(order.amount)}</td>
                          <td className="py-4 px-4 text-right">
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-md ${order.status === 'shipped' ? 'bg-gray-900 text-white' : order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}