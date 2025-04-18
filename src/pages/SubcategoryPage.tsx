
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import ProductGrid from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProductsWithFilters } from '@/services/productService';

// Define Product type
interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  // Add other properties as needed
}

const SubcategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Fetch products for the subcategory
  useEffect(() => {
    const loadProducts = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchProductsWithFilters({
          subcategory: slug,
          page: currentPage,
          limit: 12
        });
        
        // Check if result is the expected structure
        if (result && Array.isArray(result.products)) {
          setProducts(result.products as Product[]);
          setTotalPages(result.totalPages || 1);
          
          if (result.products.length === 0 && currentPage > 1) {
            setCurrentPage(1); // Reset to first page if current page has no results
          }
        } else {
          // Handle empty or invalid response
          setProducts([]);
          setTotalPages(1);
          console.warn("Unexpected response format:", result);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [slug, currentPage]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === "grid" ? "list" : "grid");
  };

  // Mock category data for CategoryHeader
  const mockCategory = {
    id: slug || 'default-id',
    name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Products',
    description: 'Browse our collection of products',
    slug: slug || 'default-slug',
    image: '',
    parent: null
  };
  
  if (error) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">Error</h2>
            <p className="mt-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-6"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-8">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            <CategoryHeader
              category={mockCategory}
              productCount={products.length}
            />
            
            <ProductGrid 
              products={products} 
              showSort={true}
              isLoading={isLoading}
              viewMode={viewMode}
            />
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  {Array(totalPages).fill(0).map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SubcategoryPage;
