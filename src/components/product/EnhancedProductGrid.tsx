
import React from 'react';

// Empty enhanced product grid component - placeholder after deletion
interface EnhancedProductGridProps {
  products?: any[];
  showSort?: boolean;
  limit?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  viewAllLabel?: string;
  paginationType?: 'pagination' | 'load-more';
  viewMode?: 'grid' | 'list';
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const EnhancedProductGrid: React.FC<EnhancedProductGridProps> = ({
  products = [],
  isLoading = false
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div className="p-4 text-center col-span-full">
        <p className="text-lg font-medium text-gray-500">Product display has been removed</p>
      </div>
    </div>
  );
};

export default EnhancedProductGrid;
