
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { GridIcon, List, Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface ProductGridProps {
  products: Product[];
  title?: string;
  description?: string;
  showLayoutToggle?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const ProductGrid = ({ products, title, description, showLayoutToggle = false }: ProductGridProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
                onClick={() => setViewMode('grid')}
                className="rounded-md"
              >
                <GridIcon className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
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
      {products.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
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
        )
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
