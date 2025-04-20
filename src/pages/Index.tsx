
import { useState, useEffect } from 'react';
import { fetchProductsWithFilters } from '@/services/product/productService';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import SearchSection from '@/components/home/SearchSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProductGrid from '@/components/product/ProductGrid';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import { toast } from 'sonner';

const Index = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState('recommended');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProductsWithFilters({
          sort: activeSort,
        });
        
        console.log('Featured products in Index page:', fetchedProducts.map(p => ({
          title: p.title,
          kiosk_token: p.kiosk_token ? 'present' : 'missing'
        })));
        
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        toast('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeSort]);

  return (
    <Layout>
      <HeroSection />
      <SearchSection />
      <CategorySection />
      <div className="bg-section-primary py-16">
        <div className="container-custom">
          <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
            <ProductGrid 
              products={products.slice(0, 8)}
              title="Featured Products" 
              description="Check out our most popular digital products available now."
              showSort={true}
              activeSort={activeSort}
              onSortChange={setActiveSort}
              isLoading={loading}
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
