
import React from 'react';
import { CategoryWithParent } from '@/types/category.types';
import CategoryBreadcrumbs from './CategoryBreadcrumbs';

interface SubcategoryHeaderProps {
  category: CategoryWithParent;
  productCount: number;
}

export const SubcategoryHeader = ({ category, productCount }: SubcategoryHeaderProps) => {
  return (
    <div className="mb-8">
      <CategoryBreadcrumbs 
        breadcrumbs={category.parent ? [category.parent, category] : [category]} 
      />
      <h1 className="text-3xl font-bold mt-4 mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-text-light mb-4">{category.description}</p>
      )}
      <p className="text-sm text-muted-foreground">
        Hiển thị {productCount} sản phẩm
      </p>
    </div>
  );
};
