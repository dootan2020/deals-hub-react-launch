
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownAZ, ArrowUpZA, Clock, TrendingUp, SortAsc } from 'lucide-react';
import { SortOption } from '@/utils/productFilters';

interface ProductSorterProps {
  currentSort: SortOption;
  onSortChange: (value: string) => void;
}

const ProductSorter: React.FC<ProductSorterProps> = ({ currentSort, onSortChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 hidden sm:inline">Sắp xếp theo:</span>
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Mới nhất
            </div>
          </SelectItem>
          <SelectItem value="popular">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Phổ biến nhất
            </div>
          </SelectItem>
          <SelectItem value="price-low">
            <div className="flex items-center gap-2">
              <ArrowUpZA className="h-4 w-4" />
              Giá: Thấp đến cao
            </div>
          </SelectItem>
          <SelectItem value="price-high">
            <div className="flex items-center gap-2">
              <ArrowDownAZ className="h-4 w-4" />
              Giá: Cao đến thấp
            </div>
          </SelectItem>
          <SelectItem value="name-asc">
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4" />
              Tên A-Z
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductSorter;
