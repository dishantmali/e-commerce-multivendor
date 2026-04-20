/* src/App.jsx */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CategoryPage } from './pages/CategoryPage'
import { CartPage } from './pages/CartPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { BuyerDashboard } from './pages/BuyerDashboard'
import { VendorDashboard } from './pages/VendorDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { WishlistPage } from './pages/WishlistPage';
function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{ duration: 3000, className: 'font-sans font-medium' }}
        />
        <div className="flex flex-col min-h-screen">
          <Navbar />

          {/* Use the ErrorBoundary to wrap the main application content */}
          <main className="flex-1 mt-20">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />

                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

                {/* Protected Routes for Buyers */}
                <Route path="/cart" element={<ProtectedRoute requiredRole="buyer"><CartPage /></ProtectedRoute>} />
                <Route path="/buyer" element={<ProtectedRoute requiredRole="buyer"><BuyerDashboard /></ProtectedRoute>} />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute requiredRole="buyer">
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes for Vendors */}
                <Route path="/vendor" element={<ProtectedRoute requiredRole="vendor"><VendorDashboard /></ProtectedRoute>} />

                {/* Protected Routes for Admins */}
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

                {/* Fallback for undefined routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App