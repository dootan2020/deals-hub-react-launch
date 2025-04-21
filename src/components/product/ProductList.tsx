
import React from 'react';
import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import BuyNowButton from '@/components/checkout/BuyNowButton';

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden border shadow-sm hover:shadow">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 h-48 md:h-auto">
              <img 
                src={product.images[0] || '/placeholder-image.jpg'} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardContent className="flex-1 p-4">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold mb-2">
                      <Link to={`/product/${product.slug}`} className="hover:text-primary">
                        {product.title}
                      </Link>
                    </h3>
                    
                    <div className="flex flex-wrap gap-1">
                      {product.badges && product.badges.map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {product.short_description || product.description.substring(0, 100)}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.round(product.rating) ? "text-amber-500" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-muted-foreground text-sm">
                        ({product.review_count} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-end justify-between mt-4">
                  <div>
                    {product.original_price && product.original_price > product.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-sm line-through text-muted-foreground">
                          {formatCurrency(product.original_price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                    
                    <div className="text-sm text-muted-foreground mt-1">
                      {product.in_stock ? (
                        <span className="text-green-600">In Stock</span>
                      ) : (
                        <span className="text-red-500">Out of Stock</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/product/${product.slug}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Link>
                    </Button>
                    
                    <BuyNowButton
                      product={product}
                      size="sm"
                      isInStock={product.in_stock}
                    />
                  </div>
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
