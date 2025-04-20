
import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import ProductsPage from "./pages/ProductsPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import SupportPage from "./pages/SupportPage";
import FaqsPage from "./pages/FaqsPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import DepositPage from "./pages/DepositPage";
import PayPalDepositPage from "./pages/PayPalDepositPage";
import DepositHistoryPage from "./pages/DepositHistoryPage";
import CheckoutPage from "./pages/CheckoutPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CategoryAdmin from "./pages/admin/CategoryAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import ApiConfigAdmin from "./pages/admin/ApiConfigAdmin";
import SyncLogsAdmin from "./pages/admin/SyncLogsAdmin";
import ApiTesterPage from './pages/admin/ApiTesterPage';
import ProductManagerPage from './pages/admin/ProductManagerPage';
import ProductCreatePage from './pages/admin/ProductCreatePage';
import ProductEditPage from './pages/admin/ProductEditPage';
import ProductFormWithTester from './pages/admin/ProductFormWithTester';
import ProxySettingsPage from './pages/admin/ProxySettingsPage';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import SiteSettingsPage from './pages/admin/SiteSettingsPage';

// User pages
import DashboardPage from "./pages/user/DashboardPage";
import MyAccountPage from "./pages/user/MyAccountPage";

const App = () => {
  return (
    <React.StrictMode>
      <AuthProvider>
        <CategoriesProvider>
          <TooltipProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/verify" element={<VerifyEmailPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/account" element={
                <ProtectedRoute>
                  <MyAccountPage />
                </ProtectedRoute>
              } />
              
              <Route path="/deposit-history" element={
                <ProtectedRoute>
                  <DepositHistoryPage />
                </ProtectedRoute>
              } />
              
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
              
              {/* SEO-friendly category routes */}
              <Route path="/category/:categorySlug" element={<CategoryPage />} />
              <Route path="/category/:parentCategorySlug/:categorySlug" element={<CategoryPage />} />
              <Route path="/product/:productSlug" element={<ProductPage />} />
              <Route path="/:parentCategorySlug/:categorySlug/:productSlug" element={<ProductPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/checkout/:slug" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              
              {/* Static pages with SEO-friendly URLs */}
              <Route path="/page/support" element={<SupportPage />} />
              <Route path="/support" element={<SupportPage />} />
              
              <Route path="/page/faqs" element={<FaqsPage />} />
              <Route path="/faqs" element={<FaqsPage />} />
              
              <Route path="/page/knowledge" element={<KnowledgeBasePage />} />
              <Route path="/knowledge" element={<KnowledgeBasePage />} />
              
              {/* Deposit Routes */}
              <Route path="/page/deposit" element={
                <ProtectedRoute>
                  <DepositPage />
                </ProtectedRoute>
              } />
              <Route path="/deposit" element={
                <ProtectedRoute>
                  <DepositPage />
                </ProtectedRoute>
              } />
              <Route path="/top-up" element={
                <ProtectedRoute>
                  <DepositPage />
                </ProtectedRoute>
              } />
              
              <Route path="/deposit/binance" element={
                <ProtectedRoute>
                  <DepositPage method="binance" />
                </ProtectedRoute>
              } />
              <Route path="/deposit/usdt" element={
                <ProtectedRoute>
                  <DepositPage method="usdt" />
                </ProtectedRoute>
              } />
              <Route path="/deposit/paypal" element={
                <ProtectedRoute>
                  <PayPalDepositPage />
                </ProtectedRoute>
              } />
              
              <Route path="/order-success" element={
                <ProtectedRoute>
                  <OrderSuccessPage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </CategoriesProvider>
      </AuthProvider>
    </React.StrictMode>
  );
};

export default App;
