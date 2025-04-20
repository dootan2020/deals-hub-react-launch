
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Category } from '@/types';

interface CategoryDropdownProps {
  className?: string;
  isOpen?: boolean;
  mainCategories: Category[];
  getSubcategoriesByParentId: (parentId: string) => Category[];
}

const CategoryDropdown = ({ 
  className, 
  isOpen = false, 
  mainCategories = [],
  getSubcategoriesByParentId
}: CategoryDropdownProps) => {
  if (!isOpen) return null;

  // Get the first 3 main categories (or less if there are fewer)
  const displayCategories = mainCategories.slice(0, 3);

  return (
    <div className={cn(
      "absolute left-1/2 -translate-x-1/2 mt-1 w-[900px] bg-white rounded-xl shadow-lg z-50",
      "p-8 grid grid-cols-3 gap-8",
      "transition-all duration-200 ease-in-out",
      className
    )}>
      {displayCategories.map((category) => (
        <div key={category.id} className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">{category.name}</h4>
          <ul className="space-y-2">
            {getSubcategoriesByParentId(category.id).map((subcategory) => (
              <li key={subcategory.id}>
                <Link
                  to={`/categories/${category.slug}/${subcategory.slug}`}
                  className="block px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-dark transition-colors"
                >
                  {subcategory.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* If we have fewer than 3 categories, fill in with empty divs to maintain grid structure */}
      {[...Array(Math.max(0, 3 - displayCategories.length))].map((_, i) => (
        <div key={`empty-${i}`}></div>
      ))}
    </div>
  );
};

export default CategoryDropdown;
