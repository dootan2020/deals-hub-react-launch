
import React from 'react';
import { CategoryWithParent } from '@/types/category.types';

interface CategoryDetailsTabProps {
  category: CategoryWithParent;
}

const CategoryDetailsTab: React.FC<CategoryDetailsTabProps> = ({ category }) => {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">Category Details</h2>
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-lg">{category.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Slug</dt>
              <dd className="mt-1 text-lg">{category.slug}</dd>
            </div>
            {category.description && (
              <div className="col-span-1 md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1">{category.description}</dd>
              </div>
            )}
            {category.parent && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent Category</dt>
                <dd className="mt-1 text-lg">{category.parent.name}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">ID</dt>
              <dd className="mt-1 text-lg">{category.id}</dd>
            </div>
          </dl>
        </div>
      </section>
      
      {category.meta_description && (
        <section>
          <h3 className="text-xl font-bold mb-2">SEO Information</h3>
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100">
            <h4 className="font-medium text-gray-700 mb-1">Meta Description</h4>
            <p className="text-gray-600">{category.meta_description}</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default CategoryDetailsTab;
