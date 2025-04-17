
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';
import EnhancedProductGrid from '@/components/product/EnhancedProductGrid';
import EnhancedCategoryFilters from '@/components/category/EnhancedCategoryFilters';
import { FilterParams, Product } from '@/types';
import { fetchProductsWithFilters } from '@/services/product';
import { useToast } from "@/hooks/use-toast";
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Active filters from URL search params or defaults
  const [activeFilters, setActiveFilters] = useState<FilterParams>({
    sort: searchParams.get('sort') || 'recommended',
    priceRange: searchParams.get('minPrice') && searchParams.get('maxPrice') 
      ? [searchParams.get('minPrice') || '0', searchParams.get('maxPrice') || '1000']
      : undefined,
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
    rating: searchParams.get('rating') 
      ? [searchParams.get('rating') || '']
      : undefined
  });

  // Fetch products based on active filters
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProductsWithFilters(activeFilters);
        setProducts(fetchedProducts);
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
    
    if (activeFilters.priceRange) {
      newSearchParams.set('minPrice', activeFilters.priceRange[0]);
      newSearchParams.set('maxPrice', activeFilters.priceRange[1]);
    }
    
    if (activeFilters.inStock !== undefined) {
      newSearchParams.set('inStock', activeFilters.inStock.toString());
    }
    
    if (activeFilters.rating && activeFilters.rating.length > 0) {
      newSearchParams.set('rating', Math.min(...activeFilters.rating.map(Number)).toString());
    }
    
    // Only update if changed to avoid unnecessary history entries
    const currentParamsString = searchParams.toString();
    const newParamsString = newSearchParams.toString();
    
    if (currentParamsString !== newParamsString) {
      setSearchParams(newSearchParams);
    }
  }, [activeFilters, setSearchParams, searchParams]);

  const handleFilterChange = (newFilters: FilterParams) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const toggleMobileFilters = () => {
    setIsMobileFilterOpen(prev => !prev);
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`md:w-1/4 lg:w-1/5 ${isMobileFilterOpen ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm sticky top-24">
              <EnhancedCategoryFilters 
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onToggleMobileFilters={toggleMobileFilters}
                isMobileFilterOpen={isMobileFilterOpen}
              />
            </div>
          </div>
          
          {/* Products Section */}
          <div className="md:w-3/4 lg:w-4/5">
            <EnhancedCategoryFilters 
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onToggleMobileFilters={toggleMobileFilters}
              isMobileFilterOpen={isMobileFilterOpen}
            />
            
            <EnhancedProductGrid 
              products={products}
              isLoading={loading}
              showSort={true}
              activeSort={activeFilters.sort || 'recommended'} 
              onSortChange={(sort) => handleFilterChange({ sort })}
              paginationType="pagination"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnhancedProductsPage;
