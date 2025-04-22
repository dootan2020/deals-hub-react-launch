import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CategoryAdmin from "@/pages/admin/CategoryAdmin";
import OrdersAdmin from "@/pages/admin/OrdersAdmin";
import TransactionsAdmin from "@/pages/admin/TransactionsAdmin";
import ApiConfigAdmin from "@/pages/admin/ApiConfigAdmin";
import SyncLogsAdmin from "@/pages/admin/SyncLogsAdmin";
import ApiTesterPage from "@/pages/admin/ApiTesterPage";
import ProductManagerPage from "@/pages/admin/ProductManagerPage";
import ProductCreatePage from "@/pages/admin/ProductCreatePage";
import ProductEditPage from "@/pages/admin/ProductEditPage";
import ProductFormWithTester from "@/pages/admin/ProductFormWithTester";
import ProxySettingsPage from "@/pages/admin/ProxySettingsPage";
import UsersManagementPage from "@/pages/admin/UsersManagementPage";
import SiteSettingsPage from "@/pages/admin/SiteSettingsPage";

export const adminRoutes = [
  <Route key="admin" path="/admin" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } />,
  <Route key="admin-categories" path="/admin/categories" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <CategoryAdmin />
    </ProtectedRoute>
  } />,
  <Route key="admin-orders" path="/admin/orders" element={
    <ProtectedRoute requiredRoles={['admin', 'staff']}>
      <OrdersAdmin />
    </ProtectedRoute>
  } />,
  <Route key="admin-transactions" path="/admin/transactions" element={
    <ProtectedRoute requiredRoles={['admin', 'staff']}>
      <TransactionsAdmin />
    </ProtectedRoute>
  } />,
  <Route key="admin-api-config" path="/admin/api-config" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <ApiConfigAdmin />
    </ProtectedRoute>
  } />,
  <Route key="admin-sync-logs" path="/admin/sync-logs" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <SyncLogsAdmin />
    </ProtectedRoute>
  } />,
  <Route key="admin-api-tester" path="/admin/api-tester" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <ApiTesterPage />
    </ProtectedRoute>
  } />,
  <Route key="admin-product-manager" path="/admin/product-manager" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <ProductManagerPage />
    </ProtectedRoute>
  } />,
  <Route key="admin-products-create" path="/admin/products/create" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <ProductCreatePage />
    </ProtectedRoute>
  } />,
  <Route key="admin-products-edit" path="/admin/products/edit/:id" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <ProductEditPage />
    </ProtectedRoute>
  } />,
  <Route key="admin-product-form-tester" path="/admin/product-form-tester" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <ProductFormWithTester />
    </ProtectedRoute>
  } />,
  <Route key="admin-proxy-settings" path="/admin/proxy-settings" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <ProxySettingsPage />
    </ProtectedRoute>
  } />,
  <Route key="admin-users" path="/admin/users" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <UsersManagementPage />
    </ProtectedRoute>
  } />,
  <Route key="admin-site-settings" path="/admin/site-settings" element={
    <ProtectedRoute requiredRoles={['admin']}>
      <SiteSettingsPage />
    </ProtectedRoute>
  } />
];
