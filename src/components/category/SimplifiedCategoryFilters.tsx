
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortOption } from '@/types';
import { getSortOptions } from '@/utils/productFilters';

interface SimplifiedCategoryFiltersProps {
  activeSort: SortOption;
  onSortChange: (value: SortOption) => void;
}

const SimplifiedCategoryFilters: React.FC<SimplifiedCategoryFiltersProps> = ({
  activeSort,
  onSortChange
}) => {
  const sortOptions = getSortOptions();

  const handleSortChange = (value: string) => {
    onSortChange(value as SortOption);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="hidden md:flex space-x-2">
        <Button variant="outline" size="sm">All</Button>
        <Button variant="outline" size="sm">New</Button>
        <Button variant="outline" size="sm">Featured</Button>
      </div>
      
      <div className="ml-auto flex-shrink-0">
        <Select value={activeSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SimplifiedCategoryFilters;
