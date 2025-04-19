import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Star, ShoppingCart, ArrowLeft, Heart, Share2, Shield, Box, RefreshCw, Loader2 } from 'lucide-react';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product/ProductGrid';
import { Product, Category } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Helmet } from 'react-helmet';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';
import { formatUSD } from '@/utils/currency';

interface ProductPageParams extends Record<string, string> {
  productSlug?: string;
  categorySlug?: string;
  parentCategorySlug?: string;
}

interface CategoryWithParent extends Category {
  parent?: CategoryWithParent | null;
}

interface ProductWithCategory extends Product {
  category?: CategoryWithParent | null;
}

const ProductPage = () => {
  const { productSlug } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productSlug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*, categories:category_id(*)')
          .eq('slug', productSlug)
          .maybeSingle();
        
        if (productError) throw productError;
        
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        const specifications: Record<string, string> = {};
          
        if (productData.specifications && typeof productData.specifications === 'object') {
          Object.entries(productData.specifications).forEach(([key, value]) => {
            specifications[key] = String(value);
          });
        }
        
        const mappedProduct: ProductWithCategory = {
          id: productData.id,
          title: productData.title,
          description: productData.description,
          shortDescription: productData.short_description || '',
          price: Number(productData.price),
          originalPrice: productData.original_price ? Number(productData.original_price) : undefined,
          images: productData.images || [],
          categoryId: productData.category_id,
          rating: productData.rating || 0,
          reviewCount: productData.review_count || 0,
          inStock: productData.in_stock === true,
          stockQuantity: productData.stock_quantity ?? (productData.in_stock === true ? 10 : 0),
          badges: productData.badges || [],
          slug: productData.slug,
          features: productData.features || [],
          specifications,
          salesCount: Number(0),
          sales_count: Number(0),
          stock: productData.stock || 0,
          kiosk_token: productData.kiosk_token || '',
          createdAt: productData.created_at || new Date().toISOString()
        };
          
        setProduct(mappedProduct);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product information');
        toast({
          title: "Error",
          description: "There was a problem loading the product. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [productSlug, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg">Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error || 'Product not found'}</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>{product.title} | Digital Deals Hub</title>
        <meta name="description" content={product.shortDescription || product.description.substring(0, 160)} />
      </Helmet>
      
      <div className="bg-background min-h-screen">
        <div className="container-custom py-8 lg:py-12">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              
              {product.category && (
                <>
                  {product.category.parent && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to={`/category/${product.category.parent.slug}`}>
                            {product.category.parent.name}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  )}
                  
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/category/${product.category.slug}`}>
                        {product.category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              
              <BreadcrumbItem>
                <BreadcrumbPage>{product.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto">
            {/* Product Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {product.title}
            </h1>

            {/* Stock and Price Information */}
            <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
              <div className="flex flex-col gap-4">
                {/* Stock Badges */}
                <ProductStock 
                  stock={product.stockQuantity || product.stock || 0}
                  soldCount={product.salesCount || 0}
                />
                
                {/* Price */}
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  ${(product.price / 24000).toFixed(2)}
                </div>

                {/* Purchase Actions */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border border-input rounded-md w-36">
                    <button 
                      className="px-4 py-2 text-muted-foreground hover:text-primary"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center border-0 focus:ring-0"
                      min="1"
                    />
                    <button 
                      className="px-4 py-2 text-muted-foreground hover:text-primary"
                      onClick={() => handleQuantityChange(1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <BuyNowButton
                    kioskToken={product.kiosk_token}
                    productId={product.id}
                    quantity={quantity}
                    isInStock={product.inStock}
                    className="flex-1"
                    product={product}
                  />
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="prose max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;
