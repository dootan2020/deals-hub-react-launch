
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusIcon, MinusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  stock: number;
  in_stock: boolean;
  kiosk_token?: string;
}

interface ProductPurchaseSectionProps {
  product: Product;
  className?: string;
}

export function ProductPurchaseSection({ product, className = '' }: ProductPurchaseSectionProps) {
  const [quantity, setQuantity] = useState(1);
  
  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;
    
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    if (product.stock && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (!product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (product.stock && value > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(value);
    }
  };
  
  return (
    <Card className={`border-primary/10 ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold text-primary">
                {product.price.toLocaleString()} VND
              </div>
              {discount > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground line-through">
                    {product.original_price?.toLocaleString()} VND
                  </span>
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    Save {discount}%
                  </Badge>
                </div>
              )}
            </div>
            
            <Badge variant={product.in_stock ? "outline" : "destructive"} className={product.in_stock ? "bg-green-50 text-green-700 border-green-200" : ""}>
              {product.in_stock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              min="1"
              max={product.stock || 999}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 mx-2 text-center p-0 h-9"
            />
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={increaseQuantity}
              disabled={product.stock ? quantity >= product.stock : false}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <BuyNowButton
            productId={product.id}
            quantity={quantity} // Pass quantity prop
            onPurchaseSuccess={() => {}}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
