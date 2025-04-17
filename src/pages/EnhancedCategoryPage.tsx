
import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';
import { CategoryPageParams } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Imported components after refactoring
import CategoryBreadcrumbs from '@/components/category/CategoryBreadcrumbs';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategoryOverview from '@/components/category/CategoryOverview';
import CategoryProductsTab from '@/components/category/CategoryProductsTab';
import LoadingState from '@/components/category/LoadingState';
import ErrorState from '@/components/category/ErrorState';

// Custom hook
import { useCategoryData } from '@/hooks/useCategoryData';

const EnhancedCategoryPage = () => {
  const { categorySlug, parentCategorySlug } = useParams<CategoryPageParams>();
  
  const {
    category,
    products,
    featuredProducts,
    subcategories,
    loading,
    error,
    activeTab,
    setActiveTab,
    activeFilters,
    totalProducts,
    handleSortChange,
    buildBreadcrumbs
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
        <title>{category ? category.name : 'Category'} - Digital Deals Hub</title>
        <meta 
          name="description" 
          content={category ? (category.description || `Explore the best digital ${category.name} products on Digital Deals Hub.`) : 'Explore our product categories'} 
        />
      </Helmet>
      
      <CategoryBreadcrumbs breadcrumbs={buildBreadcrumbs()} />
      
      <CategoryHeader 
        name={category.name} 
        description={category.description}
      />
      
      <div className="container-custom py-12">
        {subcategories.length > 0 && (
          <Tabs defaultValue="overview" className="mb-8" onValueChange={(value) => setActiveTab(value)}>
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
                totalProducts={totalProducts}
                activeSort={activeFilters.sort || 'recommended'}
                handleSortChange={handleSortChange}
              />
            </TabsContent>
          </Tabs>
        )}
        
        {subcategories.length === 0 && (
          <div>
            <CategoryProductsTab 
              products={products}
              totalProducts={totalProducts}
              activeSort={activeFilters.sort || 'recommended'}
              handleSortChange={handleSortChange}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnhancedCategoryPage;
