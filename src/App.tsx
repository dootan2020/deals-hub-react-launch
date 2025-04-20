
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Index from '@/pages/Index';
import ProductsPage from '@/pages/ProductsPage';
import ProductPage from '@/pages/ProductPage';
import CategoryPage from '@/pages/CategoryPage';
import SubcategoryPage from '@/pages/SubcategoryPage';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SupportPage from '@/pages/SupportPage';
import OrdersPage from './pages/OrdersPage';
import AccountPage from './pages/AccountPage';
import NotFound from '@/pages/NotFound';
import { CategoriesProvider } from '@/context/CategoriesContext';

// Create a single router instance
const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/products',
    element: <ProductsPage />,
  },
  {
    path: '/products/:productSlug',
    element: <ProductPage />,
  },
  {
    path: '/categories/:categorySlug',
    element: <CategoryPage />,
  },
  {
    path: '/categories/:parentCategorySlug/:categorySlug',
    element: <SubcategoryPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/support',
    element: <SupportPage />,
  },
  {
    path: '/orders',
    element: (
      <ProtectedRoute>
        <OrdersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/account',
    element: (
      <ProtectedRoute>
        <AccountPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/404',
    element: <NotFound />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

function App() {
  return (
    <CategoriesProvider>
      <RouterProvider router={router} />
    </CategoriesProvider>
  );
}

export default App;
