import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchCategoryBySlug } from '@/services/categoryService';
import { Category, Product, FilterParams } from '@/types';

interface CategoryWithParent extends Category {
  parent?: CategoryWithParent;
  subcategories?: Category[];
}

interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  images?: string[];
  category_id: string;
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  stock_quantity?: number;
  badges?: string[] | null;
  slug: string;
  features?: string[] | null;
  specifications?: any;
  created_at?: string;
  sales_count?: number | null;
  external_id?: string;
  api_name?: string;
  api_price?: number;
  api_stock?: number;
  last_synced_at?: string;
  updated_at?: string;
  kiosk_token?: string;
}

interface UseCategoryDataProps {
  categorySlug?: string;
  parentCategorySlug?: string;
}

export const useCategoryData = ({ categorySlug, parentCategorySlug }: UseCategoryDataProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [category, setCategory] = useState<CategoryWithParent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('products');
  const [activeFilters, setActiveFilters] = useState<FilterParams>({
    sort: 'recommended',
  });
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (parentCategorySlug && categorySlug) {
          const parentCat = await fetchCategoryBySlug(parentCategorySlug);
          if (!parentCat) throw new Error("Parent category not found");
          
          const childCat = await fetchCategoryBySlug(categorySlug);
          if (!childCat) throw new Error("Category not found");
          
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
        } else if (categorySlug) {
          const currentCategory = await fetchCategoryBySlug(categorySlug);
          if (!currentCategory) throw new Error("Category not found");
          
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
              
              navigate(`/category/${parentData.slug}/${currentCategory.slug}`, { replace: true });
              return;
            } else {
              setCategory(currentCategory);
            }
          } else {
            setCategory(currentCategory);
            
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
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });
      
      query = query.eq('category_id', categoryId);
      
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
            query = query.order('created_at', { ascending: false });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data: productData, error: productError, count } = await query;
      
      if (productError) throw productError;
      
      const mappedProducts: Product[] = (productData || []).map((item: ProductData) => ({
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
        specifications: (typeof item.specifications === 'object' && item.specifications !== null) ? item.specifications : {},
        salesCount: Number(0),
        sales_count: Number(0),
        createdAt: item.created_at || new Date().toISOString()
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
        .eq('badges', ['Featured'])
        .limit(4);
        
      if (!data || data.length === 0) {
        const { data: topRated } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryId)
          .order('rating', { ascending: false })
          .limit(4);
          
        const mappedProducts: Product[] = (topRated || []).map((item: ProductData) => ({
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
          specifications: (typeof item.specifications === 'object' && item.specifications !== null) ? item.specifications : {},
          salesCount: Number(0),
          sales_count: Number(0),
          createdAt: item.created_at || new Date().toISOString()
        }));
        
        setFeaturedProducts(mappedProducts);
      } else {
        const mappedProducts: Product[] = data.map((item: ProductData) => ({
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
          specifications: (typeof item.specifications === 'object' && item.specifications !== null) ? item.specifications : {},
          salesCount: Number(0),
          sales_count: Number(0),
          createdAt: item.created_at || new Date().toISOString()
        }));
        
        setFeaturedProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };
  
  const handleSortChange = (sort: string) => {
    setActiveFilters(prev => {
      const updatedFilters = { ...prev, sort };
      
      if (category) {
        fetchProducts(category.id);
      }
      
      return updatedFilters;
    });
  };

  const buildBreadcrumbs = () => {
    const breadcrumbs = [
      { name: 'Home', path: '/' }
    ];
    
    if (category?.parent) {
      breadcrumbs.push({
        name: category.parent.name,
        path: `/category/${category.parent.slug}`
      });
    }
    
    if (category) {
      breadcrumbs.push({
        name: category.name,
        path: category.parent ? `/category/${category.parent.slug}/${category.slug}` : `/category/${category.slug}`
      });
    }
    
    return breadcrumbs;
  };
  
  return {
    category,
    products,
    featuredProducts,
    subcategories,
    loading,
    error,
    activeTab,
    setActiveTab,
    activeFilters,
    totalProducts,
    handleSortChange,
    buildBreadcrumbs
  };
};
