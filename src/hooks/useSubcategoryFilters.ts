
import { useState } from 'react';
import { SortOption } from '@/utils/productFilters';

export const useSubcategoryFilters = () => {
  const [sortOption, setSortOption] = useState<SortOption>("popular");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [stockFilter, setStockFilter] = useState("all");
  const [activeSubcategories, setActiveSubcategories] = useState<string[]>([]);

  const handleSortChange = (newSort: SortOption) => {
    setSortOption(newSort);
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };

  const handleStockFilterChange = (value: string) => {
    setStockFilter(value);
  };

  const handleSubcategoryToggle = (id: string) => {
    setActiveSubcategories(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return {
    sortOption,
    priceRange,
    stockFilter,
    activeSubcategories,
    handleSortChange,
    handlePriceChange,
    handleStockFilterChange,
    handleSubcategoryToggle
  };
};
