
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
import { toast } from '@/hooks/use-toast';
import { Product, SortOption } from '@/types';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // Update to use a valid SortOption
  const [activeSort, setActiveSort] = useState<SortOption>('newest');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await fetchProductsWithFilters({
          sort: activeSort,
        });
        
        if (Array.isArray(result)) {
          setProducts(result);
        } else if (result && Array.isArray(result.products)) {
          setProducts(result.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
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
      <div className="bg-section-primary py-8 md:py-16">
        <div className="container-custom">
          <div className="bg-white p-4 md:p-8 rounded-lg border border-gray-100 shadow-sm">
            <ProductGrid 
              products={products.slice(0, 8)}
              title="Featured Products" 
              description="Check out our most popular digital products available now."
              showSort={true}
              activeSort={activeSort}
              onSortChange={(sort) => setActiveSort(sort as SortOption)}
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
