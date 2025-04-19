
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption } from '@/utils/productFilters';

interface SimplifiedCategoryFiltersProps {
  onSortChange: (sort: string) => void;
  activeSort: string;
}

const SimplifiedCategoryFilters: React.FC<SimplifiedCategoryFiltersProps> = ({
  onSortChange,
  activeSort,
}) => {
  return (
    <div className="h-10 flex items-center">
      <Select value={activeSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px] md:w-[220px] focus:ring-primary">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SimplifiedCategoryFilters;
