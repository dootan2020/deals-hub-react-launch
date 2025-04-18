
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCategoryData } from '@/hooks/useCategoryData';
import ErrorState from '@/components/category/ErrorState';
import LoadingState from '@/components/category/LoadingState';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategoryOverview from '@/components/category/CategoryOverview';
import CategoryProductsTab from '@/components/category/CategoryProductsTab';
import CategoryDetailsTab from '@/components/category/CategoryDetailsTab';

const CategoryPage = () => {
  const { categorySlug, parentCategorySlug } = useParams();
  console.log('CategoryPage params:', { categorySlug, parentCategorySlug });
  
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
    totalProducts,
    handleSortChange,
    buildBreadcrumbs,
    subcategories,
    featuredProducts
  } = useCategoryData({ categorySlug, parentCategorySlug });
  
  console.log('CategoryPage useCategoryData result:', { 
    category, 
    loading, 
    error, 
    activeTab,
    productsCount: products?.length
  });
  
  return (
    <Layout>
      <div className="bg-section-primary py-16">
        <div className="container-custom">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} />
          ) : category ? (
            <>
              <CategoryHeader
                category={category}
                breadcrumbs={buildBreadcrumbs()}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              
              <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm mt-6">
                {activeTab === 'overview' && (
                  <CategoryOverview 
                    categorySlug={category.slug}
                    subcategories={subcategories}
                    featuredProducts={featuredProducts}
                  />
                )}
                {activeTab === 'products' && (
                  <CategoryProductsTab
                    products={products}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    activeFilters={activeFilters}
                    onSortChange={handleSortChange}
                    totalProducts={totalProducts}
                    loading={loading}
                  />
                )}
                {activeTab === 'details' && (
                  <CategoryDetailsTab category={category} />
                )}
              </div>
            </>
          ) : (
            <ErrorState error="Category not found" />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
