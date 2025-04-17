
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Star, ShoppingCart, ArrowLeft, Heart, Share2, Shield, Box, RefreshCw, Loader2 } from 'lucide-react';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product/ProductGrid';
import { Product, Category, ProductPageParams } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';

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
  
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productSlug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch product by slug
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
        
        // Get the product's category
        const categoryId = productData.category_id;
        
        if (categoryId) {
          // Fetch the category data including parent if exists
          const { data: categoryData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .maybeSingle();
            
          let productCategory: CategoryWithParent | null = null;
          
          if (categoryData) {
            productCategory = { ...categoryData };
            
            // If category has parent, fetch parent data
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

          // Check if URL should be redirected to canonical form
          if (categorySlug && parentCategorySlug) {
            // We already have the correct URL structure, no need to redirect
          } else if (productCategory && productCategory.parent) {
            // Redirect to canonical URL with parent and category slugs
            navigate(`/${productCategory.parent.slug}/${productCategory.slug}/${productSlug}`, { replace: true });
          } else if (productCategory && !parentCategorySlug) {
            // Redirect to canonical URL with just category slug
            navigate(`/category/${productCategory.slug}/${productSlug}`, { replace: true });
          }
          
          // Convert specifications to Record<string, string> format
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
            price: Number(productData.price),
            originalPrice: productData.original_price ? Number(productData.original_price) : undefined,
            images: productData.images || [],
            categoryId: productData.category_id,
            rating: productData.rating || 0,
            reviewCount: productData.review_count || 0,
            inStock: productData.in_stock === true,
            badges: productData.badges || [],
            slug: productData.slug,
            features: productData.features || [],
            specifications,
            category: productCategory
          };
          
          setProduct(mappedProduct);
          
          // Fetch related products
          await fetchRelatedProducts(categoryId);
        } else {
          // Product without category
          // Convert specifications to Record<string, string> format
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
            price: Number(productData.price),
            originalPrice: productData.original_price ? Number(productData.original_price) : undefined,
            images: productData.images || [],
            categoryId: productData.category_id,
            rating: productData.rating || 0,
            reviewCount: productData.review_count || 0,
            inStock: productData.in_stock === true,
            badges: productData.badges || [],
            slug: productData.slug,
            features: productData.features || [],
            specifications
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
          // Convert specifications to Record<string, string> format
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
            badges: item.badges || [],
            slug: item.slug,
            features: item.features || [],
            specifications
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
  
  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${product?.title} (${quantity} items) has been added to your cart.`
    });
    // In a real app, this would dispatch an action to add to cart
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
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{product.title} | Digital Deals Hub</title>
        <meta name="description" content={product.description.substring(0, 160)} />
        <link rel="canonical" href={`https://digitaldeals.hub${getCanonicalUrl()}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description.substring(0, 160)} />
        <meta property="og:url" content={`https://digitaldeals.hub${getCanonicalUrl()}`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content="USD" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.title} />
        <meta name="twitter:description" content={product.description.substring(0, 160)} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
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
      
      {/* Product Details Section */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-8 h-[400px] flex items-center justify-center">
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
                          ? 'border-primary' 
                          : 'border-gray-200 hover:border-gray-300'
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
            
            {/* Product Info */}
            <div className="space-y-6">
              <div>
                {/* Badges */}
                {product.badges && product.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.badges.map((badge: string, index: number) => {
                      let badgeClass = "text-xs font-semibold px-3 py-1 rounded-full";
                      
                      if (badge.includes("OFF")) {
                        badgeClass += " bg-red-500 text-white";
                      } else if (badge === "Featured") {
                        badgeClass += " bg-primary text-white";
                      } else if (badge === "Hot") {
                        badgeClass += " bg-orange-500 text-white";
                      } else if (badge === "Best Seller") {
                        badgeClass += " bg-accent text-white";
                      } else if (badge === "Limited") {
                        badgeClass += " bg-purple-500 text-white";
                      } else {
                        badgeClass += " bg-gray-200 text-gray-800";
                      }
                      
                      return (
                        <span key={index} className={badgeClass}>
                          {badge}
                        </span>
                      );
                    })}
                  </div>
                )}
                
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating) 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-text-light">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                
                <p className="text-text-light mb-6">
                  {product.description}
                </p>
              </div>
              
              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex items-end mb-4">
                  <span className="text-3xl font-bold text-text mr-3">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-text-light line-through mr-3">
                        {formatCurrency(product.originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center mb-6">
                  <span className={`text-sm font-medium rounded-full px-3 py-1 ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                {/* Quantity and Add to Cart */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-gray-300 rounded-md w-36">
                    <button 
                      className="px-4 py-2 text-text-light hover:text-primary"
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
                      className="px-4 py-2 text-text-light hover:text-primary"
                      onClick={() => handleQuantityChange(1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    className="flex-1"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button variant="outline" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-text-light">
                  <Share2 className="h-5 w-5 mr-2" />
                  <span>Share this product</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <Shield className="h-6 w-6 text-primary mr-3" />
                      <div>
                        <p className="text-sm font-medium">Secure Payment</p>
                        <p className="text-xs text-text-light">100% Protected</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <Box className="h-6 w-6 text-primary mr-3" />
                      <div>
                        <p className="text-sm font-medium">Instant Delivery</p>
                        <p className="text-xs text-text-light">Digital Products</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <RefreshCw className="h-6 w-6 text-primary mr-3" />
                      <div>
                        <p className="text-sm font-medium">Satisfaction</p>
                        <p className="text-xs text-text-light">24/7 Support</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Details Tabs */}
      <section className="py-8 bg-gray-50">
        <div className="container-custom">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start bg-white border-b">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="bg-white p-6 rounded-b-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Product Description</h3>
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="bg-white p-6 rounded-b-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex border-b border-gray-100 py-2">
                    <span className="font-medium w-40">Category:</span>
                    <span>{product.category ? product.category.name : 'Uncategorized'}</span>
                  </div>
                  <div className="flex border-b border-gray-100 py-2">
                    <span className="font-medium w-40">Format:</span>
                    <span>Digital Product</span>
                  </div>
                  <div className="flex border-b border-gray-100 py-2">
                    <span className="font-medium w-40">Delivery:</span>
                    <span>Instant</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex border-b border-gray-100 py-2">
                    <span className="font-medium w-40">Usage:</span>
                    <span>Commercial</span>
                  </div>
                  <div className="flex border-b border-gray-100 py-2">
                    <span className="font-medium w-40">Support:</span>
                    <span>Yes</span>
                  </div>
                  <div className="flex border-b border-gray-100 py-2">
                    <span className="font-medium w-40">License:</span>
                    <span>Standard</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="bg-white p-6 rounded-b-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="flex mr-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-6 w-6 ${
                          i < Math.floor(product.rating) 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-xl font-medium">{product.rating.toFixed(1)} out of 5</span>
                </div>
                <p className="text-text-light">Based on {product.reviewCount} reviews</p>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                          <span className="font-medium">JD</span>
                        </div>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm text-text-light">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p>Great product! Exactly what I needed and delivered instantly. Would definitely buy again.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                          <span className="font-medium">JS</span>
                        </div>
                        <div>
                          <p className="font-medium">Jane Smith</p>
                          <p className="text-sm text-text-light">1 week ago</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p>Very good value for money. The instructions were clear and I was up and running in minutes.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Related Products */}
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
