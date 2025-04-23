import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PurchaseDialog } from '@/components/checkout/PurchaseDialog';

interface ProductPurchaseSectionProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export function ProductPurchaseSection({ product, quantity, onQuantityChange }: ProductPurchaseSectionProps) {
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= product.stock) {
      onQuantityChange(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      onQuantityChange(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handlePurchaseSuccess = () => {
    // Handle successful purchase
    console.log('Purchase successful');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-lg text-gray-500 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {product.inStock ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              In Stock
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Out of Stock
            </Badge>
          )}
          
          {product.stock > 0 && (
            <span className="text-sm text-muted-foreground">
              {product.stock} available
            </span>
          )}
        </div>
      </div>
      
      {product.inStock && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="h-10 w-10 rounded-r-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={handleQuantityChange}
              className="h-10 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={incrementQuantity}
              disabled={quantity >= product.stock}
              className="h-10 w-10 rounded-l-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2">
        <BuyNowButton
          productId={product.id}
          quantity={quantity}
          onPurchaseSuccess={handlePurchaseSuccess}
          className="w-full sm:w-auto"
        />
        
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={() => setIsPurchaseDialogOpen(true)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Purchase
        </Button>
      </div>
      
      <PurchaseDialog 
        product={product}
        isOpen={isPurchaseDialogOpen}
        onClose={() => setIsPurchaseDialogOpen(false)}
        initialQuantity={quantity}
      />
    </div>
  );
}

export default ProductPurchaseSection;
