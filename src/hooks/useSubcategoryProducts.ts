
import { useState, useEffect } from 'react';
import { fetchProductsWithFilters } from '@/services/product/productService';
import { Product } from '@/types';
import { SortOption } from '@/utils/productFilters';
import { toast } from 'sonner';

interface UseSubcategoryProductsProps {
  slug: string;
  sortOption: SortOption;
  priceRange: [number, number];
  stockFilter: string;
  activeSubcategories: string[];
}

export const useSubcategoryProducts = ({ 
  slug,
  sortOption,
  priceRange,
  stockFilter,
  activeSubcategories
}: UseSubcategoryProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If we have active subcategories, use those for filtering instead of the main category
        const filterByCategory = activeSubcategories.length > 0 
          ? { subcategory: activeSubcategories[0] }
          : { subcategory: slug };
        
        const result = await fetchProductsWithFilters({
          ...filterByCategory,
          page: currentPage,
          perPage: 12,
          sort: sortOption,
          priceRange: priceRange,
          inStock: stockFilter === "in-stock" ? true : undefined
        });
        
        // Handle the response with proper type checking
        if (result && 'products' in result && Array.isArray(result.products)) {
          setProducts(result.products);
          setTotalPages(result.totalPages || 1);
          setTotalProducts(result.total || 0);
          
          if (result.products.length === 0 && currentPage > 1) {
            setCurrentPage(1);
          }
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        toast("Error", {
          description: "Failed to load products. Please try again.",
          position: "top-center",
        });
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [slug, currentPage, sortOption, priceRange, stockFilter, activeSubcategories]);

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
    totalProducts,
    handlePageChange
  };
};
