import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Layout from '@/components/layout/Layout';
import CategoryBreadcrumbs from '@/components/category/CategoryBreadcrumbs';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategoryOverview from '@/components/category/CategoryOverview';
import CategoryProductsTab from '@/components/category/CategoryProductsTab';
import LoadingState from '@/components/category/LoadingState';
import ErrorState from '@/components/category/ErrorState';
import { CategoryPageParams } from '@/types/category.types';
import { useCategoryData } from '@/hooks/useCategoryData';

const CategoryPage = () => {
  const { categorySlug, parentCategorySlug } = useParams<CategoryPageParams>();
  const { 
    category,
    products,
    loading,
    error,
    pagination,
    handlePageChange,
    activeTab,
    setActiveTab,
    activeFilters,
    handleSortChange,
    buildBreadcrumbs,
    subcategories,
    featuredProducts
  } = useCategoryData({ categorySlug, parentCategorySlug });

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <LoadingState />
        </div>
      </Layout>
    );
  }

  if (error || !category) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <ErrorState error={error || 'Category not found'} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{category.name} - Digital Deals Hub</title>
        <meta 
          name="description" 
          content={category.description || `Explore the best digital ${category.name} products on Digital Deals Hub.`} 
        />
      </Helmet>

      <CategoryBreadcrumbs categories={buildBreadcrumbs()} />
      
      <CategoryHeader 
        name={category.name} 
        description={category.description}
      />
      
      <div className="container-custom py-12">
        {subcategories.length > 0 ? (
          <Tabs defaultValue={activeTab} className="mb-8" onValueChange={(value) => setActiveTab(value)}>
            <TabsList className="mb-6 md:mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">All Products</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <CategoryOverview 
                categorySlug={category.slug}
                subcategories={subcategories}
                featuredProducts={featuredProducts}
              />
            </TabsContent>
            
            <TabsContent value="products">
              <CategoryProductsTab 
                products={products}
                totalProducts={pagination.totalItems}
                activeSort={activeFilters.sort || 'recommended'}
                handleSortChange={handleSortChange}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <CategoryProductsTab 
            products={products}
            totalProducts={pagination.totalItems}
            activeSort={activeFilters.sort || 'recommended'}
            handleSortChange={handleSortChange}
          />
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
