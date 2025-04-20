import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { toast } from 'sonner';
import ProductSorter from '@/components/product/ProductSorter';
import ViewToggle from '@/components/product/ViewToggle';
import { Category, FilterParams, Product } from '@/types';
import SubcategoryPills from '@/components/category/SubcategoryPills';
import { SortOption } from '@/utils/productFilters';
import { fetchProductsWithFilters } from '@/services/product/productService';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCategoriesContext } from '@/context/CategoriesContext';
import PriceRangeFilter from '@/components/category/PriceRangeFilter';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, mainCategories, getSubcategoriesByParentId } = useCategoriesContext();
  
  // UI states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Product data
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage] = useState(24); // Increased from default 12
  
  // Filters
  const [filters, setFilters] = useState<FilterParams>({
    sort: (searchParams.get('sort') || 'newest') as string,
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('category') || undefined,
    inStock: searchParams.get('inStock') === 'true',
    priceRange: [0, 500],
    perPage: perPage
  });

  // Active subcategory
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | undefined>(
    searchParams.get('subcategory') || undefined
  );

  // Handle search param changes
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const sort = searchParams.get('sort');
    const inStock = searchParams.get('inStock') === 'true';
    
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      categoryId: category || undefined,
      sort: sort || 'newest',
      inStock
    }));

    setActiveSubcategoryId(subcategory || undefined);
    setPage(1);
  }, [searchParams]);

  // Fetch products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setProducts([]);
      
      try {
        const filterParams: FilterParams = {
          ...filters,
          page: 1,
          perPage: perPage
        };
        
        // If subcategory is selected, use that instead of category
        if (activeSubcategoryId) {
          filterParams.subcategory = activeSubcategoryId;
          // Remove categoryId to avoid conflicting filters
          delete filterParams.categoryId;
        }
        
        const result = await fetchProductsWithFilters(filterParams);
        
        setProducts(result.products || []);
        setHasMore((result.totalPages || 1) > 1);
        setTotalPages(result.totalPages || 1);
        setTotalProducts(result.total || 0);
      } catch (error) {
        console.error('Error loading products:', error);
        toast("Error", {
          description: "Failed to load products. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [filters.search, filters.categoryId, filters.inStock, filters.sort, filters.priceRange, activeSubcategoryId, perPage]);

  const loadMore = async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const filterParams: FilterParams = {
        ...filters,
        page: nextPage,
        perPage: perPage
      };
      
      // If subcategory is selected, use that instead of category
      if (activeSubcategoryId) {
        filterParams.subcategory = activeSubcategoryId;
        delete filterParams.categoryId;
      }
      
      const result = await fetchProductsWithFilters(filterParams);
      
      const newProducts = result.products || [];
      
      if (newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
        setHasMore(nextPage < (result.totalPages || 1));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      toast("Error", {
        description: "Failed to load more products. Please try again.",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSortChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', value);
    setSearchParams(newSearchParams);
  };

  const handleViewChange = (newView: 'grid' | 'list') => {
    setViewMode(newView);
  };

  const handleCategoryClick = (category: Category) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('category', category.id);
    // Clear subcategory when selecting a new category
    newSearchParams.delete('subcategory');
    setSearchParams(newSearchParams);
  };

  const handleSubcategoryClick = (subcategory: Category) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('subcategory', subcategory.id);
    setSearchParams(newSearchParams);
  };

  const handleInStockChange = (checked: boolean) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (checked) {
      newSearchParams.set('inStock', 'true');
    } else {
      newSearchParams.delete('inStock');
    }
    setSearchParams(newSearchParams);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  const clearFilters = () => {
    const newSearchParams = new URLSearchParams();
    if (searchParams.get('search')) {
      newSearchParams.set('search', searchParams.get('search')!);
    }
    if (searchParams.get('sort')) {
      newSearchParams.set('sort', searchParams.get('sort')!);
    }
    setSearchParams(newSearchParams);
  };

  // Get current category's subcategories
  const subcategories = filters.categoryId 
    ? getSubcategoriesByParentId(filters.categoryId)
    : [];

  const hasActiveFilters = Boolean(filters.categoryId || activeSubcategoryId || filters.inStock || 
    (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 500)));
    
  const pageTitle = filters.search 
    ? `Search results: ${filters.search}` 
    : activeSubcategoryId
      ? categories.find(c => c.id === activeSubcategoryId)?.name || 'Subcategory Products'
      : filters.categoryId
        ? categories.find(c => c.id === filters.categoryId)?.name || 'Category Products'
        : 'All Products';

  return (
    <Layout>
      <div className="bg-background py-8 min-h-screen">
        <div className="container-custom">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{pageTitle}</h1>
              <p className="text-muted-foreground">
                {filters.search 
                  ? `Products related to "${filters.search}"`
                  : 'Explore our collection of digital products'
                }
              </p>
            </div>

            {/* Category Filter Card */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              {/* Main Categories */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {mainCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        filters.categoryId === category.id
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {category.name}
                      {category.count > 0 && (
                        <span className="ml-2 text-xs opacity-75">
                          ({category.count})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories (if a category is selected) */}
              {filters.categoryId && subcategories.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-4">Subcategories</h3>
                  <div className="flex flex-wrap gap-2">
                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleSubcategoryClick(subcategory)}
                        className={cn(
                          "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                          activeSubcategoryId === subcategory.id
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        {subcategory.name}
                        {subcategory.count > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({subcategory.count})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-6">
              {/* Sort & View Options */}
              <div className="flex justify-between items-center">
                <ProductSorter 
                  currentSort={filters.sort as SortOption} 
                  onSortChange={handleSortChange} 
                />
                <ViewToggle 
                  currentView={viewMode}
                  onViewChange={handleViewChange}
                />
              </div>

              {/* Product Count Display */}
              {!isLoading && (
                <div className="text-sm text-muted-foreground mb-4">
                  Showing {products.length} of {totalProducts} products
                </div>
              )}

              {/* Products Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              ) : products.length > 0 ? (
                <ProductGrid 
                  products={products}
                  viewMode={viewMode}
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                />
              ) : (
                <div className="text-center py-16 space-y-3">
                  <h3 className="text-lg font-medium">No products found matching your criteria.</h3>
                  <p className="text-muted-foreground">Try searching with different keywords or adjusting your filters.</p>
                  {hasActiveFilters && (
                    <Button 
                      variant="outline" 
                      onClick={clearFilters} 
                      className="mt-4"
                    >
                      Clear filters and try again
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
