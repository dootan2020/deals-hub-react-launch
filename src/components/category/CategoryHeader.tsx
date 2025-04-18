
import React from 'react';
import { CategoryWithParent } from '@/types/category.types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Link } from 'react-router-dom';

interface CategoryHeaderProps {
  category: CategoryWithParent;
  breadcrumbs: Array<{ name: string; slug: string }>;
  activeTab: string;
  onTabChange: (value: string) => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ 
  category, 
  breadcrumbs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/products">Products</BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.slug}>
            {index === breadcrumbs.length - 1 ? (
              <span>{crumb.name}</span>
            ) : (
              <BreadcrumbLink 
                as={Link} 
                to={`/category/${crumb.slug}`}
              >
                {crumb.name}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
      
      {/* Category Title */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 max-w-3xl">{category.description}</p>
        )}
      </div>
      
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CategoryHeader;
