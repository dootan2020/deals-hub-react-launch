
import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/types';

interface SubcategoriesGridProps {
  categorySlug: string;
  subcategories: Category[];
}

const SubcategoriesGrid: React.FC<SubcategoriesGridProps> = ({ categorySlug, subcategories }) => {
  if (subcategories.length === 0) return null;
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Subcategories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {subcategories.map(subcategory => (
          <Link
            to={`/category/${categorySlug}/${subcategory.slug}`}
            key={subcategory.id}
            className="bg-white border border-primary/20 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:border-primary/40"
          >
            <img 
              src={subcategory.image} 
              alt={subcategory.name}
              className="w-16 h-16 object-contain mb-4"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
            />
            <h3 className="font-medium">{subcategory.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {subcategory.count} {subcategory.count === 1 ? 'product' : 'products'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubcategoriesGrid;
