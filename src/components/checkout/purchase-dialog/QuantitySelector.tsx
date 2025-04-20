
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (value: number) => void;
  verifiedStock: number | null;
  productStock: number;
}

export const QuantitySelector = ({
  quantity,
  maxQuantity,
  onQuantityChange,
  verifiedStock,
  productStock,
}: QuantitySelectorProps) => {
  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    onQuantityChange(Math.min(Math.max(1, value), maxQuantity));
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="h-10 w-10 rounded-full p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          type="number"
          value={quantity}
          onChange={handleQuantityInput}
          min={1}
          max={maxQuantity}
          className="w-20 text-center"
        />
        
        <Button 
          type="button" 
          variant="outline"
          size="sm"
          onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
          disabled={quantity >= maxQuantity}
          className="h-10 w-10 rounded-full p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-left text-xs text-muted-foreground mt-1">
        Còn lại: {verifiedStock !== null ? verifiedStock : productStock || 0} sản phẩm
      </div>
    </div>
  );
};
