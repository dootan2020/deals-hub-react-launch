
import React from 'react';
import { Product } from '@/types';
import { CategoryWithParent } from '@/types/category.types';
import EnhancedProductGrid from '@/components/product/EnhancedProductGrid';
import SubcategoriesGrid from '@/components/category/SubcategoriesGrid';
import { useSubcategories } from '@/hooks/useSubcategories';

interface CategoryOverviewProps {
  category: CategoryWithParent;
  products: Product[];
}

const CategoryOverview: React.FC<CategoryOverviewProps> = ({ 
  category, 
  products 
}) => {
  // Get subcategories using the hook
  const { subcategories, products: featuredProducts, loading, error } = useSubcategories(category.id);
  
  return (
    <>
      <SubcategoriesGrid 
        categorySlug={category.slug} 
        subcategories={subcategories} 
      />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <EnhancedProductGrid
          products={products.slice(0, 8)}
          showSort={false}
          limit={4}
          showViewAll={true}
          viewAllLink={`/category/${category.slug}?tab=products`}
          viewAllLabel="View all products"
        />
      </div>
    </>
  );
};

export default CategoryOverview;
