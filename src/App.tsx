
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "sonner";
import { supabase, getSupabaseUrl } from '@/integrations/supabase/client';

// Import pages
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import Register from './pages/register'; // Correct import for Register
import DashboardPage from './pages/DashboardPage';
import DepositPage from './pages/DepositPage';
import NotFound from './pages/NotFound';
import PayPalDepositPage from './pages/PayPalDepositPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import TestSecurityPage from './pages/TestSecurityPage';
import VerifiedPage from './pages/auth/VerifiedPage'; // Import trang xác thực thành công

// Import standard content pages
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import WarrantyPage from './pages/WarrantyPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import FaqsPage from './pages/FaqsPage';
import ContactPage from './pages/ContactPage';

// Import admin routes
import { adminRoutes } from './routes/adminRoutes';

const App = () => {
  console.log('============ APP INIT DEBUG INFO ============');
  console.log('Current path:', window.location.pathname);
  console.log('Current hostname:', window.location.hostname);
  console.log('Current origin:', window.location.origin);
  console.log('Full URL:', window.location.href);
  console.log('Supabase client URL:', getSupabaseUrl());
  console.log('Supabase auth session storage type:', localStorage ? 'localStorage' : 'undefined');
  console.log('=======================================');

  // Log auth state changes for debugging
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/deposit/paypal" element={<PayPalDepositPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/test-security" element={<TestSecurityPage />} />
        
        {/* Auth verification routes - cả hai không và có dấu gạch chéo leading để tương thích */}
        <Route path="/auth/verify" element={<LoginPage />} />
        <Route path="auth/verify" element={<LoginPage />} />
        <Route path="/auth/verified" element={<VerifiedPage />} />
        <Route path="auth/verified" element={<VerifiedPage />} />
        
        {/* Standard content pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/warranty" element={<WarrantyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/faq" element={<FaqsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Admin Routes */}
        {adminRoutes}
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
