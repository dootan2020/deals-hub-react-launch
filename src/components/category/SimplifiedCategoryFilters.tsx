
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          <SelectItem value="recommended">Recommended</SelectItem>
          <SelectItem value="price-low-high">Price: Low to High</SelectItem>
          <SelectItem value="price-high-low">Price: High to Low</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="rating">Highest Rated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SimplifiedCategoryFilters;
