
import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import DepositPage from "@/pages/DepositPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/routing/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/products",
    element: <ProductsPage />,
  },
  {
    path: "/product/:id",
    element: <ProductDetailPage />,
  },
  {
    path: "/product/:id/:slug",
    element: <ProductDetailPage />,
  },
  {
    path: "/deposit",
    element: (
      <ProtectedRoute>
        <DepositPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
