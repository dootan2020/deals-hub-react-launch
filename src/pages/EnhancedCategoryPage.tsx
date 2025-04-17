import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { fetchCategoryBySlug } from '@/services/categoryService';
import { CategoryPageParams, Category, Product, FilterParams } from '@/types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator,
  BreadcrumbPage 
} from '@/components/ui/breadcrumb';

import EnhancedProductGrid from '@/components/product/EnhancedProductGrid';
import EnhancedCategoryFilters from '@/components/category/EnhancedCategoryFilters';

interface CategoryWithParent extends Category {
  parent?: CategoryWithParent;
  subcategories?: Category[];
}

const EnhancedCategoryPage = () => {
  const { categorySlug, parentCategorySlug } = useParams<CategoryPageParams>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [category, setCategory] = useState<CategoryWithParent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('products');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterParams>({
    sort: 'recommended',
  });
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Case 1: Parent category and subcategory
        if (parentCategorySlug && categorySlug) {
          const parentCat = await fetchCategoryBySlug(parentCategorySlug);
          if (!parentCat) throw new Error("Parent category not found");
          
          const childCat = await fetchCategoryBySlug(categorySlug);
          if (!childCat) throw new Error("Category not found");
          
          // Verify parent-child relationship
          if (childCat.parent_id !== parentCat.id) {
            navigate(`/category/${categorySlug}`, { replace: true });
            return;
          }
          
          setCategory({
            ...childCat,
            parent: parentCat
          });
          
          await fetchProducts(childCat.id);
          await fetchFeaturedProducts(childCat.id);
        }
        // Case 2: Just a single category (could be parent)
        else if (categorySlug) {
          const currentCategory = await fetchCategoryBySlug(categorySlug);
          if (!currentCategory) throw new Error("Category not found");
          
          // If this is a subcategory, redirect to the full path
          if (currentCategory.parent_id) {
            const { data: parentData } = await supabase
              .from('categories')
              .select('*')
              .eq('id', currentCategory.parent_id)
              .maybeSingle();
              
            if (parentData) {
              setCategory({
                ...currentCategory,
                parent: parentData as CategoryWithParent
              });
              
              // Redirect to full path
              navigate(`/category/${parentData.slug}/${currentCategory.slug}`, { replace: true });
              return;
            } else {
              setCategory(currentCategory);
            }
          } else {
            setCategory(currentCategory);
            
            // For parent categories, fetch subcategories
            await fetchSubcategories(currentCategory.id);
          }
          
          await fetchProducts(currentCategory.id);
          await fetchFeaturedProducts(currentCategory.id);
        } else {
          throw new Error("Category not specified");
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Failed to load category data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [categorySlug, parentCategorySlug, navigate, toast]);
  
  const fetchSubcategories = async (parentId: string) => {
    try {
      const { data: subcats, error: subcatsError } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', parentId)
        .order('name');
        
      if (subcatsError) throw subcatsError;
      setSubcategories(subcats || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };
  
  const fetchProducts = async (categoryId: string) => {
    try {
      // Construct the base query
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });
      
      // Add category filter
      query = query.eq('category_id', categoryId);
      
      // Apply any additional filters
      if (activeFilters.inStock !== undefined) {
        query = query.eq('in_stock', activeFilters.inStock);
      }
      
      // Apply price filters if available
      if (activeFilters.priceRange) {
        const [min, max] = activeFilters.priceRange.map(Number);
        if (!isNaN(min)) query = query.gte('price', min);
        if (!isNaN(max)) query = query.lte('price', max);
      }
      
      // Apply sorting
      if (activeFilters.sort) {
        switch (activeFilters.sort) {
          case 'price-low-high':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high-low':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          default:
            // Default sorting (recommended)
            query = query.order('created_at', { ascending: false });
        }
      } else {
        // Default sorting
        query = query.order('created_at', { ascending: false });
      }
      
      // Execute query
      const { data: productData, error: productError, count } = await query;
      
      if (productError) throw productError;
      
      // Map database products to application product type
      const mappedProducts: Product[] = (productData || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: Number(item.price),
        originalPrice: item.original_price ? Number(item.original_price) : undefined,
        images: item.images || [],
        categoryId: item.category_id,
        rating: Number(item.rating) || 0,
        reviewCount: item.review_count || 0,
        inStock: item.in_stock === true,
        badges: Array.isArray(item.badges) ? item.badges : [],
        slug: item.slug,
        features: Array.isArray(item.features) ? item.features : [],
        specifications: item.specifications as Record<string, string | number | boolean | object> || {},
        salesCount: Number(item.sales_count) || 0,
        createdAt: item.created_at
      }));
      
      setProducts(mappedProducts);
      setTotalProducts(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const fetchFeaturedProducts = async (categoryId: string) => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('badges', 'Featured')
        .limit(4);
        
      // If no products have a "Featured" badge, just get the top rated ones
      if (!data || data.length === 0) {
        const { data: topRated } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryId)
          .order('rating', { ascending: false })
          .limit(4);
          
        const mappedProducts: Product[] = (topRated || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : undefined,
          images: item.images || [],
          categoryId: item.category_id,
          rating: Number(item.rating) || 0,
          reviewCount: item.review_count || 0,
          inStock: item.in_stock === true,
          badges: Array.isArray(item.badges) ? item.badges : [],
          slug: item.slug,
          features: Array.isArray(item.features) ? item.features : [],
          specifications: item.specifications as Record<string, string | number | boolean | object> || {},
          salesCount: Number(item.sales_count) || 0,
          createdAt: item.created_at
        }));
        
        setFeaturedProducts(mappedProducts);
      } else {
        // Map featured products
        const mappedProducts: Product[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : undefined,
          images: item.images || [],
          categoryId: item.category_id,
          rating: Number(item.rating) || 0,
          reviewCount: item.review_count || 0,
          inStock: item.in_stock === true,
          badges: Array.isArray(item.badges) ? item.badges : [],
          slug: item.slug,
          features: Array.isArray(item.features) ? item.features : [],
          specifications: item.specifications as Record<string, string | number | boolean | object> || {},
          salesCount: Number(item.sales_count) || 0,
          createdAt: item.created_at
        }));
        
        setFeaturedProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // This is not critical, so we don't show an error toast
    }
  };
  
  const handleFilterChange = (newFilters: FilterParams) => {
    setActiveFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters };
      
      if (category) {
        fetchProducts(category.id);
      }
      
      return updatedFilters;
    });
  };
  
  const toggleMobileFilters = () => {
    setIsMobileFilterOpen(prev => !prev);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mr-3" />
            <p className="text-gray-500">Loading category...</p>
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
  
  // Build breadcrumb items
  const buildBreadcrumbs = () => {
    const breadcrumbs = [
      { name: 'Home', path: '/' }
    ];
    
    if (category.parent) {
      breadcrumbs.push({
        name: category.parent.name,
        path: `/category/${category.parent.slug}`
      });
    }
    
    breadcrumbs.push({
      name: category.name,
      path: category.parent ? `/category/${category.parent.slug}/${category.slug}` : `/category/${category.slug}`
    });
    
    return breadcrumbs;
  };

  return (
    <Layout>
      <Helmet>
        <title>{category.name} - Digital Deals Hub</title>
        <meta 
          name="description" 
          content={category.description || `Explore the best digital ${category.name} products on Digital Deals Hub.`} 
        />
      </Helmet>
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container-custom py-3">
          <Breadcrumb>
            <BreadcrumbList>
              {buildBreadcrumbs().map((breadcrumb, index) => {
                const isLast = index === buildBreadcrumbs().length - 1;
                
                return (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={breadcrumb.path}>
                          {breadcrumb.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 max-w-3xl">{category.description}</p>
          )}
        </div>
      </div>
      
      <div className="container-custom py-12">
        {/* If this is a parent category with subcategories, show tabs */}
        {subcategories.length > 0 && (
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mb-6 md:mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">All Products</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {/* Subcategories grid */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Subcategories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subcategories.map(subcategory => (
                    <Link
                      to={`/category/${category.slug}/${subcategory.slug}`}
                      key={subcategory.id}
                      className="bg-white border border-gray-100 rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300"
                    >
                      <img 
                        src={subcategory.image} 
                        alt={subcategory.name}
                        className="w-16 h-16 object-contain mb-4"
                        loading="lazy"
                      />
                      <h3 className="font-medium">{subcategory.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {subcategory.count} {subcategory.count === 1 ? 'product' : 'products'}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Featured Products */}
              {featuredProducts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
                  <EnhancedProductGrid
                    products={featuredProducts}
                    showSort={false}
                    limit={4}
                    showViewAll={true}
                    viewAllLink={`/category/${category.slug}?tab=products`}
                    viewAllLabel="View all products"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="products">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Filters */}
                <div className={`md:w-1/4 ${isMobileFilterOpen ? 'block' : 'hidden'} md:block`}>
                  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm sticky top-24">
                    <EnhancedCategoryFilters 
                      activeFilters={activeFilters}
                      onFilterChange={handleFilterChange}
                      onToggleMobileFilters={toggleMobileFilters}
                      isMobileFilterOpen={isMobileFilterOpen}
                    />
                  </div>
                </div>
                
                {/* Products */}
                <div className="md:w-3/4">
                  <EnhancedCategoryFilters 
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    onToggleMobileFilters={toggleMobileFilters}
                    isMobileFilterOpen={isMobileFilterOpen}
                  />
                  
                  <EnhancedProductGrid
                    products={products}
                    showSort={true}
                    onSortChange={(sort) => handleFilterChange({ sort })}
                    activeSort={activeFilters.sort}
                    paginationType="pagination"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {/* If this is a subcategory, show products directly with filters */}
        {subcategories.length === 0 && (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters */}
            <div className={`md:w-1/4 lg:w-1/5 ${isMobileFilterOpen ? 'block' : 'hidden'} md:block`}>
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm sticky top-24">
                <EnhancedCategoryFilters 
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onToggleMobileFilters={toggleMobileFilters}
                  isMobileFilterOpen={isMobileFilterOpen}
                />
              </div>
            </div>
            
            {/* Products */}
            <div className="md:w-3/4 lg:w-4/5">
              <EnhancedCategoryFilters 
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onToggleMobileFilters={toggleMobileFilters}
                isMobileFilterOpen={isMobileFilterOpen}
              />
              
              <div className="mb-4">
                <p className="text-gray-600">
                  {totalProducts} products found
                </p>
              </div>
              
              <EnhancedProductGrid
                products={products}
                showSort={true}
                onSortChange={(sort) => handleFilterChange({ sort })}
                activeSort={activeFilters.sort}
                paginationType="pagination"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnhancedCategoryPage;
