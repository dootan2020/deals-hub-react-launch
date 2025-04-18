
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';
import { useCategoryData } from '@/hooks/useCategoryData';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import CategoryFilters from '@/components/category/CategoryFilters';
import LoadingState from '@/components/category/LoadingState';
import ErrorState from '@/components/category/ErrorState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryOverview from '@/components/category/CategoryOverview';
import { CategoryProductsTab } from '@/components/category/CategoryProductsTab';
import { CategoryDetailsTab } from '@/components/category/CategoryDetailsTab';
import CategoryBreadcrumbs from '@/components/category/CategoryBreadcrumbs';
import SubcategoriesGrid from '@/components/category/SubcategoriesGrid';
import EmptyProductsState from '@/components/category/EmptyProductsState';
import { FilterParams } from '@/types';

const CategoryPage = () => {
  const { categorySlug, parentCategorySlug } = useParams();
  const [activeFilters, setActiveFilters] = useState<FilterParams>({ sort: 'recommended' });
  
  const { 
    category, 
    products, 
    loading, 
    error, 
    pagination, 
    handlePageChange, 
    activeTab, 
    setActiveTab, 
    subcategories,
    buildBreadcrumbs,
    isProductsPage,
    handleSortChange
  } = useCategoryData({ categorySlug, parentCategorySlug });

  const breadcrumbs = buildBreadcrumbs();
  const pageTitle = category ? category.name : isProductsPage ? 'All Products' : 'Category';
  const pageDescription = category?.description || 'Browse our selection of digital products';
  
  // Determine if this is the /products page (no category)
  const showAllProducts = isProductsPage;

  const handleFilterChange = (filters: FilterParams) => {
    setActiveFilters(filters);
    // Apply other filter functionality as needed
    if (filters.sort) {
      handleSortChange(filters.sort);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle} - Digital Deals Hub</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <div className="bg-white border-b">
        <div className="container-custom py-3">
          <CategoryBreadcrumbs breadcrumbs={breadcrumbs} showAllProducts={showAllProducts} />
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="bg-section-primary min-h-screen">
          <div className="container-custom py-10">
            {showAllProducts ? (
              // All Products View
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h1 className="text-3xl font-bold mb-2">All Products</h1>
                <p className="text-gray-600 mb-6">
                  Browse our complete collection of digital products
                </p>
                
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-1/4">
                    <CategoryFilters 
                      onFilterChange={handleFilterChange} 
                      activeFilters={activeFilters} 
                    />
                  </div>
                  
                  <div className="w-full lg:w-3/4">
                    {products.length > 0 ? (
                      <CategoryProductsTab
                        category={null}
                        products={products}
                        isLoading={loading}
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                      />
                    ) : (
                      <EmptyProductsState />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Specific Category View
              category && (
                <>
                  <CategoryHeader 
                    category={category} 
                  />
                  
                  {subcategories && subcategories.length > 0 && (
                    <div className="mt-10">
                      <SubcategoriesGrid 
                        categorySlug={category.slug} 
                        subcategories={subcategories} 
                      />
                    </div>
                  )}
                  
                  <Tabs 
                    className="mt-10" 
                    value={activeTab} 
                    onValueChange={setActiveTab}
                  >
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <TabsList className="mb-6 bg-gray-100">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview">
                        <CategoryOverview 
                          category={category}
                          products={products.slice(0, 4)}
                        />
                      </TabsContent>
                      
                      <TabsContent value="products">
                        <CategoryProductsTab 
                          category={category}
                          products={products}
                          isLoading={loading} 
                          currentPage={pagination.page}
                          totalPages={pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </TabsContent>
                      
                      <TabsContent value="details">
                        <CategoryDetailsTab category={category} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </>
              )
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CategoryPage;
