
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption } from '@/types';

interface ProductSorterProps {
  currentSort: SortOption;
  onSortChange: (sort: string) => void;
}

export function ProductSorter({ currentSort, onSortChange }: ProductSorterProps) {
  return (
    <Select value={currentSort} onValueChange={onSortChange}>
      <SelectTrigger className="w-[180px] focus:ring-primary">
        <SelectValue placeholder="Sort By" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="popular">Most Popular</SelectItem>
        <SelectItem value="price-low">Price: Low to High</SelectItem>
        <SelectItem value="price-high">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default ProductSorter;
