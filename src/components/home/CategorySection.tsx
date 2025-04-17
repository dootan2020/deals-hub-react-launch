
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ChevronRight, ArrowRight } from 'lucide-react';
import { 
  fetchMainCategories, 
  fetchSubcategoriesByParentId 
} from '@/services/categoryService';
import CategoryIcon from '@/components/category/CategoryIcon';

interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface CategoryWithSubs {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
  slug: string;
  topSubcategories: SubcategoryItem[];
  totalSubcategories: number;
}

const CategorySection = () => {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchCategoriesWithSubcategories = async () => {
      try {
        setLoading(true);
        
        // Fetch only parent categories
        const mainCategories = await fetchMainCategories();
        
        // For each main category, fetch its subcategories
        const categoriesWithSubs = await Promise.all(
          mainCategories.map(async (category) => {
            const subcategories = await fetchSubcategoriesByParentId(category.id);
            return {
              ...category,
              topSubcategories: subcategories
                .slice(0, 4) // Limit to 4 subcategories as requested
                .map(sub => ({ 
                  id: sub.id, 
                  name: sub.name, 
                  slug: sub.slug 
                })),
              totalSubcategories: subcategories.length
            };
          })
        );
        
        setCategories(categoriesWithSubs);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithSubcategories();
  }, []);

  const showMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, categories.length));
  };

  if (loading) {
    return (
      <section className="py-16 bg-section-primary">
        <div className="container-custom">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-text-light">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-section-primary">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-section-primary">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-text">Browse Categories</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Explore our wide range of digital products across various categories.
            We have everything you need for your digital lifestyle.
          </p>
        </div>

        {categories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {categories.slice(0, visibleCount).map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-card-hover overflow-hidden border border-border transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-6 flex flex-col h-full">
                    {/* Category Icon with Circle Background */}
                    <div className="flex justify-center mb-6">
                      <div className="p-5 bg-green-50 rounded-full">
                        <CategoryIcon 
                          category={category.name} 
                          className="h-14 w-14 text-primary" 
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                    
                    {/* Category Name */}
                    <h3 className="text-xl font-semibold mb-2 text-center text-text">
                      <Link 
                        to={`/category/${category.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {category.name}
                      </Link>
                    </h3>
                    
                    {/* Category Description */}
                    <p className="text-text-light mb-5 text-center line-clamp-2">
                      {category.description || 'Browse our selection of products in this category'}
                    </p>
                    
                    {/* Subcategories List */}
                    <div className="mb-6 flex-grow">
                      {category.topSubcategories && category.topSubcategories.length > 0 ? (
                        <ul className="space-y-0">
                          {category.topSubcategories.map((sub, index) => (
                            <li key={sub.id} className={`py-2 ${index < category.topSubcategories.length - 1 ? 'border-b border-gray-100' : ''}`}>
                              <Link 
                                to={`/category/${category.slug}/${sub.slug}`}
                                className="text-sm text-text-muted hover:text-primary transition-colors flex items-center"
                              >
                                <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
                                <span className="line-clamp-1">{sub.name}</span>
                              </Link>
                            </li>
                          ))}
                          
                          {/* "Others" option if more subcategories exist */}
                          {category.totalSubcategories > 4 && (
                            <li className="py-2">
                              <Link 
                                to={`/category/${category.slug}`}
                                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center"
                              >
                                <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
                                <span>Others ({category.totalSubcategories - 4} more)</span>
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
                    
                    {/* Browse Category Button */}
                    <Link 
                      to={`/category/${category.slug}`}
                      className="inline-flex w-full justify-center items-center text-center bg-primary hover:bg-primary-dark text-white font-medium px-4 py-3 rounded-md transition-colors group"
                    >
                      Browse Category
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < categories.length && (
              <div className="mt-10 text-center">
                <button 
                  onClick={showMore}
                  className="px-8 py-3 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-md font-medium transition-colors"
                >
                  Show More Categories
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-section-alt rounded-lg">
            <p className="text-xl text-text-light">No categories found</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
