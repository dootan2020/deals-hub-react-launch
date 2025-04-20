
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
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/context/AuthContext';

function App() {
  return (
    <RouterProvider
      router={createBrowserRouter([
        {
          path: '/',
          element: <Layout><Index /></Layout>,
        },
        {
          path: '/products',
          element: <Layout><ProductsPage /></Layout>,
        },
        {
          path: '/products/:productSlug',
          element: <Layout><ProductPage /></Layout>,
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
          element: <LoginPage />,
        },
        {
          path: '/support',
          element: <Layout><SupportPage /></Layout>,
        },
        {
          path: '/orders',
          element: (
            <ProtectedRoute>
              <Layout><OrdersPage /></Layout>
            </ProtectedRoute>
          ),
        },
        {
          path: '/404',
          element: <Layout><NotFound /></Layout>,
        },
        {
          path: '*',
          element: <Layout><NotFound /></Layout>,
        },
      ])}
    />
  );
}

export default App;
