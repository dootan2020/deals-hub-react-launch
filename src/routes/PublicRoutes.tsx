
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
    // Return an array of Route elements instead of a fragment
    [
      /* Public routes */
      <Route key="/" path="/" element={<Index />} />,
      <Route key="/login" path="/login" element={<LoginPage />} />,
      <Route key="/register" path="/register" element={<RegisterPage />} />,
      <Route key="/unauthorized" path="/unauthorized" element={<UnauthorizedPage />} />,
      <Route key="/verify-email" path="/verify-email" element={<VerifyEmailPage />} />,
      <Route key="/forgot-password" path="/forgot-password" element={<ForgotPasswordPage />} />,
      <Route key="/reset-password" path="/reset-password" element={<ResetPasswordPage />} />,
      
      /* SEO-friendly category routes */
      <Route key="/category/:categorySlug" path="/category/:categorySlug" element={<CategoryPage />} />,
      <Route key="/category/:parentCategorySlug/:categorySlug" path="/category/:parentCategorySlug/:categorySlug" element={<CategoryPage />} />,
      <Route key="/product/:productSlug" path="/product/:productSlug" element={<ProductPage />} />,
      <Route key="/:parentCategorySlug/:categorySlug/:productSlug" path="/:parentCategorySlug/:categorySlug/:productSlug" element={<ProductPage />} />,
      <Route key="/products" path="/products" element={<ProductsPage />} />,
      
      /* Static pages with SEO-friendly URLs */
      <Route key="/page/support" path="/page/support" element={<SupportPage />} />,
      <Route key="/support" path="/support" element={<SupportPage />} />,
      
      <Route key="/page/faqs" path="/page/faqs" element={<FaqsPage />} />,
      <Route key="/faqs" path="/faqs" element={<FaqsPage />} />,
      
      <Route key="/page/knowledge" path="/page/knowledge" element={<KnowledgeBasePage />} />,
      <Route key="/knowledge" path="/knowledge" element={<KnowledgeBasePage />} />
    ]
  );
};

export default PublicRoutes;
