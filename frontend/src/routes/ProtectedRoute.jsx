import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export function RoleRoute({ role }) {
  const { admin } = useAuth();
  if (!admin || admin.role !== role) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}
