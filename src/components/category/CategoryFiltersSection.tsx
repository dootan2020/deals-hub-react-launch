
import React from 'react';

interface CategoryFiltersSectionProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

const CategoryFiltersSection: React.FC<CategoryFiltersSectionProps> = ({
  showFilters,
  onToggleFilters
}) => {
  return (
    <div className={`md:w-1/4 lg:w-1/5 ${showFilters ? 'block' : 'hidden'} md:block`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
        <h2 className="font-semibold text-lg mb-4">Filters</h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Price Range</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <span className="ml-2 text-text-light">Under $25</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <span className="ml-2 text-text-light">$25 - $50</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <span className="ml-2 text-text-light">$50 - $100</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <span className="ml-2 text-text-light">Over $100</span>
            </label>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Rating</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <span className="ml-2 text-text-light">4 Stars & Up</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <span className="ml-2 text-text-light">3 Stars & Up</span>
            </label>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Availability</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <span className="ml-2 text-text-light">In Stock</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFiltersSection;
