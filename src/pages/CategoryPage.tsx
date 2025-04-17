import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { Product, Category, CategoryPageParams } from '@/types';
import { Filter, ChevronDown, ChevronUp, SlidersHorizontal, Loader2 } from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { fetchCategoryBySlug } from '@/services/categoryService';
import { Helmet } from 'react-helmet';
import React from 'react';

interface CategoryWithParent extends Category {
  parent?: CategoryWithParent;
}

interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

const CategoryPage = () => {
  const { categorySlug, parentCategorySlug } = useParams<CategoryPageParams>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<CategoryWithParent | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (parentCategorySlug && categorySlug) {
          const parentCategory = await fetchCategoryBySlug(parentCategorySlug);
          
          if (!parentCategory) {
            setError('Parent category not found');
            setLoading(false);
            return;
          }
          
          const childCategory = await fetchCategoryBySlug(categorySlug);
          
          if (!childCategory) {
            setError('Category not found');
            setLoading(false);
            return;
          }
          
          if (childCategory.parent_id !== parentCategory.id) {
            navigate(`/category/${categorySlug}`, { replace: true });
          }
          
          setCategory({
            ...childCategory,
            parent: parentCategory
          });
          
          await fetchProductsByCategory(childCategory.id);
        } else if (categorySlug) {
          const fetchedCategory = await fetchCategoryBySlug(categorySlug);
          
          if (!fetchedCategory) {
            setError('Category not found');
            setLoading(false);
            return;
          }
          
          if (fetchedCategory.parent_id) {
            const { data: parentData } = await supabase
              .from('categories')
              .select('*')
              .eq('id', fetchedCategory.parent_id)
              .maybeSingle();
              
            if (parentData) {
              setCategory({
                ...fetchedCategory,
                parent: parentData
              });
              
              navigate(`/${parentData.slug}/${fetchedCategory.slug}`, { replace: true });
            } else {
              setCategory(fetchedCategory);
            }
          } else {
            setCategory(fetchedCategory);
          }
          
          await fetchProductsByCategory(fetchedCategory.id);
        } else {
          setError('Category not specified');
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category');
        toast({
          title: "Error",
          description: "There was a problem loading the category data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [categorySlug, parentCategorySlug, navigate, toast]);

  const fetchProductsByCategory = async (categoryId: string) => {
    try {
      const { data: directProducts, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('category_id', categoryId)
        .range(
          (pagination.page - 1) * pagination.pageSize,
          pagination.page * pagination.pageSize - 1
        );
        
      if (error) throw error;
      
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoryId);
        
      let allProducts = directProducts || [];
      let totalCount = count || 0;
      
      if (subcategories && subcategories.length > 0) {
        const subcategoryIds = subcategories.map(sc => sc.id);
        
        const { count: subCount } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .in('category_id', subcategoryIds);
          
        totalCount += subCount || 0;
        
        const remainingItems = pagination.pageSize - allProducts.length;
        
        if (remainingItems > 0) {
          const { data: subcategoryProducts } = await supabase
            .from('products')
            .select('*')
            .in('category_id', subcategoryIds)
            .range(0, remainingItems - 1);
            
          if (subcategoryProducts) {
            allProducts = [...allProducts, ...subcategoryProducts];
          }
        }
      }
      
      setPagination({
        ...pagination,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / pagination.pageSize) || 1
      });
      
      const mappedProducts: Product[] = allProducts.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: Number(item.price),
        originalPrice: item.original_price ? Number(item.original_price) : undefined,
        images: item.images || [],
        categoryId: item.category_id,
        rating: item.rating || 0,
        reviewCount: item.review_count || 0,
        inStock: item.in_stock === true,
        stockQuantity: item.stock_quantity ?? (item.in_stock === true ? 10 : 0),
        badges: item.badges || [],
        slug: item.slug,
        features: item.features || [],
        specifications: convertSpecifications(item.specifications) || {},
        salesCount: item.sales_count || 0,
        createdAt: item.created_at || new Date().toISOString()
      }));
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "There was a problem loading the products. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const convertSpecifications = (specs: any): Record<string, string> => {
    if (typeof specs === 'object' && specs !== null) {
      const result: Record<string, string> = {};
      
      Object.entries(specs).forEach(([key, value]) => {
        result[key] = String(value);
      });
      
      return result;
    }
    
    return {};
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({...pagination, page: newPage});
      window.scrollTo({top: 0, behavior: 'smooth'});
      
      if (category) {
        fetchProductsByCategory(category.id);
      }
    }
  };

  const getCategoryUrl = (cat: CategoryWithParent) => {
    if (cat.parent) {
      return `/${cat.parent.slug}/${cat.slug}`;
    }
    return `/category/${cat.slug}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-lg">Loading category...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !category) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || 'Category not found'}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Link 
              to="/" 
              className="text-primary hover:underline flex items-center"
            >
              Return to homepage
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  const buildBreadcrumbCategories = (currentCategory: CategoryWithParent | undefined): CategoryWithParent[] => {
    if (!currentCategory) return [];
    
    const result: CategoryWithParent[] = [];
    let category: CategoryWithParent | undefined = currentCategory;
    
    while (category) {
      result.unshift(category);
      category = category.parent;
    }
    
    return result;
  };

  const breadcrumbCategories = buildBreadcrumbCategories(category);

  return (
    <Layout>
      <Helmet>
        <title>{category.name} - Digital Deals Hub</title>
        <meta name="description" content={category.description} />
      </Helmet>

      <div className="bg-white border-b">
        <div className="container-custom py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              
              {buildBreadcrumbCategories(category).map((cat, index) => {
                const isLast = index === buildBreadcrumbCategories(category).length - 1;
                
                return isLast ? (
                  <BreadcrumbItem key={cat.id}>
                    <BreadcrumbPage>{cat.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  <React.Fragment key={cat.id}>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={getCategoryUrl(cat)}>{cat.name}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] py-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-2">{category?.name}</h1>
          <p className="text-text-light">{category?.description}</p>
        </div>
      </div>
      
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
            >
              <div className="flex items-center">
                <SlidersHorizontal className="h-5 w-5 mr-2 text-text-light" />
                <span>Filters</span>
              </div>
              {showFilters ? (
                <ChevronUp className="h-5 w-5 text-text-light" />
              ) : (
                <ChevronDown className="h-5 w-5 text-text-light" />
              )}
            </button>
          </div>
          
          <div 
            className={`md:w-1/4 lg:w-1/5 ${showFilters ? 'block' : 'hidden'} md:block`}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">Under $25</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">$25 - $50</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">$50 - $100</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">Over $100</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Rating</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">4 Stars & Up</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">3 Stars & Up</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Availability</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-text-light">In Stock</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-3/4 lg:w-4/5">
            {products.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-text-light">{pagination.totalItems} products found</p>
                  <div className="flex items-center">
                    <span className="mr-2 text-text-light">Sort by:</span>
                    <select className="border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Recommended</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest</option>
                      <option>Rating</option>
                    </select>
                  </div>
                </div>
                
                <ProductGrid products={products} />
                
                {pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(pagination.page - 1)}
                            className={pagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: pagination.totalPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              isActive={pagination.page === i + 1}
                              onClick={() => handlePageChange(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(pagination.page + 1)}
                            className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-xl font-medium mb-2">No products found</p>
                <p className="text-text-light">
                  Try adjusting your filters or check back later for new products.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
