
import { useState, useEffect } from 'react';
import { fetchMainCategories, fetchSubcategoriesByParentId } from '@/services/categoryService';
import CategorySectionLoading from '@/components/category/CategorySectionLoading';
import CategorySectionError from '@/components/category/CategorySectionError';
import CategorySectionHeader from '@/components/category/CategorySectionHeader';
import CategoryCard from '@/components/category/CategoryCard';
import ShowMoreButton from '@/components/category/ShowMoreButton';
import { CategoryWithSubs } from '@/types/category.types';

const CategorySection = () => {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchCategoriesWithSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mainCategories = await fetchMainCategories();
      
      const categoriesWithSubs = await Promise.all(
        mainCategories.map(async (category) => {
          const subcategories = await fetchSubcategoriesByParentId(category.id);
          return {
            ...category,
            topSubcategories: subcategories
              .slice(0, 4)
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

  useEffect(() => {
    fetchCategoriesWithSubcategories();
  }, []);

  const showMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, categories.length));
  };

  if (loading) {
    return (
      <section className="py-16 bg-section-primary">
        <div className="container-custom">
          <CategorySectionLoading />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-section-primary">
        <div className="container-custom">
          <CategorySectionError 
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-section-primary">
      <div className="container-custom">
        <CategorySectionHeader />

        {categories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {categories.slice(0, visibleCount).map((category) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  description={category.description}
                  slug={category.slug}
                  topSubcategories={category.topSubcategories}
                  totalSubcategories={category.totalSubcategories}
                />
              ))}
            </div>

            {visibleCount < categories.length && (
              <ShowMoreButton onClick={showMore} />
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
