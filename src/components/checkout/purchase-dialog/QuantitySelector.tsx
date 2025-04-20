
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const handleQuantityChange = (amount: number) => {
    onQuantityChange(Math.min(Math.max(1, quantity + amount), maxQuantity));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="quantity">Số lượng:</Label>
      <div className="flex items-center border rounded-md">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="rounded-r-none"
          onClick={() => handleQuantityChange(-1)}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={handleQuantityInput}
          min={1}
          max={maxQuantity}
          className="border-0 text-center w-16"
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="rounded-l-none"
          onClick={() => handleQuantityChange(1)}
          disabled={quantity >= maxQuantity}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        Còn lại: {verifiedStock !== null ? verifiedStock : productStock || 0} sản phẩm
      </div>
    </div>
  );
};
