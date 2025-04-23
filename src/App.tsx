
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "sonner";

// Import pages
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DepositPage from './pages/DepositPage';
import NotFound from './pages/NotFound';
import PayPalDepositPage from './pages/PayPalDepositPage';

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
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/deposit/paypal" element={<PayPalDepositPage />} />
        
        {/* Admin Routes */}
        {adminRoutes}
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
