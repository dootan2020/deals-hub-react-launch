
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import { CategoryOverview } from '@/components/category/CategoryOverview';
import { CategoryProductsTab } from '@/components/category/CategoryProductsTab';
import { CategoryDetailsTab } from '@/components/category/CategoryDetailsTab';
import { LoadingState } from '@/components/category/LoadingState';
import { ErrorState } from '@/components/category/ErrorState';
import { useCategory } from '@/hooks/useCategory';
import { useCategoryProducts } from '@/hooks/useCategoryProducts';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    category,
    isLoading: isCategoryLoading,
    error: categoryError
  } = useCategory(slug || '');
  
  const {
    products,
    isLoading: isProductsLoading,
    error: productsError,
    pagination,
    setPage
  } = useCategoryProducts(slug || '');

  // Add console logging for debugging
  useEffect(() => {
    console.log('Category data:', category);
    console.log('Products data:', products);
    console.log('Pagination:', pagination);
  }, [category, products, pagination]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const isLoading = isCategoryLoading || isProductsLoading;
  const hasError = categoryError || productsError;

  // If a category slug was provided but it's not found, show error
  if (slug && !isLoading && !category) {
    return (
      <Layout>
        <ErrorState 
          title="Category Not Found" 
          message="The category you're looking for doesn't exist or has been removed."
        />
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  if (hasError) {
    return (
      <Layout>
        <ErrorState 
          title="Something Went Wrong" 
          message="We encountered an error while loading this category. Please try again later."
        />
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <ErrorState 
          title="Category Not Available" 
          message="Category information is not available at this time."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <CategoryHeader category={category} />
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <CategoryOverview category={category} products={products.slice(0, 8)} />
          </TabsContent>
          
          <TabsContent value="products" className="mt-6">
            <CategoryProductsTab 
              category={category} 
              products={products}
              isLoading={isProductsLoading}
              currentPage={pagination?.currentPage || 1}
              totalPages={pagination?.totalPages || 1}
              onPageChange={setPage}
            />
          </TabsContent>
          
          <TabsContent value="details" className="mt-6">
            <CategoryDetailsTab category={category} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CategoryPage;
