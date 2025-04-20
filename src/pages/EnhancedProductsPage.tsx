import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';
import EnhancedProductGrid from '@/components/product/EnhancedProductGrid';
import SimplifiedCategoryFilters from '@/components/category/SimplifiedCategoryFilters';
import ViewToggle from '@/components/category/ViewToggle';
import { FilterParams, Product } from '@/types';
import { fetchProductsWithFilters } from '@/services/product';
import { useToast } from "@/hooks/use-toast";
import { SortOption } from '@/utils/productFilters';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

const EnhancedProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  
  // Active filters from URL search params or defaults with type assertion to ensure valid SortOption
  const [activeFilters, setActiveFilters] = useState<FilterParams>({
    sort: (searchParams.get('sort') || 'recommended') as SortOption,
  });

  // Fetch products based on active filters
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const result = await fetchProductsWithFilters(activeFilters);
        if (result && Array.isArray(result.products)) {
          setProducts(result.products);
        } else {
          setProducts([]);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again.');
        toast({
          title: "Error",
          description: "There was a problem loading products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [activeFilters, toast]);

  // Update URL search params when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (activeFilters.sort) {
      newSearchParams.set('sort', activeFilters.sort);
    }
    
    // Only update if changed to avoid unnecessary history entries
    const currentParamsString = searchParams.toString();
    const newParamsString = newSearchParams.toString();
    
    if (currentParamsString !== newParamsString) {
      setSearchParams(newSearchParams);
    }
  }, [activeFilters, setSearchParams, searchParams]);

  const handleSortChange = (sort: SortOption) => {
    setActiveFilters(prev => ({ ...prev, sort }));
  };

  const handleViewChange = (view: 'grid' | 'list') => {
    setCurrentView(view);
  };

  return (
    <Layout>
      <Helmet>
        <title>All Products - Digital Deals Hub</title>
        <meta 
          name="description" 
          content="Browse all digital products available at Digital Deals Hub. Find the best deals on digital goods including accounts, keys, and software."
        />
        <link rel="canonical" href="/products" />
      </Helmet>
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container-custom py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>All Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-2">All Products</h1>
          <p className="text-gray-600">
            Browse our complete catalog of digital products and services
          </p>
        </div>
      </div>
      
      <div className="container-custom py-12">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
          <SimplifiedCategoryFilters
            onSortChange={handleSortChange}
            activeSort={(activeFilters.sort || 'recommended') as SortOption}
          />
          <ViewToggle
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        </div>
        
        <EnhancedProductGrid 
          products={products}
          isLoading={loading}
          showSort={false}
          viewMode={currentView}
        />
      </div>
    </Layout>
  );
};

export default EnhancedProductsPage;
