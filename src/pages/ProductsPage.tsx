
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import SimplifiedCategoryFilters from '@/components/category/SimplifiedCategoryFilters';
import ViewToggle from '@/components/category/ViewToggle';
import { Product } from '@/types';
import { ensureProductsFields } from '@/utils/productUtils';
import { useToast } from "@/components/ui/use-toast";
import { fetchProductsWithFilters } from '@/services/productService';
import { Loader2 } from 'lucide-react';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeSort, setActiveSort] = useState(searchParams.get('sort') || 'recommended');
  
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Mock products for development
        const mockProducts = [
          {
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
          },
          {
            id: "2",
            title: "Twitter Account",
            description: "Verified Twitter account with followers",
            shortDescription: "Verified Twitter account with followers",
            price: 1999,
            images: ["/placeholder.svg"],
            categoryId: "social",
            inStock: true,
            stockQuantity: 50,
            badges: ["Hot"],
            slug: "twitter-account",
            features: ["Instant delivery", "Verified status"],
            rating: 4.7,
            reviewCount: 23,
            salesCount: 0,
            createdAt: new Date().toISOString()
          },
          {
            id: "3",
            title: "Office 365 License",
            description: "Lifetime Microsoft Office 365 license",
            shortDescription: "Lifetime Microsoft Office 365 license",
            price: 2999,
            images: ["/placeholder.svg"],
            categoryId: "software",
            inStock: true,
            stockQuantity: 200,
            badges: ["Best Seller"],
            slug: "office-365-license",
            features: ["Lifetime access", "All Office apps"],
            rating: 4.9,
            reviewCount: 156,
            salesCount: 0,
            createdAt: new Date().toISOString()
          }
        ];
        
        const validProducts = ensureProductsFields(mockProducts);
        setProducts(validProducts);
        
        // Uncomment the following when you want to fetch real data
        /*
        const result = await fetchProductsWithFilters({
          sort: activeSort,
          page: 1,
          limit: 24
        });
        
        if (result && Array.isArray(result.products)) {
          const validProducts = ensureProductsFields(result.products);
          setProducts(validProducts);
        }
        */
      } catch (err) {
        console.error("Error loading products:", err);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [activeSort, toast]);
  
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  return (
    <Layout>
      <div className="bg-section-primary py-16">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">All Products</h1>
            <div className="flex items-center gap-4">
              <SimplifiedCategoryFilters 
                onSortChange={setActiveSort}
                activeSort={activeSort}
              />
              <ViewToggle 
                currentView={viewMode} 
                onViewChange={toggleViewMode}
              />
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            ) : (
              <ProductGrid 
                products={products}
                showSort={true}
                activeSort={activeSort}
                onSortChange={setActiveSort}
                viewMode={viewMode}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
