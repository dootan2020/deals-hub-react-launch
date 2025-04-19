
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Globe, X, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategoriesContext } from '@/context/CategoriesContext';
import { Category } from '@/types';

interface MobileNavigationProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const MobileNavigation = ({ 
  isOpen, 
  toggleMenu 
}: MobileNavigationProps) => {
  const { mainCategories, getSubcategoriesByParentId, isLoading } = useCategoriesContext();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getCategoryUrl = (category: Category) => {
    return `/category/${category.slug}`;
  };

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-200",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={toggleMenu}
    >
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-64 bg-white p-6 shadow-xl transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">Menu</h2>
          <button onClick={toggleMenu}>
            <X className="h-6 w-6 text-text-light" />
          </button>
        </div>
        
        <nav className="flex flex-col space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <>
              {/* Dynamic categories from database */}
              {mainCategories.map((category) => {
                const subcategories = getSubcategoriesByParentId(category.id);
                const isExpanded = expandedCategories[category.id] || false;
                
                return (
                  <div key={category.id} className="space-y-2">
                    <div 
                      className="flex items-center justify-between cursor-pointer text-text hover:text-primary transition-colors duration-200"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <span>{category.name}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                    {isExpanded && (
                      <div className="pl-4 space-y-2">
                        {subcategories.length > 0 ? (
                          subcategories.map((subcategory) => (
                            <Link 
                              key={subcategory.id}
                              to={getCategoryUrl(subcategory)} 
                              className="block text-text-light hover:text-primary transition-colors duration-200"
                              onClick={toggleMenu}
                            >
                              {subcategory.name}
                            </Link>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No subcategories found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Static menu items */}
              <Link 
                to="/support" 
                className="text-text hover:text-primary transition-colors duration-200"
                onClick={toggleMenu}
              >
                Support
              </Link>
              
              <Link 
                to="/faqs" 
                className="text-text hover:text-primary transition-colors duration-200"
                onClick={toggleMenu}
              >
                FAQs
              </Link>
              
              <Link 
                to="/account" 
                className="text-text hover:text-primary transition-colors duration-200"
                onClick={toggleMenu}
              >
                My Account
              </Link>
            </>
          )}

          {/* Language Selector for Mobile */}
          <div className="flex items-center pt-4 border-t border-gray-200 mt-4">
            <Globe className="h-5 w-5 text-text-light" />
            <select className="ml-2 text-sm text-text-light bg-transparent border-none focus:outline-none">
              <option value="en">English</option>
              <option value="vi">Vietnamese</option>
            </select>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;
