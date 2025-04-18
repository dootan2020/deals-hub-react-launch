
import { useState } from 'react';
import { Product } from '@/types';
import { ensureProductFields } from '@/utils/productUtils';
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
  const [products] = useState<Product[]>([
    ensureProductFields({
      id: "1",
      title: "Gmail Account",
      description: "Fresh Gmail account with full access",
      shortDescription: "Fresh Gmail account with full access",
      price: 599, // Price in cents
      images: ["/placeholder.svg"],
      categoryId: "email",
      inStock: true,
      stockQuantity: 100,
      badges: ["New"],
      slug: "gmail-account",
      features: ["Instant delivery", "Full access"],
      rating: 4.5,
      reviewCount: 10,
      salesCount: 0,
      createdAt: new Date().toISOString()
    })
  ]);

  return (
    <Layout>
      <HeroSection />
      <SearchSection />
      <CategorySection />
      <div className="bg-section-primary py-16">
        <div className="container-custom">
          <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
            <ProductGrid 
              products={products}
              title="Featured Products" 
              description="Check out our most popular digital products available now."
              showSort={true}
              activeSort={activeSort}
              onSortChange={setActiveSort}
              limit={8}
              showViewAll={true}
              viewAllLink={`/products?sort=${activeSort}`}
              viewAllLabel="View all products"
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

