
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (newQuantity: number) => void;
}

export const QuantitySelector = ({ quantity, maxQuantity, onQuantityChange }: QuantitySelectorProps) => {
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      onQuantityChange(newQuantity);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Số lượng:</label>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(-1)}
          disabled={quantity <= 1}
          className="border-gray-300 hover:bg-gray-50"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => onQuantityChange(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-20 text-center"
          min={1}
          max={maxQuantity}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(1)}
          disabled={quantity >= maxQuantity}
          className="border-gray-300 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
