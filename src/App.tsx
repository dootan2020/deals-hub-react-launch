
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Import all pages directly to avoid 404 errors
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import CategoryAdmin from "./pages/admin/CategoryAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import ApiConfigAdmin from "./pages/admin/ApiConfigAdmin";
import SyncLogsAdmin from "./pages/admin/SyncLogsAdmin";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import ProductEditPage from "./pages/admin/ProductEditPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/product/:productSlug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ProductsAdmin />} />
          <Route path="/admin/categories" element={<CategoryAdmin />} />
          <Route path="/admin/orders" element={<OrdersAdmin />} />
          <Route path="/admin/api-config" element={<ApiConfigAdmin />} />
          <Route path="/admin/sync-logs" element={<SyncLogsAdmin />} />
          <Route path="/admin/products/new" element={<ProductCreatePage />} />
          <Route path="/admin/products/edit/:id" element={<ProductEditPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
