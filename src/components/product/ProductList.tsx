
import React from 'react';
import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="relative w-full md:w-1/4 aspect-square md:aspect-auto">
              <Link to={`/product/${product.slug}`}>
                <img 
                  src={product.images[0] || '/placeholder.png'} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </Link>
              {product.badges && product.badges.length > 0 && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">{product.badges[0]}</Badge>
                </div>
              )}
            </div>
            
            <CardContent className="flex-1 p-4">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <Link to={`/product/${product.slug}`} className="hover:underline">
                    <h3 className="text-lg font-semibold">{product.title}</h3>
                  </Link>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {product.shortDescription || product.description.substring(0, 100)}...
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="font-semibold text-lg text-primary">
                      {formatCurrency(product.price)}
                    </div>
                    {product.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                  
                  <Link to={`/product/${product.slug}`}>
                    <Button size="sm">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProductList;
