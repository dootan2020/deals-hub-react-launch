
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "sonner";

// Import pages
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import Register from './pages/register'; // Import the default export from register.tsx
import DashboardPage from './pages/DashboardPage';
import DepositPage from './pages/DepositPage';
import NotFound from './pages/NotFound';
import PayPalDepositPage from './pages/PayPalDepositPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import TestSecurityPage from './pages/TestSecurityPage';

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
