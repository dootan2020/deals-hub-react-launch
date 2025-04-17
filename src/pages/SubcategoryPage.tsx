
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import SimplifiedCategoryFilters from '@/components/category/SimplifiedCategoryFilters';
import { Button } from '@/components/ui/button';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  fetchCategoryBySlug, 
  fetchCategoryHierarchy 
} from '@/services/categoryService';
import { fetchProductsWithFilters } from '@/services/productService';
import { Category, Product, FilterParams, SubcategoryPageParams } from '@/types';

const SubcategoryPage = () => {
  const params = useParams<SubcategoryPageParams>();
  const { toast } = useToast();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterParams>({
    sort: 'recommended'
  });
  const [productCount, setProductCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!params.parentCategorySlug || !params.categorySlug) {
          throw new Error("Category parameters are missing");
        }
        
        // Fetch subcategory details
        const subcategory = await fetchCategoryBySlug(params.categorySlug);
        if (!subcategory) {
          throw new Error("Subcategory not found");
        }
        setCategory(subcategory);
        
        // Fetch parent category details
        const parentCategory = await fetchCategoryBySlug(params.parentCategorySlug);
        if (!parentCategory) {
          throw new Error("Parent category not found");
        }
        setParentCategory(parentCategory);
        
        // Fetch products for this subcategory
        const productsData = await fetchProductsWithFilters({
          ...filters,
          categoryId: subcategory.id
        });
        
        setProducts(productsData);
        setProductCount(productsData.length);
      } catch (error) {
        console.error('Error fetching subcategory data:', error);
        toast({
          title: "Error",
          description: "Failed to load subcategory data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.parentCategorySlug, params.categorySlug, filters, toast]);

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({
      ...prev,
      sort
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mr-3" />
            <p className="text-text-light">Loading products...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category || !parentCategory) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="mb-8 text-gray-600">
              The category you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{`${category.name} - ${parentCategory.name} | Digital Deals Hub`}</title>
        <meta 
          name="description" 
          content={`Browse our selection of ${category.name} products in the ${parentCategory.name} category. Find the best digital deals for your needs.`} 
        />
        <link rel="canonical" href={`/category/${parentCategory.slug}/${category.slug}`} />
      </Helmet>
      
      <div className="bg-white py-8">
        <div className="container-custom">
          <div className="mb-8">
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/category/${parentCategory.slug}`}>
                  {parentCategory.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/category/${parentCategory.slug}/${category.slug}`} className="text-gray-900 font-medium">
                  {category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
          
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <Badge variant="outline" className="bg-gray-100 text-gray-700">{productCount} products</Badge>
            </div>
            <p className="text-gray-600 mt-2">{category.description}</p>
            <Separator className="mt-6" />
          </div>
          
          <div>
            <SimplifiedCategoryFilters
              onSortChange={handleSortChange}
              activeSort={filters.sort || 'recommended'}
            />
            
            <ProductGrid 
              products={products} 
              showSort={false}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubcategoryPage;
