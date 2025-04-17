
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
  slug: string;
}

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch only parent categories (where parent_id is null)
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .is('parent_id', null)
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const showMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, categories.length));
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
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
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse Categories</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Explore our wide range of digital products across various categories.
            We have everything you need for your digital lifestyle.
          </p>
        </div>

        {categories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {categories.slice(0, visibleCount).map((category) => (
                <Link 
                  key={category.id} 
                  to={`/category/${category.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                    <div className="h-48 bg-gray-100 flex items-center justify-center p-6">
                      <img
                        src={category.image || `https://placehold.co/400x300?text=${encodeURIComponent(category.name)}`}
                        alt={category.name}
                        className="h-full w-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.name} <span className="text-text-light text-sm">({category.count || 0})</span>
                      </h3>
                      <p className="text-text-light mb-4 line-clamp-2">{category.description || 'Browse our selection of products in this category'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-medium">
                          Browse Category
                        </span>
                        <ChevronRight className="h-5 w-5 text-primary transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {visibleCount < categories.length && (
              <div className="mt-10 text-center">
                <Button onClick={showMore}>
                  Show More Categories
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-xl text-text-light">No categories found</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
