
import { Route } from 'react-router-dom';
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import Index from "@/pages/Index";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import ProductsPage from "@/pages/ProductsPage";
import SupportPage from "@/pages/SupportPage";
import FaqsPage from "@/pages/FaqsPage";
import KnowledgeBasePage from "@/pages/KnowledgeBasePage";

const PublicRoutes = () => {
  return (
    <>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* SEO-friendly category routes */}
      <Route path="/category/:categorySlug" element={<CategoryPage />} />
      <Route path="/category/:parentCategorySlug/:categorySlug" element={<CategoryPage />} />
      <Route path="/product/:productSlug" element={<ProductPage />} />
      <Route path="/:parentCategorySlug/:categorySlug/:productSlug" element={<ProductPage />} />
      <Route path="/products" element={<ProductsPage />} />
      
      {/* Static pages with SEO-friendly URLs */}
      <Route path="/page/support" element={<SupportPage />} />
      <Route path="/support" element={<SupportPage />} />
      
      <Route path="/page/faqs" element={<FaqsPage />} />
      <Route path="/faqs" element={<FaqsPage />} />
      
      <Route path="/page/knowledge" element={<KnowledgeBasePage />} />
      <Route path="/knowledge" element={<KnowledgeBasePage />} />
    </>
  );
};

export default PublicRoutes;
