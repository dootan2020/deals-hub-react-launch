
import { Route } from "react-router-dom";
import Index from "@/pages/Index";
import ProductPage from "@/pages/ProductPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import DashboardPage from "@/pages/user/DashboardPage";
import MyAccountPage from "@/pages/user/MyAccountPage";
import DepositPage from "@/pages/DepositPage";
import DepositHistoryPage from "@/pages/DepositHistoryPage";
import PayPalDepositPage from "@/pages/PayPalDepositPage";

export const userRoutes = (
  <>
    <Route path="/" element={<Index />} />
    <Route path="/products/:productSlug" element={<ProductPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/auth/verify" element={<VerifyEmailPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/account" element={<MyAccountPage />} />
    <Route path="/deposit" element={<DepositPage />} />
    <Route path="/deposit-history" element={<DepositHistoryPage />} />
    <Route path="/paypal-deposit" element={<PayPalDepositPage />} />
  </>
);
