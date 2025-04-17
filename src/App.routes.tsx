
import { createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ProductsPage from "@/pages/ProductsPage";
import ProductPage from "@/pages/ProductPage";
import CategoryPage from "@/pages/CategoryPage";
import SubcategoryPage from "@/pages/SubcategoryPage";
import CartPage from "@/pages/CartPage";
import FaqsPage from "@/pages/FaqsPage";
import SupportPage from "@/pages/SupportPage";
import KnowledgeBasePage from "@/pages/KnowledgeBasePage";
import DepositPage from "@/pages/DepositPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import EnhancedCategoryPage from "@/pages/EnhancedCategoryPage";
import EnhancedProductsPage from "@/pages/EnhancedProductsPage";

// Admin routes
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CategoryAdmin from "@/pages/admin/CategoryAdmin";
import ProductsAdmin from "@/pages/admin/ProductsAdmin";
import ProductManagerPage from "@/pages/admin/ProductManagerPage";
import ProductCreatePage from "@/pages/admin/ProductCreatePage";
import ProductEditPage from "@/pages/admin/ProductEditPage";
import OrdersAdmin from "@/pages/admin/OrdersAdmin";
import ApiConfigAdmin from "@/pages/admin/ApiConfigAdmin";
import ApiTesterPage from "@/pages/admin/ApiTesterPage";
import SyncLogsAdmin from "@/pages/admin/SyncLogsAdmin";
import ProductFormWithTester from "@/pages/admin/ProductFormWithTester";
import CheckoutPage from "@/pages/CheckoutPage";
import ProxySettingsPage from "@/pages/admin/ProxySettingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: "/products",
    element: <ProductsPage />,
  },
  {
    path: "/products/:slug",
    element: <ProductPage />,
  },
  {
    path: "/category/:slug",
    element: <CategoryPage />,
  },
  {
    path: "/category/:categorySlug/:subcategorySlug",
    element: <SubcategoryPage />,
  },
  {
    path: "/cart",
    element: <CartPage />,
  },
  {
    path: "/checkout/:slug",
    element: <CheckoutPage />,
  },
  {
    path: "/faqs",
    element: <FaqsPage />,
  },
  {
    path: "/support",
    element: <SupportPage />,
  },
  {
    path: "/knowledge-base",
    element: <KnowledgeBasePage />,
  },
  {
    path: "/deposit",
    element: <DepositPage />,
  },
  {
    path: "/order-success",
    element: <OrderSuccessPage />,
  },
  {
    path: "/enhanced-category/:slug",
    element: <EnhancedCategoryPage />,
  },
  {
    path: "/enhanced-products",
    element: <EnhancedProductsPage />,
  },
  // Admin routes
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/categories",
    element: <CategoryAdmin />,
  },
  {
    path: "/admin/products",
    element: <ProductsAdmin />,
  },
  {
    path: "/admin/product-manager",
    element: <ProductManagerPage />,
  },
  {
    path: "/admin/products/create",
    element: <ProductCreatePage />,
  },
  {
    path: "/admin/products/edit/:id",
    element: <ProductEditPage />,
  },
  {
    path: "/admin/orders",
    element: <OrdersAdmin />,
  },
  {
    path: "/admin/api-config",
    element: <ApiConfigAdmin />,
  },
  {
    path: "/admin/api-tester",
    element: <ApiTesterPage />,
  },
  {
    path: "/admin/sync-logs",
    element: <SyncLogsAdmin />,
  },
  {
    path: "/admin/product-form-tester",
    element: <ProductFormWithTester />,
  },
  {
    path: "/admin/proxy-settings",
    element: <ProxySettingsPage />,
  },
]);

export default router;
