import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'vendor') return <Navigate to="/vendor" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
};