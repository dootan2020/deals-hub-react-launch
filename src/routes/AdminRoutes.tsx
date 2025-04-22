
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { withLazy } from '@/utils/lazyUtils';

// Lazy load admin components
const AdminDashboard = withLazy(() => import("@/pages/admin/AdminDashboard"));
const CategoryAdmin = withLazy(() => import("@/pages/admin/CategoryAdmin"));
const OrdersAdmin = withLazy(() => import("@/pages/admin/OrdersAdmin"));
const TransactionsAdmin = withLazy(() => import("@/pages/admin/TransactionsAdmin"));
const ApiConfigAdmin = withLazy(() => import("@/pages/admin/ApiConfigAdmin"));
const SyncLogsAdmin = withLazy(() => import("@/pages/admin/SyncLogsAdmin"));
const ApiTesterPage = withLazy(() => import('@/pages/admin/ApiTesterPage'));
const ProductManagerPage = withLazy(() => import('@/pages/admin/ProductManagerPage'));
const ProductCreatePage = withLazy(() => import('@/pages/admin/ProductCreatePage'));
const ProductEditPage = withLazy(() => import('@/pages/admin/ProductEditPage'));
const ProductFormWithTester = withLazy(() => import('@/pages/admin/ProductFormWithTester'));
const ProxySettingsPage = withLazy(() => import('@/pages/admin/ProxySettingsPage'));
const UsersManagementPage = withLazy(() => import('@/pages/admin/UsersManagementPage'));
const SiteSettingsPage = withLazy(() => import('@/pages/admin/SiteSettingsPage'));

const AdminRoutes = () => {
  return (
    // Return an array of Route elements
    [
      /* Protected Admin Routes */
      <Route key="/admin" path="/admin" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />,
      <Route key="/admin/categories" path="/admin/categories" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <CategoryAdmin />
        </ProtectedRoute>
      } />,
      <Route key="/admin/orders" path="/admin/orders" element={
        <ProtectedRoute requiredRoles={['admin', 'staff']}>
          <OrdersAdmin />
        </ProtectedRoute>
      } />,
      <Route key="/admin/transactions" path="/admin/transactions" element={
        <ProtectedRoute requiredRoles={['admin', 'staff']}>
          <TransactionsAdmin />
        </ProtectedRoute>
      } />,
      <Route key="/admin/api-config" path="/admin/api-config" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ApiConfigAdmin />
        </ProtectedRoute>
      } />,
      <Route key="/admin/sync-logs" path="/admin/sync-logs" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <SyncLogsAdmin />
        </ProtectedRoute>
      } />,
      <Route key="/admin/api-tester" path="/admin/api-tester" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ApiTesterPage />
        </ProtectedRoute>
      } />,
      <Route key="/admin/product-manager" path="/admin/product-manager" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ProductManagerPage />
        </ProtectedRoute>
      } />,
      <Route key="/admin/products/create" path="/admin/products/create" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ProductCreatePage />
        </ProtectedRoute>
      } />,
      <Route key="/admin/products/edit/:id" path="/admin/products/edit/:id" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ProductEditPage />
        </ProtectedRoute>
      } />,
      <Route key="/admin/product-form-tester" path="/admin/product-form-tester" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ProductFormWithTester />
        </ProtectedRoute>
      } />,
      <Route key="/admin/proxy-settings" path="/admin/proxy-settings" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ProxySettingsPage />
        </ProtectedRoute>
      } />,
      <Route key="/admin/users" path="/admin/users" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <UsersManagementPage />
        </ProtectedRoute>
      } />,
      <Route key="/admin/site-settings" path="/admin/site-settings" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <SiteSettingsPage />
        </ProtectedRoute>
      } />
    ]
  );
};

export default AdminRoutes;
