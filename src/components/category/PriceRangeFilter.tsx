
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatUSD } from '@/utils/currency';

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
}

const PriceRangeFilter = ({ minPrice, maxPrice, onPriceChange }: PriceRangeFilterProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [minInput, setMinInput] = useState<string>(minPrice.toString());
  const [maxInput, setMaxInput] = useState<string>(maxPrice.toString());

  const handleSliderChange = (values: number[]) => {
    const [min, max] = values as [number, number];
    setPriceRange([min, max]);
    setMinInput(min.toString());
    setMaxInput(max.toString());
  };

  const handleInputChange = () => {
    const min = Math.max(0, parseFloat(minInput) || 0);
    const max = Math.max(min, parseFloat(maxInput) || 0);
    setPriceRange([min, max]);
    onPriceChange(min, max);
  };

  const handleApply = () => {
    onPriceChange(priceRange[0], priceRange[1]);
  };

  return (
    <div className="space-y-4 py-2">
      <h3 className="font-semibold text-sm mb-4">Khoảng giá</h3>
      
      <Slider
        defaultValue={priceRange}
        min={0}
        max={500}
        step={1}
        value={priceRange}
        onValueChange={handleSliderChange}
        className="py-4"
      />
      
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="min-price" className="sr-only">Giá thấp nhất</Label>
          <Input
            id="min-price"
            type="number"
            min="0"
            placeholder="Min"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        
        <span className="text-muted-foreground">—</span>
        
        <div className="flex-1">
          <Label htmlFor="max-price" className="sr-only">Giá cao nhất</Label>
          <Input
            id="max-price"
            type="number"
            min="0"
            placeholder="Max"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <p className="text-xs text-muted-foreground">
          {formatUSD(priceRange[0])} — {formatUSD(priceRange[1])}
        </p>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-xs"
          onClick={handleApply}
        >
          Áp dụng
        </Button>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
