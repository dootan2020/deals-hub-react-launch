
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CategoryAdmin from "@/pages/admin/CategoryAdmin";
import OrdersAdmin from "@/pages/admin/OrdersAdmin";
import TransactionsAdmin from "@/pages/admin/TransactionsAdmin";
import ApiConfigAdmin from "@/pages/admin/ApiConfigAdmin";
import SyncLogsAdmin from "@/pages/admin/SyncLogsAdmin";
import ApiTesterPage from '@/pages/admin/ApiTesterPage';
import ProductManagerPage from '@/pages/admin/ProductManagerPage';
import ProductCreatePage from '@/pages/admin/ProductCreatePage';
import ProductEditPage from '@/pages/admin/ProductEditPage';
import ProductFormWithTester from '@/pages/admin/ProductFormWithTester';
import ProxySettingsPage from '@/pages/admin/ProxySettingsPage';
import UsersManagementPage from '@/pages/admin/UsersManagementPage';
import SiteSettingsPage from '@/pages/admin/SiteSettingsPage';

const AdminRoutes = () => {
  return (
    <>
      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <CategoryAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute requiredRoles={['admin', 'staff']}>
          <OrdersAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/transactions" element={
        <ProtectedRoute requiredRoles={['admin', 'staff']}>
          <TransactionsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/api-config" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ApiConfigAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/sync-logs" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <SyncLogsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/api-tester" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ApiTesterPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/product-manager" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ProductManagerPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/products/create" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ProductCreatePage />
        </ProtectedRoute>
      } />
      <Route path="/admin/products/edit/:id" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ProductEditPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/product-form-tester" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ProductFormWithTester />
        </ProtectedRoute>
      } />
      <Route path="/admin/proxy-settings" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <ProxySettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <UsersManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/site-settings" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <SiteSettingsPage />
        </ProtectedRoute>
      } />
    </>
  );
};

export default AdminRoutes;
