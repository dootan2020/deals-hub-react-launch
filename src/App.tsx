import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CategoriesProvider } from "@/context/CategoriesContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import SupportPage from "./pages/SupportPage";
import FaqsPage from "./pages/FaqsPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import DepositPage from "./pages/DepositPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CategoryAdmin from "./pages/admin/CategoryAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import ApiConfigAdmin from "./pages/admin/ApiConfigAdmin";
import SyncLogsAdmin from "./pages/admin/SyncLogsAdmin";
import ApiTesterPage from './pages/admin/ApiTesterPage';
import ProductManagerPage from './pages/admin/ProductManagerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <CategoriesProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* SEO-friendly category routes */}
              <Route path="/category/:categorySlug" element={<CategoryPage />} />
              <Route path="/category/:parentCategorySlug/:categorySlug" element={<CategoryPage />} />
              <Route path="/product/:productSlug" element={<ProductPage />} />
              <Route path="/:parentCategorySlug/:categorySlug/:productSlug" element={<ProductPage />} />
              <Route path="/products" element={<CategoryPage />} />
              
              {/* Static pages with SEO-friendly URLs */}
              <Route path="/page/support" element={<SupportPage />} />
              <Route path="/support" element={<SupportPage />} />
              
              <Route path="/page/faqs" element={<FaqsPage />} />
              <Route path="/faqs" element={<FaqsPage />} />
              
              <Route path="/page/knowledge" element={<KnowledgeBasePage />} />
              <Route path="/knowledge" element={<KnowledgeBasePage />} />
              
              <Route path="/page/deposit" element={<DepositPage />} />
              <Route path="/deposit" element={<DepositPage />} />
              
              <Route path="/order-success" element={<OrderSuccessPage />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<CategoryAdmin />} />
              <Route path="/admin/orders" element={<OrdersAdmin />} />
              <Route path="/admin/api-config" element={<ApiConfigAdmin />} />
              <Route path="/admin/sync-logs" element={<SyncLogsAdmin />} />
              <Route path="/admin/api-tester" element={<ApiTesterPage />} />
              <Route path="/admin/product-manager" element={<ProductManagerPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CategoriesProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
