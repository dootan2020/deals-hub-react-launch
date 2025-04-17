
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import SearchSection from '@/components/home/SearchSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProductGrid from '@/components/product/ProductGrid';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import NewsletterSection from '@/components/home/NewsletterSection';

const Index = () => {
  const [activeSort, setActiveSort] = useState('recommended');

  return (
    <Layout>
      <HeroSection />
      <SearchSection />
      <CategorySection />
      <div className="bg-section-primary py-16">
        <div className="container-custom">
          <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
            <ProductGrid 
              title="Featured Products" 
              description="Check out our most popular digital products available now."
              showSort={true}
              activeSort={activeSort}
              onSortChange={setActiveSort}
              limit={8} // Limit to 8 products (2 rows of 4)
              showViewAll={true}
              viewAllLink={`/products?sort=${activeSort}`}
              viewAllLabel="Xem tất cả sản phẩm"
            />
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
