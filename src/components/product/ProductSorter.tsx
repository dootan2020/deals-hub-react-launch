
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownAZ, ArrowUpZA, Clock, TrendingUp } from 'lucide-react';
import { SortOption } from '@/utils/productFilters';

interface ProductSorterProps {
  currentSort: SortOption;
  onSortChange: (value: string) => void;
}

const ProductSorter: React.FC<ProductSorterProps> = ({ currentSort, onSortChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price-high">
            <div className="flex items-center gap-2">
              <ArrowDownAZ className="h-4 w-4" />
              Price: High to Low
            </div>
          </SelectItem>
          <SelectItem value="price-low">
            <div className="flex items-center gap-2">
              <ArrowUpZA className="h-4 w-4" />
              Price: Low to High
            </div>
          </SelectItem>
          <SelectItem value="newest">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Newest
            </div>
          </SelectItem>
          <SelectItem value="popular">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Popular
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductSorter;
