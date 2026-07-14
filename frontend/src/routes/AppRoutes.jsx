import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { HomePage } from '../pages/HomePage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { UnauthorizedPage } from '../pages/admin/UnauthorizedPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminOrderCreatePage } from '../pages/admin/AdminOrderCreatePage';
import { AdminOrderDetailPage } from '../pages/admin/AdminOrderDetailPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminProductEditPage } from '../pages/admin/AdminProductEditPage';
import { AdminManageAdminsPage } from '../pages/admin/AdminManageAdminsPage';
import { ProtectedRoute, RoleRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/new" element={<AdminOrderCreatePage />} />
            <Route path="/admin/orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/:id" element={<AdminProductEditPage />} />
          <Route element={<RoleRoute role="superadmin" />}>
            <Route path="/admin/manage-admins" element={<AdminManageAdminsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
