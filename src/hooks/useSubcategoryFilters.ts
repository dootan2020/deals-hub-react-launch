
import { useState } from 'react';
import { SortOption } from '@/utils/productFilters';

export const useSubcategoryFilters = () => {
  const [sortOption, setSortOption] = useState<SortOption>("popular");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [stockFilter, setStockFilter] = useState("all");
  const [activeSubcategories, setActiveSubcategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort as SortOption);
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };

  const handleStockFilterChange = (value: string) => {
    setStockFilter(value);
  };

  const handleSubcategoryToggle = (id: string) => {
    // For simplicity, we're just using a single active subcategory
    // This can be expanded to support multiple active subcategories if needed
    setActiveSubcategories(prev => 
      prev.includes(id) 
        ? []  // Remove if already active
        : [id] // Replace with new subcategory
    );
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  return {
    sortOption,
    priceRange,
    stockFilter,
    activeSubcategories,
    viewMode,
    handleSortChange,
    handlePriceChange,
    handleStockFilterChange,
    handleSubcategoryToggle,
    handleViewModeChange
  };
};
