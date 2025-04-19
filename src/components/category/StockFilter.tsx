
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface StockFilterProps {
  stockFilter: string;
  onStockFilterChange: (value: string) => void;
}

const StockFilter = ({ stockFilter, onStockFilterChange }: StockFilterProps) => {
  return (
    <div className="space-y-4 py-2">
      <h3 className="font-semibold text-sm mb-4">Tình trạng</h3>
      
      <RadioGroup 
        value={stockFilter} 
        onValueChange={onStockFilterChange}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="stock-all" />
          <Label htmlFor="stock-all" className="text-sm">Tất cả</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="in-stock" id="in-stock" />
          <Label htmlFor="in-stock" className="text-sm">Còn hàng</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="low-stock" id="low-stock" />
          <Label htmlFor="low-stock" className="text-sm">Sắp hết</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default StockFilter;
