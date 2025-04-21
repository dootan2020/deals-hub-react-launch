
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import SearchSection from '@/components/home/SearchSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProductGrid from '@/components/product/ProductGrid';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import { useLoadHomePage } from '@/hooks/useLoadHomePage';

const Index = () => {
  const { 
    products, 
    isLoadingProducts, 
    productsError,
    activeSort,
    setActiveSort,
    refreshData
  } = useLoadHomePage();

  // Hàm retry khi có lỗi
  const handleRetry = async () => {
    await refreshData();
  };

  return (
    <Layout>
      <HeroSection />
      <SearchSection />
      <CategorySection />
      <div className="bg-section-primary py-8 md:py-16">
        <div className="container-custom">
          <div className="bg-white p-4 md:p-8 rounded-lg border border-gray-100 shadow-sm">
            {/* Hiển thị lỗi nếu có */}
            {productsError && !isLoadingProducts && (
              <div className="text-center py-8 flex flex-col items-center">
                <p className="text-destructive mb-4">{productsError}</p>
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="flex gap-2 items-center"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tải lại
                </Button>
              </div>
            )}
            
            {/* Hiển thị grid sản phẩm */}
            {!productsError && (
              <ProductGrid 
                products={products.slice(0, 8)}
                title="Featured Products" 
                description="Check out our most popular digital products available now."
                showSort={true}
                activeSort={activeSort}
                onSortChange={(sort) => setActiveSort(sort as any)}
                isLoading={isLoadingProducts}
                showViewAll={products.length > 8}
                viewAllLink={`/products?sort=${activeSort}`}
                viewAllLabel="View all products"
              />
            )}
          </div>
        </div>
      </div>
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </Layout>
  );
};

export default Index;
