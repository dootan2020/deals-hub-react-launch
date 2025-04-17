
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import Layout from '@/components/layout/Layout';
import CategoryBreadcrumbs from '@/components/category/CategoryBreadcrumbs';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategoryProductsList from '@/components/category/CategoryProductsList';
import { CategoryPageParams } from '@/types';
import { useCategoryData } from '@/hooks/useCategoryData';

const CategoryPage = () => {
  const { categorySlug, parentCategorySlug } = useParams<CategoryPageParams>();
  const { 
    category, 
    products, 
    loading, 
    error, 
    pagination,
    handlePageChange
  } = useCategoryData({ categorySlug, parentCategorySlug });

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mr-3" />
            <p className="text-text-light">Loading products...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !category) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || 'Category not found'}</AlertDescription>
          </Alert>
          <div className="mt-8 text-center">
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const buildBreadcrumbCategories = () => {
    const result = [];
    if (category.parent) {
      result.push(category.parent);
    }
    result.push(category);
    return result;
  };

  return (
    <Layout>
      <Helmet>
        <title>{category.name} - Digital Deals Hub</title>
        <meta name="description" content={category.description} />
      </Helmet>

      <CategoryBreadcrumbs categories={buildBreadcrumbCategories()} />
      
      <CategoryHeader name={category.name} description={category.description} />
      
      <div className="container-custom py-12">
        <CategoryProductsList 
          products={products}
          totalProducts={pagination.totalItems}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </Layout>
  );
};

export default CategoryPage;
