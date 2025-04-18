
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfoIcon, Loader2, Package } from 'lucide-react';
import { Product } from '@/types';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';

interface BuyNowSectionProps {
  product: Product;
}

export function BuyNowSection({ product }: BuyNowSectionProps) {
  const [quantity, setQuantity] = useState(1);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div>
          <Label htmlFor="product-quantity" className="mb-1 block">Quantity</Label>
          <div className="flex items-center">
            <Input
              id="product-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20"
            />
          </div>
        </div>
      </div>
      
      <div>
        <BuyNowButton
          kioskToken={product.kiosk_token || ''}
          productId={product.id}
          quantity={quantity}
          isInStock={product.inStock}
          className="w-full py-6 text-base font-medium bg-primary hover:bg-primary-dark transition-all"
          product={product}
        />
      </div>
    </div>
  );
}
