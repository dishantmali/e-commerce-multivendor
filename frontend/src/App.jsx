import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { HomePage } from './pages/HomePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { BuyerDashboard } from './pages/BuyerDashboard'
import { VendorDashboard } from './pages/VendorDashboard'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ className: 'font-semibold rounded-xl text-dark' }} />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route
                path="/buyer"
                element={
                  <ProtectedRoute requiredRole="buyer">
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor"
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
