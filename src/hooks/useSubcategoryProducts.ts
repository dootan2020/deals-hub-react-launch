
import { useState, useEffect } from 'react';
import { fetchProductsWithFilters } from '@/services/productService';
import { Product } from '@/types';
import { SortOption } from '@/types';

interface ProductsResponse {
  products: Product[];
  totalPages: number;
}

interface UseSubcategoryProductsProps {
  slug: string;
  sortOption: SortOption;
  priceRange: [number, number];
  stockFilter: string;
}

export const useSubcategoryProducts = ({ 
  slug,
  sortOption,
  priceRange,
  stockFilter
}: UseSubcategoryProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetchProductsWithFilters({
          subcategory: slug,
          page: currentPage,
          perPage: 12,
          sort: sortOption,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          inStock: stockFilter === "in-stock" ? true : undefined
        });
        
        // Handle response based on type
        if (Array.isArray(response)) {
          setProducts(response);
          setTotalPages(1);
        } else if (response && typeof response === 'object') {
          setProducts(response.products || []);
          setTotalPages(response.totalPages || 1);
          
          if (response.products?.length === 0 && currentPage > 1) {
            setCurrentPage(1);
          }
        } else {
          setProducts([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [slug, currentPage, sortOption, priceRange, stockFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    handlePageChange
  };
};
