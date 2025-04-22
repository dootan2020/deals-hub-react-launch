
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import DashboardPage from "@/pages/user/DashboardPage";
import MyAccountPage from "@/pages/user/MyAccountPage";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import ProductsPage from "@/pages/ProductsPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import SupportPage from "@/pages/SupportPage";
import FaqsPage from "@/pages/FaqsPage";
import KnowledgeBasePage from "@/pages/KnowledgeBasePage";
import DepositPage from "@/pages/DepositPage";
import PayPalDepositPage from "@/pages/PayPalDepositPage";
import DepositHistoryPage from "@/pages/DepositHistoryPage";
import NotFound from "@/pages/NotFound";

export const userRoutes = [
  // Public routes
  <Route key="index" path="/" element={<Index />} />,
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route key="register" path="/register" element={<RegisterPage />} />,
  <Route key="unauthorized" path="/unauthorized" element={<UnauthorizedPage />} />,
  <Route key="verify-email" path="/verify-email" element={<VerifyEmailPage />} />,
  <Route key="forgot-password" path="/forgot-password" element={<ForgotPasswordPage />} />,
  <Route key="reset-password" path="/reset-password" element={<ResetPasswordPage />} />,
  
  // Protected User Routes
  <Route key="dashboard" path="/dashboard" element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } />,
  
  <Route key="account" path="/account" element={
    <ProtectedRoute>
      <MyAccountPage />
    </ProtectedRoute>
  } />,
  
  <Route key="deposit-history" path="/deposit-history" element={
    <ProtectedRoute>
      <DepositHistoryPage />
    </ProtectedRoute>
  } />,
  
  // Category and Product Routes
  <Route key="category" path="/category/:categorySlug" element={<CategoryPage />} />,
  <Route key="subcategory" path="/category/:parentCategorySlug/:categorySlug" element={<CategoryPage />} />,
  <Route key="product" path="/product/:productSlug" element={<ProductPage />} />,
  <Route key="product-with-category" path="/:parentCategorySlug/:categorySlug/:productSlug" element={<ProductPage />} />,
  <Route key="products" path="/products" element={<ProductsPage />} />,
  
  // Static Pages
  <Route key="support" path="/page/support" element={<SupportPage />} />,
  <Route key="support-alt" path="/support" element={<SupportPage />} />,
  <Route key="faqs" path="/page/faqs" element={<FaqsPage />} />,
  <Route key="faqs-alt" path="/faqs" element={<FaqsPage />} />,
  <Route key="knowledge" path="/page/knowledge" element={<KnowledgeBasePage />} />,
  <Route key="knowledge-alt" path="/knowledge" element={<KnowledgeBasePage />} />,
  
  // Deposit Routes
  <Route key="deposit" path="/page/deposit" element={
    <ProtectedRoute>
      <DepositPage />
    </ProtectedRoute>
  } />,
  <Route key="deposit-alt" path="/deposit" element={
    <ProtectedRoute>
      <DepositPage />
    </ProtectedRoute>
  } />,
  <Route key="top-up" path="/top-up" element={
    <ProtectedRoute>
      <DepositPage />
    </ProtectedRoute>
  } />,
  <Route key="deposit-binance" path="/deposit/binance" element={
    <ProtectedRoute>
      <DepositPage method="binance" />
    </ProtectedRoute>
  } />,
  <Route key="deposit-usdt" path="/deposit/usdt" element={
    <ProtectedRoute>
      <DepositPage method="usdt" />
    </ProtectedRoute>
  } />,
  <Route key="deposit-paypal" path="/deposit/paypal" element={
    <ProtectedRoute>
      <PayPalDepositPage />
    </ProtectedRoute>
  } />,
  
  <Route key="order-success" path="/order-success" element={
    <ProtectedRoute>
      <OrderSuccessPage />
    </ProtectedRoute>
  } />,
  
  <Route key="not-found" path="*" element={<NotFound />} />
];

