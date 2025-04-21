
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategorySectionLoading from '@/components/category/CategorySectionLoading';
import CategorySectionError from '@/components/category/CategorySectionError';
import CategorySectionHeader from '@/components/category/CategorySectionHeader';
import CategoryCard from '@/components/category/CategoryCard';
import ShowMoreButton from '@/components/category/ShowMoreButton';
import { CategoryWithSubs } from '@/types/category.types';
import { useLoadHomePage } from '@/hooks/useLoadHomePage';

const CategorySection = () => {
  const { categories, isLoadingCategories, categoriesError, refreshData } = useLoadHomePage();
  const [visibleCount, setVisibleCount] = useState(6);

  const showMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, categories.length));
  };

  const handleRetry = async () => {
    await refreshData();
  };

  return (
    <section className="py-16 bg-section-primary">
      <div className="container-custom">
        <CategorySectionHeader />

        {isLoadingCategories && <CategorySectionLoading />}

        {!isLoadingCategories && categoriesError && (
          <div className="text-center py-12 bg-section-alt rounded-lg">
            <p className="text-destructive mb-4">{categoriesError}</p>
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="flex gap-2 items-center"
            >
              <RefreshCw className="h-4 w-4" />
              Tải lại
            </Button>
          </div>
        )}

        {!isLoadingCategories && !categoriesError && categories.length > 0 && (
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
        )}

        {!isLoadingCategories && !categoriesError && categories.length === 0 && (
          <div className="text-center py-12 bg-section-alt rounded-lg">
            <p className="text-xl text-text-light">Không có danh mục nào</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
