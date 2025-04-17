import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import Layout from '@/components/layout/Layout';
import CategoryBreadcrumbs from '@/components/category/CategoryBreadcrumbs';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategoryProductsList from '@/components/category/CategoryProductsList';
import CategoryFiltersSection from '@/components/category/CategoryFiltersSection';
import MobileFilterToggle from '@/components/category/MobileFilterToggle';

import { fetchCategoryBySlug } from '@/services/categoryService';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithParent, CategoryPageParams, PaginationState, ProductData } from '@/types/category.types';
import { Product } from '@/types';

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

  const buildBreadcrumbCategories = (currentCategory: CategoryWithParent): CategoryWithParent[] => {
    const result: CategoryWithParent[] = [];
    result.push(currentCategory);
    if (currentCategory.parent) {
      result.unshift(currentCategory.parent);
    }
    return result;
  };

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
      
      const mappedProducts: Product[] = allProducts.map((item: ProductData) => ({
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
        stockQuantity: item.stock_quantity ?? (item.in_stock === true ? 10 : 0),
        badges: Array.isArray(item.badges) ? item.badges : [],
        slug: item.slug,
        features: Array.isArray(item.features) ? item.features : [],
        specifications: convertSpecifications(item.specifications) || {},
        salesCount: Number(item.sales_count || 0),
        sales_count: Number(item.sales_count || 0),
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{category.name} - Digital Deals Hub</title>
        <meta name="description" content={category.description} />
      </Helmet>

      <CategoryBreadcrumbs categories={buildBreadcrumbCategories(category)} />
      <CategoryHeader name={category.name} description={category.description} />
      
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <MobileFilterToggle 
            showFilters={showFilters} 
            onToggleFilters={() => setShowFilters(!showFilters)} 
          />
          
          <CategoryFiltersSection 
            showFilters={showFilters} 
            onToggleFilters={() => setShowFilters(!showFilters)} 
          />
          
          <div className="md:w-3/4 lg:w-4/5">
            <CategoryProductsList 
              products={products}
              totalProducts={pagination.totalItems}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
