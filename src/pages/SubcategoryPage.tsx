import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProductsWithFilters } from '@/services/productService';
import { Product } from '@/types';
import { CategoryWithParent } from '@/types/category.types';
import { ensureProductsFields } from '@/utils/productUtils';
import { SubcategoryHeader } from '@/components/category/SubcategoryHeader';
import SubcategoryFilters from '@/components/category/SubcategoryFilters';
import PriceRangeFilter from '@/components/category/PriceRangeFilter';
import StockFilter from '@/components/category/StockFilter';
import { FAQ } from '@/components/category/FAQ';
import { SupportSection } from '@/components/category/SupportSection';
import { SortOption } from '@/utils/productFilters';

const SubcategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [stockFilter, setStockFilter] = useState("all");
  
  const mockSubcategories = [
    { id: "1", name: "Gmail", description: "", slug: "gmail", image: "", count: 5, parent_id: null },
    { id: "2", name: "Hotmail", description: "", slug: "hotmail", image: "", count: 3, parent_id: null },
    { id: "3", name: "Yahoo", description: "", slug: "yahoo", image: "", count: 2, parent_id: null },
  ];
  
  const [activeSubcategories, setActiveSubcategories] = useState<string[]>([]);
  
  useEffect(() => {
    const loadProducts = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchProductsWithFilters({
          subcategory: slug,
          page: currentPage,
          perPage: 12,
          sort: sortOption,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          inStock: stockFilter === "in-stock" ? true : undefined
        });
        
        if (result && Array.isArray(result.products)) {
          const validProducts = ensureProductsFields(result.products);
          setProducts(validProducts);
          setTotalPages(result.totalPages || 1);
          
          if (result.products.length === 0 && currentPage > 1) {
            setCurrentPage(1);
          }
        } else {
          setProducts([]);
          setTotalPages(1);
          console.warn("Unexpected response format:", result);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [slug, currentPage, sortOption, priceRange, stockFilter, activeSubcategories]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const handleSubcategoryToggle = (id: string) => {
    setActiveSubcategories(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  const handleSortChange = (sortValue: string) => {
    setSortOption(sortValue as SortOption);
    setCurrentPage(1);
  };
  
  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    setCurrentPage(1);
  };
  
  const handleStockFilterChange = (value: string) => {
    setStockFilter(value);
    setCurrentPage(1);
  };

  const mockCategory: CategoryWithParent = {
    id: slug || 'default-id',
    name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Products',
    description: 'Browse our collection of email products and services. We offer high-quality, secure accounts for your personal and business needs.',
    slug: slug || 'default-slug',
    image: '',
    count: products.length,
    parent_id: 'emails',
    parent: {
      id: 'emails',
      name: 'Email Accounts',
      slug: 'emails',
      description: 'All email accounts',
      image: '',
      count: 0
    }
  };
  
  if (error) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">Error</h2>
            <p className="mt-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-6"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            <SubcategoryHeader
              category={mockCategory}
              productCount={products.length}
            />
            
            <div className="lg:flex gap-8">
              <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="bg-card rounded-lg p-6 shadow-sm sticky top-24">
                  <h3 className="font-semibold text-lg mb-4">Filters</h3>
                  
                  {mockSubcategories.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm mb-3">Subcategories</h4>
                      <div className="space-y-2">
                        {mockSubcategories.map((subcategory) => (
                          <button
                            key={subcategory.id}
                            onClick={() => handleSubcategoryToggle(subcategory.id)}
                            className={`flex items-center justify-between w-full p-2 rounded-md text-left text-sm ${
                              activeSubcategories.includes(subcategory.id) 
                                ? 'bg-primary/10 text-primary' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span>{subcategory.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <PriceRangeFilter 
                      minPrice={priceRange[0]} 
                      maxPrice={priceRange[1]} 
                      onPriceChange={handlePriceChange} 
                    />
                  </div>
                  
                  <div className="mb-2">
                    <StockFilter 
                      stockFilter={stockFilter} 
                      onStockFilterChange={handleStockFilterChange} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex-grow">
                <SubcategoryFilters
                  subcategories={mockSubcategories}
                  activeSubcategories={activeSubcategories}
                  onSubcategoryToggle={handleSubcategoryToggle}
                  onSortChange={handleSortChange}
                  activeSort={sortOption}
                  onPriceChange={handlePriceChange}
                  onStockFilterChange={handleStockFilterChange}
                  stockFilter={stockFilter}
                  minPrice={priceRange[0]}
                  maxPrice={priceRange[1]}
                />
                
                <ProductGrid 
                  products={products} 
                  showSort={false}
                  isLoading={isLoading}
                  viewMode={viewMode}
                />
                
                {products.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm nào</h3>
                    <p className="text-text-light mb-8">Vui lòng thử lại với các bộ lọc khác hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                    <SupportSection />
                  </div>
                )}
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                      {Array(totalPages).fill(0).map((_, i) => (
                        <Button
                          key={i}
                          variant={currentPage === i + 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <FAQ />
            
            {products.length > 0 && <SupportSection />}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SubcategoryPage;
