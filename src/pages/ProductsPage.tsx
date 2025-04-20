import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();
  const { categories, mainCategories } = useCategoriesContext();
  
  // UI states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Product data
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Filters
  const [filters, setFilters] = useState<FilterParams>({
    sort: (searchParams.get('sort') || 'newest') as string,
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('category') || undefined,
    inStock: searchParams.get('inStock') === 'true',
    priceRange: [0, 500]
  });

  // Handle search param changes
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    const inStock = searchParams.get('inStock') === 'true';
    
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      categoryId: category || undefined,
      sort: sort || 'newest',
      inStock
    }));
    
    setPage(1);
  }, [searchParams]);

  // Fetch products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setProducts([]);
      
      try {
        const result = await fetchProductsWithFilters({
          ...filters,
          page: 1,
        });
        
        setProducts(result.products || []);
        setHasMore((result.products || []).length === 12);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [filters.search, filters.categoryId, filters.inStock, filters.sort, filters.priceRange]);

  const loadMore = async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const result = await fetchProductsWithFilters({
        ...filters,
        page: nextPage,
      });
      
      const newProducts = result.products || [];
      
      if (newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
        setHasMore(newProducts.length === 12);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thêm sản phẩm. Vui lòng thử lại sau.",
        variant: "destructive"
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

  const subcategories = categories.filter(cat => !cat.parent_id);
  const hasActiveFilters = Boolean(filters.categoryId || filters.inStock || 
    (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 500)));
  const pageTitle = filters.search ? `Kết quả tìm kiếm: ${filters.search}` : 'Tất cả sản phẩm';

  return (
    <Layout>
      <div className="bg-background py-8 min-h-screen">
        <div className="container-custom">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">{pageTitle}</h1>
              <p className="text-muted-foreground">
                {filters.search 
                  ? `Sản phẩm liên quan đến từ khóa "${filters.search}"`
                  : 'Khám phá bộ sưu tập sản phẩm số của chúng tôi'
                }
              </p>
            </div>

            {/* Mobile Filter Button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Bộ lọc & Sắp xếp
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
                    <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
                    <SheetDescription>
                      Tùy chỉnh kết quả hiển thị theo nhu cầu của bạn
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-4">
                    {/* Mobile Sorting */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="sort">
                        <AccordionTrigger>Sắp xếp theo</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {[
                              { label: 'Mới nhất', value: 'newest' },
                              { label: 'Phổ biến nhất', value: 'popular' },
                              { label: 'Giá: Thấp đến cao', value: 'price-low' },
                              { label: 'Giá: Cao đến thấp', value: 'price-high' },
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
                        <AccordionTrigger>Danh mục sản phẩm</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {subcategories.map((category) => (
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
                    
                    {/* Mobile Price Range */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="price">
                        <AccordionTrigger>Khoảng giá</AccordionTrigger>
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
                      <Label htmlFor="mobile-in-stock">Chỉ hiển thị sản phẩm còn hàng</Label>
                    </div>
                    
                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <div className="p-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={clearFilters} 
                          className="w-full"
                        >
                          Xóa tất cả bộ lọc
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
                  <h3 className="font-semibold text-lg mb-4">Bộ lọc</h3>
                  
                  {/* Categories */}
                  <div>
                    <h4 className="font-medium mb-2">Danh mục</h4>
                    <div className="space-y-2">
                      {subcategories.map((category) => (
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
                    <h4 className="font-medium mb-2">Tình trạng</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="in-stock" 
                        checked={filters.inStock}
                        onCheckedChange={handleInStockChange}
                      />
                      <Label htmlFor="in-stock">Chỉ hiển thị còn hàng</Label>
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
                        Xóa tất cả bộ lọc
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
                      <h3 className="text-lg font-medium">Không tìm thấy sản phẩm phù hợp.</h3>
                      <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
                      {hasActiveFilters && (
                        <Button 
                          variant="outline" 
                          onClick={clearFilters} 
                          className="mt-4"
                        >
                          Xóa bộ lọc và thử lại
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
