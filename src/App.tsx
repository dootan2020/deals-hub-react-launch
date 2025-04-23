
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

const App = () => {
  return (
    // Removed any extraneous props that could be causing issues
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
