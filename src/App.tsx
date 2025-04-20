import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CategoryPage from '@/pages/CategoryPage';
import SubcategoryPage from '@/pages/SubcategoryPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccountPage from '@/pages/AccountPage';
import AdminPage from '@/pages/AdminPage';
import ProductsAdmin from '@/pages/admin/ProductsAdmin';
import CategoriesAdmin from '@/pages/admin/CategoriesAdmin';
import OrdersAdmin from '@/pages/admin/OrdersAdmin';
import UsersAdmin from '@/pages/admin/UsersAdmin';
import SettingsAdmin from '@/pages/admin/SettingsAdmin';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicOnlyRoute from '@/components/auth/PublicOnlyRoute';
import DepositsPage from '@/pages/DepositsPage';
import SupportPage from '@/pages/SupportPage';
import FAQPage from '@/pages/FAQPage';
import NotFoundPage from '@/pages/NotFoundPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
    <RouterProvider
      router={createBrowserRouter([
        {
          path: '/',
          element: <Layout><HomePage /></Layout>,
        },
        {
          path: '/products',
          element: <Layout><ProductsPage /></Layout>,
        },
        {
          path: '/products/:productSlug',
          element: <Layout><ProductDetailPage /></Layout>,
        },
        {
          path: '/categories/:categorySlug',
          element: <Layout><CategoryPage /></Layout>,
        },
        {
          path: '/categories/:parentCategorySlug/:categorySlug',
          element: <Layout><SubcategoryPage /></Layout>,
        },
        {
          path: '/login',
          element: (
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          ),
        },
        {
          path: '/register',
          element: (
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          ),
        },
        {
          path: '/account',
          element: (
            <ProtectedRoute>
              <Layout><AccountPage /></Layout>
            </ProtectedRoute>
          ),
        },
        {
          path: '/deposits',
          element: (
            <ProtectedRoute>
              <Layout><DepositsPage /></Layout>
            </ProtectedRoute>
          ),
        },
        {
          path: '/admin',
          element: (
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          ),
        },
        {
          path: '/admin/products',
          element: (
            <ProtectedRoute requiredRole="admin">
              <ProductsAdmin />
            </ProtectedRoute>
          ),
        },
        {
          path: '/admin/categories',
          element: (
            <ProtectedRoute requiredRole="admin">
              <CategoriesAdmin />
            </ProtectedRoute>
          ),
        },
        {
          path: '/admin/orders',
          element: (
            <ProtectedRoute requiredRole="admin">
              <OrdersAdmin />
            </ProtectedRoute>
          ),
        },
        {
          path: '/admin/users',
          element: (
            <ProtectedRoute requiredRole="admin">
              <UsersAdmin />
            </ProtectedRoute>
          ),
        },
        {
          path: '/admin/settings',
          element: (
            <ProtectedRoute requiredRole="admin">
              <SettingsAdmin />
            </ProtectedRoute>
          ),
        },
        {
          path: '/support',
          element: <Layout><SupportPage /></Layout>,
        },
        {
          path: '/faq',
          element: <Layout><FAQPage /></Layout>,
        },
        {
          path: '/404',
          element: <Layout><NotFoundPage /></Layout>,
        },
        {
          path: '*',
          element: <Layout><NotFoundPage /></Layout>,
        },
        {
          path: '/orders',
          element: (
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          ),
        },
      ])}
    />
  );
}

export default App;
