
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import SearchSection from '@/components/home/SearchSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProductGrid from '@/components/product/ProductGrid';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import { useState } from 'react';

const Index = () => {
  const [activeSort, setActiveSort] = useState('recommended');

  return (
    <Layout>
      <HeroSection />
      <SearchSection />
      <CategorySection />
      <div className="bg-white py-16">
        <div className="container-custom">
          <ProductGrid 
            title="Featured Products" 
            description="Check out our most popular digital products available now."
            showSort={true}
            activeSort={activeSort}
            onSortChange={setActiveSort}
          />
        </div>
      </div>
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </Layout>
  );
};

export default Index;
