
import { useState, useEffect } from 'react';
import { fetchProductsWithFilters } from '@/services/product/productService';
import { Product } from '@/types';
import { SortOption } from '@/utils/productFilters';

interface UseSubcategoryProductsProps {
  slug: string;
  sortOption: SortOption;
  priceRange: [number, number];
  stockFilter: string;
}

// Định nghĩa kiểu trả về từ fetchProductsWithFilters
interface ProductResponse {
  products: Product[];
  total?: number;
  page?: number;
  totalPages?: number;
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
        const result = await fetchProductsWithFilters({
          subcategory: slug,
          page: currentPage,
          perPage: 12,
          sort: sortOption,
          priceRange: priceRange,
          inStock: stockFilter === "in-stock" ? true : undefined
        });
        
        // Xử lý kết quả với type checking
        if (result && Array.isArray(result.products)) {
          setProducts(result.products);
          setTotalPages(result.totalPages || 1);
          
          if (result.products.length === 0 && currentPage > 1) {
            setCurrentPage(1);
          }
        } else if (Array.isArray(result)) {
          // Fallback nếu kết quả trả về là array trực tiếp
          setProducts(result);
          setTotalPages(1);
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
