
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Product, FilterParams } from '@/types';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchProductsWithFilters } from '@/services/productService';
import { useToast } from '@/components/ui/use-toast';

interface ProductGridProps {
  products?: Product[];
  title?: string;
  description?: string;
  showSort?: boolean;
  onSortChange?: (sort: string) => void;
  activeSort?: string;
  categoryId?: string;
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products: initialProducts,
  title,
  description,
  showSort = false,
  onSortChange,
  activeSort = 'recommended',
  categoryId,
  isLoading: externalLoading = false
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProducts);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      return;
    }

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const filters: FilterParams = {
          sort: activeSort,
          categoryId
        };
        
        const fetchedProducts = await fetchProductsWithFilters(filters);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [initialProducts, activeSort, categoryId, toast]);

  const handleSortChange = (value: string) => {
    if (onSortChange) {
      onSortChange(value);
    }
  };
  
  const showLoading = isLoading || externalLoading;
  
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          {title && <h2 className="text-2xl font-bold mb-2 text-text">{title}</h2>}
          {description && <p className="text-text-light mb-4 max-w-3xl">{description}</p>}
        </div>
        
        {showSort && (
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Select value={activeSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-[220px] focus:ring-primary">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {showLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-text-light">Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-text-light">No products found</p>
          <p className="text-text-light mt-2">Try adjusting your filters or check back later for new products</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
