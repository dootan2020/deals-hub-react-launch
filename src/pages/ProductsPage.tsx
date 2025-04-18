
import { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import SimplifiedCategoryFilters from '@/components/category/SimplifiedCategoryFilters';
import ViewToggle from '@/components/category/ViewToggle';
import { useToast } from "@/components/ui/use-toast";

const ProductsPage = () => {
  // Redirect to the CategoryPage with the products route
  return <Navigate to="/products" replace />;
};

export default ProductsPage;
