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
  const { productSlug, categorySlug, parentCategorySlug } = useParams<ProductPageParams>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const getShortDescription = (description: string): string => {
    if (!description) return '';
    const maxLength = 200;
    if (description.length <= maxLength) return description;
    
    const breakPoints = ['. ', '? ', '! '];
    for (const point of breakPoints) {
      const endPos = description.substring(0, maxLength).lastIndexOf(point);
      if (endPos > 0) {
        return description.substring(0, endPos + 1);
      }
    }
    
    return description.substring(0, maxLength) + '...';
  };
  
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
        
        const categoryId = productData.category_id;
        
        if (categoryId) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .maybeSingle();
            
          let productCategory: CategoryWithParent | null = null;
          
          if (categoryData) {
            productCategory = { ...categoryData };
            
            if (categoryData.parent_id) {
              const { data: parentData } = await supabase
                .from('categories')
                .select('*')
                .eq('id', categoryData.parent_id)
                .maybeSingle();
                
              if (parentData) {
                productCategory.parent = parentData;
              }
            }
          }

          if (categorySlug && parentCategorySlug) {
          } else if (productCategory && productCategory.parent) {
            navigate(`/${productCategory.parent.slug}/${productCategory.slug}/${productSlug}`, { replace: true });
          } else if (productCategory && !parentCategorySlug) {
            navigate(`/category/${productCategory.slug}/${productSlug}`, { replace: true });
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
            shortDescription: productData.short_description || getShortDescription(productData.description),
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
            category: productCategory,
            salesCount: Number(0),
            sales_count: Number(0),
            stock: productData.stock || 0,
            createdAt: productData.created_at || new Date().toISOString()
          };
          
          setProduct(mappedProduct);
          
          await fetchRelatedProducts(categoryId);
        } else {
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
            shortDescription: productData.short_description || getShortDescription(productData.description),
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
            createdAt: productData.created_at || new Date().toISOString()
          };
          
          setProduct(mappedProduct);
        }
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
  }, [productSlug, categorySlug, parentCategorySlug, navigate, toast]);

  const fetchRelatedProducts = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .neq('slug', productSlug)
        .limit(4);
        
      if (error) throw error;
      
      if (data) {
        const mappedProducts: Product[] = data.map(item => {
          const specifications: Record<string, string> = {};
          
          if (item.specifications && typeof item.specifications === 'object') {
            Object.entries(item.specifications).forEach(([key, value]) => {
              specifications[key] = String(value);
            });
          }
          
          return {
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
            specifications,
            salesCount: Number(0),
            sales_count: Number(0),
            stock: item.stock || 0,
            createdAt: item.created_at || new Date().toISOString()
          };
        });
        
        setRelatedProducts(mappedProducts);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const getCanonicalUrl = () => {
    if (!product || !product.category) {
      return `/product/${productSlug}`;
    }
    
    if (product.category.parent) {
      return `/${product.category.parent.slug}/${product.category.slug}/${product.slug}`;
    }
    
    return `/category/${product.category.slug}/${product.slug}`;
  };
  
  const getCategoryUrl = (category: CategoryWithParent) => {
    if (category.parent) {
      return `/${category.parent.slug}/${category.slug}`;
    }
    return `/category/${category.slug}`;
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
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
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || 'Product not found'}
            </AlertDescription>
          </Alert>
          <div className="flex flex-col justify-center items-center mt-8">
            <Button asChild>
              <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const discountPercentage = product.originalPrice 
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;
  
  const ogImageUrl = product.images.length > 0 ? product.images[0] : '';
    
  return (
    <Layout>
      <Helmet>
        <title>{product.title} | Digital Deals Hub</title>
        <meta name="description" content={product.shortDescription ? product.shortDescription : product.description.substring(0, 160)} />
        <link rel="canonical" href={`https://digitaldeals.hub${getCanonicalUrl()}`} />
        
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.shortDescription ? product.shortDescription : product.description.substring(0, 160)} />
        <meta property="og:url" content={`https://digitaldeals.hub${getCanonicalUrl()}`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content="USD" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.title} />
        <meta name="twitter:description" content={product.shortDescription ? product.shortDescription : product.description.substring(0, 160)} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>
      
      <div className="bg-[#F3F4F6] py-4">
        <div className="container-custom">
          <Breadcrumb>
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
                      <Link to={getCategoryUrl(product.category)}>
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
        </div>
      </div>
      
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-[#F3F4F6] rounded-lg p-8 h-[400px] flex items-center justify-center">
                <img 
                  src={product.images[selectedImage] || '/placeholder.svg'} 
                  alt={product.title} 
                  className="max-h-full object-contain" 
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex overflow-x-auto space-x-4 py-2">
                  {product.images.map((image: string, index: number) => (
                    <button 
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`h-20 w-20 min-w-[5rem] border rounded p-2 ${
                        selectedImage === index 
                          ? 'border-[#1A936F]' 
                          : 'border-[#E5E7EB] hover:border-[#6B7280]'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.title} thumbnail ${index + 1}`}
                        className="h-full w-full object-contain" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                {product.badges && product.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.badges.map((badge: string, index: number) => {
                      let badgeClass = "text-xs font-semibold px-3 py-1 rounded-full";
                      
                      if (badge.includes("OFF")) {
                        badgeClass += " bg-[#D7263D] text-white";
                      } else if (badge === "Featured") {
                        badgeClass += " bg-[#1A936F] text-white";
                      } else if (badge === "Hot") {
                        badgeClass += " bg-[#EF4444] text-white";
                      } else if (badge === "Best Seller") {
                        badgeClass += " bg-[#F59E0B] text-white";
                      } else if (badge === "Limited") {
                        badgeClass += " bg-[#3D5AFE] text-white";
                      } else {
                        badgeClass += " bg-[#F3F4F6] text-[#4B5563]";
                      }
                      
                      return (
                        <span key={index} className={badgeClass}>
                          {badge}
                        </span>
                      );
                    })}
                  </div>
                )}
                
                <h1 className="text-3xl font-bold mb-2 text-[#1E1E1E]">{product.title}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating) 
                            ? "text-[#F59E0B] fill-[#F59E0B]" 
                            : "text-[#E5E7EB]"
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-[#6B7280]">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                
                <p className="text-[#4B5563] mb-6">
                  {product.shortDescription || getShortDescription(product.description)}
                </p>
              </div>
              
              <div className="border-t border-b border-[#E5E7EB] py-6">
                <div className="flex items-end mb-4">
                  <span className="text-3xl font-bold text-[#1A936F] mr-3">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-[#6B7280] line-through mr-3">
                        {formatCurrency(product.originalPrice)}
                      </span>
                      <span className="bg-[#FFECEC] text-[#D7263D] text-sm font-semibold px-2 py-1 rounded">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center mb-6">
                  {product.stockQuantity > 0 ? (
                    <span className="text-sm font-medium rounded-full px-3 py-1 bg-[#E6F7EF] text-[#1A936F]">
                      In Stock: {product.stockQuantity} {product.stockQuantity === 1 ? 'unit' : 'units'}
                    </span>
                  ) : (
                    <span className="text-sm font-medium rounded-full px-3 py-1 bg-[#FFECEC] text-[#D7263D]">
                      Out of Stock
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-[#E5E7EB] rounded-md w-36">
                    <button 
                      className="px-4 py-2 text-[#6B7280] hover:text-[#1A936F]"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center border-0 focus:ring-0 text-[#1E1E1E]"
                      min="1"
                    />
                    <button 
                      className="px-4 py-2 text-[#6B7280] hover:text-[#1A936F]"
                      onClick={() => handleQuantityChange(1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <BuyNowButton
                    kioskToken={product.kiosk_token || ''}
                    productId={product.id}
                    quantity={quantity}
                    isInStock={product.inStock}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white"
                    product={product}
                  />
                  
                  <Button variant="outline" size="icon" className="border-[#E5E7EB] text-[#6B7280] hover:border-[#1A936F] hover:text-[#1A936F]">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-[#6B7280]">
                  <Share2 className="h-5 w-5 mr-2" />
                  <span>Share this product</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  <Card className="border-[#E5E7EB]">
                    <CardContent className="p-4 flex items-center">
                      <Shield className="h-6 w-6 text-[#1A936F] mr-3" />
                      <div>
                        <p className="text-sm font-medium text-[#1E1E1E]">Secure Payment</p>
                        <p className="text-xs text-[#6B7280]">100% Protected</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-[#E5E7EB]">
                    <CardContent className="p-4 flex items-center">
                      <Box className="h-6 w-6 text-[#1A936F] mr-3" />
                      <div>
                        <p className="text-sm font-medium text-[#1E1E1E]">Instant Delivery</p>
                        <p className="text-xs text-[#6B7280]">Digital Products</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-[#E5E7EB]">
                    <CardContent className="p-4 flex items-center">
                      <RefreshCw className="h-6 w-6 text-[#1A936F] mr-3" />
                      <div>
                        <p className="text-sm font-medium text-[#1E1E1E]">Satisfaction</p>
                        <p className="text-xs text-[#6B7280]">24/7 Support</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-8 bg-[#F3F4F6]">
        <div className="container-custom">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start bg-white border-b border-[#E5E7EB]">
              <TabsTrigger value="description" 
                className="text-[#4B5563] data-[state=active]:text-[#1A936F] data-[state=active]:border-b-2 data-[state=active]:border-[#1A936F]">
                Description
              </TabsTrigger>
              <TabsTrigger value="specifications" 
                className="text-[#4B5563] data-[state=active]:text-[#1A936F] data-[state=active]:border-b-2 data-[state=active]:border-[#1A936F]">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" 
                className="text-[#4B5563] data-[state=active]:text-[#1A936F] data-[state=active]:border-b-2 data-[state=active]:border-[#1A936F]">
                Customer Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="bg-white p-6 rounded-b-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-[#1E1E1E]">Product Description</h3>
              <div className="prose max-w-none product-description text-[#4B5563]"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </TabsContent>
            <TabsContent value="specifications" className="bg-white p-6 rounded-b-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-[#1E1E1E]">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex border-b border-[#E5E7EB] py-2">
                    <span className="font-medium w-40 text-[#1E1E1E]">Category:</span>
                    <span className="text-[#4B5563]">{product.category ? product.category.name : 'Uncategorized'}</span>
                  </div>
                  <div className="flex border-b border-[#E5E7EB] py-2">
                    <span className="font-medium w-40 text-[#1E1E1E]">Format:</span>
                    <span className="text-[#4B5563]">Digital Product</span>
                  </div>
                  <div className="flex border-b border-[#E5E7EB] py-2">
                    <span className="font-medium w-40 text-[#1E1E1E]">Delivery:</span>
                    <span className="text-[#4B5563]">Instant</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex border-b border-[#E5E7EB] py-2">
                    <span className="font-medium w-40 text-[#1E1E1E]">Usage:</span>
                    <span className="text-[#4B5563]">Commercial</span>
                  </div>
                  <div className="flex border-b border-[#E5E7EB] py-2">
                    <span className="font-medium w-40 text-[#1E1E1E]">Support:</span>
                    <span className="text-[#4B5563]">Yes</span>
                  </div>
                  <div className="flex border-b border-[#E5E7EB] py-2">
                    <span className="font-medium w-40 text-[#1E1E1E]">License:</span>
                    <span className="text-[#4B5563]">Standard</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="bg-white p-6 rounded-b-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-[#1E1E1E]">Customer Reviews</h3>
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="flex mr-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-6 w-6 ${
                          i < Math.floor(product.rating) 
                            ? "text-[#F59E0B] fill-[#F59E0B]" 
                            : "text-[#E5E7EB]"
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-xl font-medium text-[#1E1E1E]">{product.rating.toFixed(1)} out of 5</span>
                </div>
                <p className="text-[#6B7280]">Based on {product.reviewCount} reviews</p>
              </div>
              
              <div className="space-y-6">
                <Card className="border-[#E5E7EB]">
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-[#F3F4F6] mr-3 flex items-center justify-center">
                          <span className="font-medium text-[#4B5563]">JD</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#1E1E1E]">John Doe</p>
                          <p className="text-sm text-[#6B7280]">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < 5 ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#E5E7EB]"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#4B5563]">Great product! Exactly what I needed and delivered instantly. Would definitely buy again.</p>
                  </CardContent>
                </Card>
                
                <Card className="border-[#E5E7EB]">
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-[#F3F4F6] mr-3 flex items-center justify-center">
                          <span className="font-medium text-[#4B5563]">JS</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#1E1E1E]">Jane Smith</p>
                          <p className="text-sm text-[#6B7280]">1 week ago</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < 4 ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#E5E7EB]"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#4B5563]">Very good value for money. The instructions were clear and I was up and running in minutes.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {relatedProducts.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            
            <Carousel>
              <CarouselContent className="-ml-4">
                {relatedProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1">
                      <Link to={`/product/${product.slug}`} className="block h-full">
                        <Card className="h-full overflow-hidden">
                          <CardContent className="p-0">
                            <div className="aspect-[4/3] relative">
                              <img 
                                src={product.images[0] || '/placeholder.svg'} 
                                alt={product.title}
                                className="object-cover w-full h-full" 
                              />
                              {product.badges && product.badges.length > 0 && (
                                <div className="absolute top-2 left-2">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    product.badges[0].includes("OFF") ? "bg-red-500 text-white" : 
                                    product.badges[0] === "Featured" ? "bg-primary text-white" :
                                    product.badges[0] === "Hot" ? "bg-orange-500 text-white" :
                                    "bg-gray-200 text-gray-800"
                                  }`}>
                                    {product.badges[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium mb-2 line-clamp-1">{product.title}</h3>
                              <div className="flex items-center mb-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${
                                        i < Math.floor(product.rating) 
                                          ? "text-yellow-400 fill-yellow-400" 
                                          : "text-gray-300"
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-text-light ml-1">({product.reviewCount})</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-bold">{formatCurrency(product.price)}</span>
                                  {product.originalPrice && (
                                    <span className="text-sm text-text-light line-through ml-2">
                                      {formatCurrency(product.originalPrice)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductPage;
