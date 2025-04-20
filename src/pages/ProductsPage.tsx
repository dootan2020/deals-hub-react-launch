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
            <div>
              <h1 className="text-3xl font-bold mb-4">{pageTitle}</h1>
              <p className="text-muted-foreground">
                {filters.search 
                  ? `Products related to "${filters.search}"`
                  : 'Explore our collection of digital products'
                }
              </p>
            </div>

            {/* Display subcategory pills if a main category is selected */}
            {filters.categoryId && (getSubcategoriesByParentId(filters.categoryId)?.length || 0) > 0 && (
              <SubcategoryPills 
                subcategories={getSubcategoriesByParentId(filters.categoryId)} 
                onSubcategoryClick={handleSubcategoryClick}
              />
            )}

            {/* Mobile Filter Button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters & Sort
                    </span>
                    {hasActiveFilters && (
                      <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        !
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                
                <SheetContent side="bottom" className="h-[85vh]">
                  <SheetHeader className="mb-2">
                    <SheetTitle>Product Filters</SheetTitle>
                    <SheetDescription>
                      Customize results to match your needs
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-4">
                    {/* Mobile Sorting */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="sort">
                        <AccordionTrigger>Sort by</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {[
                              { label: 'Newest', value: 'newest' },
                              { label: 'Most Popular', value: 'popular' },
                              { label: 'Price: Low to High', value: 'price-low' },
                              { label: 'Price: High to Low', value: 'price-high' },
                            ].map((option) => (
                              <div 
                                key={option.value} 
                                className={`p-2 rounded-md cursor-pointer ${
                                  filters.sort === option.value 
                                    ? 'bg-primary/10 text-primary font-medium' 
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => handleSortChange(option.value)}
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {/* Mobile Categories */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="categories">
                        <AccordionTrigger>Categories</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {mainCategories.map((category) => (
                              <div 
                                key={category.id} 
                                className={`p-2 rounded-md cursor-pointer ${
                                  filters.categoryId === category.id 
                                    ? 'bg-primary/10 text-primary font-medium' 
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => handleCategoryClick(category)}
                              >
                                {category.name}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {/* Mobile Subcategories (if a category is selected) */}
                    {filters.categoryId && subcategories.length > 0 && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="subcategories">
                          <AccordionTrigger>Subcategories</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {subcategories.map((subcategory) => (
                                <div 
                                  key={subcategory.id} 
                                  className={`p-2 rounded-md cursor-pointer ${
                                    activeSubcategoryId === subcategory.id 
                                      ? 'bg-primary/10 text-primary font-medium' 
                                      : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleSubcategoryClick(subcategory)}
                                >
                                  {subcategory.name}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                    
                    {/* Mobile Price Range */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="price">
                        <AccordionTrigger>Price Range</AccordionTrigger>
                        <AccordionContent>
                          <PriceRangeFilter 
                            minPrice={0} 
                            maxPrice={500} 
                            onPriceChange={handlePriceRangeChange}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {/* Mobile Inventory Filter */}
                    <div className="flex items-center space-x-2 p-4 border-t">
                      <Checkbox 
                        id="mobile-in-stock" 
                        checked={filters.inStock}
                        onCheckedChange={handleInStockChange}
                      />
                      <Label htmlFor="mobile-in-stock">Show in-stock products only</Label>
                    </div>
                    
                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <div className="p-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={clearFilters} 
                          className="w-full"
                        >
                          Clear all filters
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Desktop Sidebar Filters */}
              <div className="hidden md:block w-64 shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-6">
                  <h3 className="font-semibold text-lg mb-4">Filters</h3>
                  
                  {/* Categories */}
                  <div>
                    <h4 className="font-medium mb-2">Categories</h4>
                    <div className="space-y-2">
                      {mainCategories.map((category) => (
                        <div 
                          key={category.id} 
                          className={`flex items-center p-1.5 rounded-md cursor-pointer text-sm ${
                            filters.categoryId === category.id 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => handleCategoryClick(category)}
                        >
                          {category.name}
                          {category.count > 0 && (
                            <span className="ml-auto text-xs text-text-light">{category.count}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Subcategories (if a category is selected) */}
                  {filters.categoryId && subcategories.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Subcategories</h4>
                      <div className="space-y-2">
                        {subcategories.map((subcategory) => (
                          <div 
                            key={subcategory.id} 
                            className={`flex items-center p-1.5 rounded-md cursor-pointer text-sm ${
                              activeSubcategoryId === subcategory.id 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => handleSubcategoryClick(subcategory)}
                          >
                            {subcategory.name}
                            {subcategory.count > 0 && (
                              <span className="ml-auto text-xs text-text-light">{subcategory.count}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Price Range */}
                  <div className="border-t pt-4">
                    <PriceRangeFilter
                      minPrice={0}
                      maxPrice={500}
                      onPriceChange={handlePriceRangeChange}
                    />
                  </div>
                  
                  {/* Inventory */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Availability</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="in-stock" 
                        checked={filters.inStock}
                        onCheckedChange={handleInStockChange}
                      />
                      <Label htmlFor="in-stock">Show in-stock only</Label>
                    </div>
                  </div>
                  
                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="border-t pt-4">
                      <Button 
                        variant="outline" 
                        onClick={clearFilters} 
                        className="w-full"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Product Grid */}
              <div className="flex-1">
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-6">
                  {/* Desktop Sort & View Options */}
                  <div className="hidden md:flex justify-between items-center">
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

                  {/* Product Grid */}
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
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
