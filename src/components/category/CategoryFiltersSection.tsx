
import React from 'react';
import { Category } from '@/types';
import { CheckIcon } from 'lucide-react';

interface CategoryFiltersSectionProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  subcategories: Category[];
  activeSubcategories: string[];
  onSubcategoryToggle: (id: string) => void;
}

const CategoryFiltersSection: React.FC<CategoryFiltersSectionProps> = ({
  showFilters,
  onToggleFilters,
  subcategories,
  activeSubcategories,
  onSubcategoryToggle
}) => {
  if (subcategories.length === 0) return null;
  
  return (
    <div className={`md:w-1/4 lg:w-1/5 ${showFilters ? 'block' : 'hidden'} md:block`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
        <h2 className="font-semibold text-lg mb-4">Subcategories</h2>
        
        <div className="space-y-2">
          {subcategories.map((subcategory) => (
            <button
              key={subcategory.id}
              onClick={() => onSubcategoryToggle(subcategory.id)}
              className={`flex items-center justify-between w-full p-2 rounded-md text-left ${
                activeSubcategories.includes(subcategory.id) 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>{subcategory.name}</span>
              {activeSubcategories.includes(subcategory.id) && (
                <CheckIcon className="h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFiltersSection;
