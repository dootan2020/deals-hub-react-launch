
import React from 'react';
import { SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

interface MobileFilterToggleProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

const MobileFilterToggle: React.FC<MobileFilterToggleProps> = ({
  showFilters,
  onToggleFilters
}) => {
  return (
    <div className="md:hidden mb-4">
      <button
        onClick={onToggleFilters}
        className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
      >
        <div className="flex items-center">
          <SlidersHorizontal className="h-5 w-5 mr-2 text-text-light" />
          <span>Filters</span>
        </div>
        {showFilters ? (
          <ChevronUp className="h-5 w-5 text-text-light" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-light" />
        )}
      </button>
    </div>
  );
};

export default MobileFilterToggle;
