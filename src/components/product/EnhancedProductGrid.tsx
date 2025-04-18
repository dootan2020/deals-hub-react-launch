
import React from 'react';

interface EnhancedProductGridProps {
  products: any[];
  showSort?: boolean;
  isLoading?: boolean;
  viewMode?: "grid" | "list";
  title?: string;
  description?: string;
  activeSort?: string;
  onSortChange?: React.Dispatch<React.SetStateAction<string>>;
  limit?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  viewAllLabel?: string;
}

const EnhancedProductGrid: React.FC<EnhancedProductGridProps> = ({ 
  products = [], 
  showSort = false,
  isLoading = false,
  viewMode = "grid",
  title,
  description,
  activeSort,
  onSortChange,
  limit,
  showViewAll,
  viewAllLink,
  viewAllLabel
}) => {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {description && <p className="text-muted-foreground">{description}</p>}
      
      {showSort && (
        <div className="flex justify-end">
          <span className="text-sm text-muted-foreground">Enhanced sort functionality removed</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="p-4 text-center col-span-full">
          <p className="text-lg font-medium text-gray-500">Enhanced product display has been removed</p>
          <p className="text-sm text-muted-foreground mt-2">
            {products.length} products would be displayed here
          </p>
        </div>
      </div>
      
      {showViewAll && viewAllLink && (
        <div className="flex justify-center mt-6">
          <a href={viewAllLink} className="text-primary hover:underline">
            {viewAllLabel || "View All"}
          </a>
        </div>
      )}
    </div>
  );
};

export default EnhancedProductGrid;
