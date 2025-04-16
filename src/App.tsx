
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Import pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import CategoryAdmin from "./pages/admin/CategoryAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";

// Lazy-loaded pages for better performance
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));

// Admin pages - Non-lazy loaded to avoid 404 errors
const ApiConfigAdmin = lazy(() => import("./pages/admin/ApiConfigAdmin"));
const SyncLogsAdmin = lazy(() => import("./pages/admin/SyncLogsAdmin"));
const ProductCreatePage = lazy(() => import("./pages/admin/ProductCreatePage"));
const ProductEditPage = lazy(() => import("./pages/admin/ProductEditPage"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <p className="text-lg">Loading...</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/product/:productSlug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            
            {/* Admin routes - No lazy loading for main admin pages */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<ProductsAdmin />} />
            <Route path="/admin/categories" element={<CategoryAdmin />} />
            <Route path="/admin/orders" element={<OrdersAdmin />} />
            
            {/* These admin pages can still be lazy loaded */}
            <Route path="/admin/api-config" element={<ApiConfigAdmin />} />
            <Route path="/admin/sync-logs" element={<SyncLogsAdmin />} />
            <Route path="/admin/products/new" element={<ProductCreatePage />} />
            <Route path="/admin/products/edit/:id" element={<ProductEditPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
