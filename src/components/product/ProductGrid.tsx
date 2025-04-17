
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { GridIcon, List, Star, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface ProductGridProps {
  products: Product[];
  title?: string;
  description?: string;
  showLayoutToggle?: boolean;
}

export type SortOption = 'recommended' | 'price_asc' | 'price_desc' | 'newest' | 'rating';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const ProductGrid = ({ products, title, description, showLayoutToggle = false }: ProductGridProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const mode = searchParams.get('view') as 'grid' | 'list';
    return mode === 'list' ? 'list' : 'grid';
  });
  
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const sort = searchParams.get('sort') as SortOption;
    return sort || 'recommended';
  });
  
  const [sortedProducts, setSortedProducts] = useState<Product[]>([...products]);
  
  // Update URL params when view mode or sort option changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', viewMode);
    newParams.set('sort', sortOption);
    setSearchParams(newParams);
  }, [viewMode, sortOption, setSearchParams]);
  
  // Sort products when products array or sort option changes
  useEffect(() => {
    if (!products.length) {
      setSortedProducts([]);
      return;
    }
    
    const productsCopy = [...products];
    
    switch (sortOption) {
      case 'price_asc':
        productsCopy.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        productsCopy.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Assuming products have a created_at property in the database
        // For now, we'll just use the ID as a proxy for "newness"
        productsCopy.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'rating':
        productsCopy.sort((a, b) => {
          // First by rating (descending)
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          // Then by review count (descending)
          return b.reviewCount - a.reviewCount;
        });
        break;
      case 'recommended':
      default:
        // For recommended, we'll sort by a combination of sales count (not available yet)
        // For now, sort by rating and then by newness (using ID as proxy)
        productsCopy.sort((a, b) => {
          // First by rating
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          // Then by ID as proxy for newness
          return b.id.localeCompare(a.id);
        });
        break;
    }
    
    setSortedProducts(productsCopy);
  }, [products, sortOption]);
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };
  
  const toggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  return (
    <div className="space-y-6">
      {/* Header section with title, description, and optional layout toggle */}
      {(title || description || showLayoutToggle) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            {title && <h2 className="text-2xl font-bold mb-1">{title}</h2>}
            {description && <p className="text-text-light">{description}</p>}
          </div>
          
          {showLayoutToggle && (
            <div className="flex items-center space-x-2 bg-gray-50 rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => toggleViewMode('grid')}
                className="rounded-md"
              >
                <GridIcon className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => toggleViewMode('list')}
                className="rounded-md"
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Products display - either grid or list view */}
      {sortedProducts.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-text-light">{sortedProducts.length} products found</p>
            <div className="flex items-center">
              <span className="mr-2 text-text-light">Sort by:</span>
              <select 
                className="border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product) => (
                <div key={product.id} className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden p-4">
                  <div className="sm:w-1/4 h-40 bg-gray-50">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="sm:w-3/4 flex flex-col">
                    <h3 className="font-medium text-lg mb-1 hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) 
                                ? "text-yellow-400 fill-yellow-400" 
                                : "text-gray-300"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-text-light">
                        ({product.reviewCount})
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {product.description}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold text-lg text-text">
                          {formatCurrency(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-text-light text-sm line-through ml-2">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <Button disabled={!product.inStock}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl font-medium mb-2">No products found</p>
          <p className="text-text-light">
            Try adjusting your filters or check back later for new products.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
