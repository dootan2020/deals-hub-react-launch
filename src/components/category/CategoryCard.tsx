
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import CategoryIcon from '@/components/category/CategoryIcon';
import { SubcategoryItem } from '@/types/category.types';

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  slug: string;
  topSubcategories: SubcategoryItem[];
  totalSubcategories: number;
}

const CategoryCard = ({ 
  id, 
  name, 
  description, 
  slug, 
  topSubcategories, 
  totalSubcategories 
}: CategoryCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-primary/20 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40">
      <div className="flex flex-col h-full">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-primary/5 rounded-full">
            <CategoryIcon 
              category={name} 
              className="h-14 w-14 text-primary" 
              strokeWidth={1.5}
            />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-center text-text">
          <Link 
            to={`/category/${slug}`}
            className="hover:text-primary transition-colors"
          >
            {name}
          </Link>
        </h3>
        
        <p className="text-text-light mb-5 text-center line-clamp-2">
          {description || 'Browse our selection of products in this category'}
        </p>
        
        <div className="mb-6 flex-grow">
          {topSubcategories && topSubcategories.length > 0 ? (
            <ul className="space-y-0">
              {topSubcategories.map((sub, index) => (
                <li key={sub.id} className={`py-2 ${index < topSubcategories.length - 1 ? 'border-b border-primary/10' : ''}`}>
                  <Link 
                    to={`/category/${slug}/${sub.slug}`}
                    className="text-sm text-text-muted hover:text-primary transition-colors flex items-center"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
                    <span className="line-clamp-1">{sub.name}</span>
                  </Link>
                </li>
              ))}
              
              {totalSubcategories > 4 && (
                <li className="py-2">
                  <Link 
                    to={`/category/${slug}`}
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
                    <span>Others ({totalSubcategories - 4} more)</span>
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-text-muted italic text-center py-4">
              No subcategories available
            </p>
          )}
        </div>
        
        <Link 
          to={`/category/${slug}`}
          className="inline-flex w-full justify-center items-center bg-primary hover:bg-primary-dark text-white font-medium px-4 py-3 rounded-md transition-colors group"
        >
          Browse Category
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default CategoryCard;
