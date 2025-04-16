
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Import pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";

// Lazy-loaded pages for better performance
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ProductsAdmin = lazy(() => import("./pages/admin/ProductsAdmin"));
const OrdersAdmin = lazy(() => import("./pages/admin/OrdersAdmin"));
const ApiConfigAdmin = lazy(() => import("./pages/admin/ApiConfigAdmin"));
const SyncLogsAdmin = lazy(() => import("./pages/admin/SyncLogsAdmin"));

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
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<ProductsAdmin />} />
            <Route path="/admin/orders" element={<OrdersAdmin />} />
            <Route path="/admin/api-config" element={<ApiConfigAdmin />} />
            <Route path="/admin/sync-logs" element={<SyncLogsAdmin />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
