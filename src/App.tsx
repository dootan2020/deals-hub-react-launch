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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
