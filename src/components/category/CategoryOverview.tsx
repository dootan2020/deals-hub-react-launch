
import React from 'react';
import { Link } from 'react-router-dom';
import { Category, Product } from '@/types';
import EnhancedProductGrid from '@/components/product/EnhancedProductGrid';
import SubcategoriesGrid from '@/components/category/SubcategoriesGrid';

interface CategoryOverviewProps {
  categorySlug: string;
  subcategories: Category[];
  featuredProducts: Product[];
}

const CategoryOverview: React.FC<CategoryOverviewProps> = ({ 
  categorySlug, 
  subcategories, 
  featuredProducts 
}) => {
  return (
    <>
      <SubcategoriesGrid 
        categorySlug={categorySlug} 
        subcategories={subcategories} 
      />
      
      {featuredProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <EnhancedProductGrid
            products={featuredProducts}
            showSort={false}
            limit={4}
            showViewAll={true}
            viewAllLink={`/category/${categorySlug}?tab=products`}
            viewAllLabel="View all products"
          />
        </div>
      )}
    </>
  );
};

export default CategoryOverview;
