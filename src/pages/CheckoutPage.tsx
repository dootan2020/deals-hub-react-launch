
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProductBySlug } from '@/services/product/productService';
import { fetchProductStock } from '@/services/orderService';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingBag, Tag } from 'lucide-react';

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [stockInfo, setStockInfo] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug || ''),
    enabled: !!slug,
  });

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  // Check stock information from API
  const checkRealTimeStock = async () => {
    if (!product?.kiosk_token) {
      return;
    }
    
    setStockLoading(true);
    
    try {
      const stockData = await fetchProductStock(product.kiosk_token);
      setStockInfo(stockData);
    } catch (error) {
      console.error('Failed to fetch stock info:', error);
    } finally {
      setStockLoading(false);
    }
  };
  
  // Format price in VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !product) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">Error Loading Product</h2>
            <p className="mt-4">Unable to load the product details. Please try again later.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium bg-primary text-white hover:bg-primary-dark"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Go back to home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Summary Column */}
          <div className="w-full md:w-2/3 space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-2xl font-bold">Checkout</h1>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Order Summary
                </CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex gap-4">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      className="w-24 h-24 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{product.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.shortDescription || product.description.substring(0, 100)}
                    </p>
                    
                    <div className="mt-2 flex items-center gap-2">
                      {product.badges && product.badges.length > 0 && (
                        <Badge variant="secondary">{product.badges[0]}</Badge>
                      )}
                      <span className="text-sm font-medium">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-20 mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="promotion" className="flex items-center gap-1">
                      <Tag className="h-4 w-4" /> Promotion Code (Optional)
                    </Label>
                    <Input
                      id="promotion"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value)}
                      placeholder="Enter code if you have one"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {product.kiosk_token && (
                  <>
                    <Separator className="my-4" />
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Stock Information</span>
                        <button
                          onClick={checkRealTimeStock}
                          disabled={stockLoading}
                          className="text-xs text-primary hover:underline"
                        >
                          {stockLoading ? 'Checking...' : 'Check real-time stock'}
                        </button>
                      </div>
                      
                      {stockInfo ? (
                        <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                          <p className="font-medium">{stockInfo.name}</p>
                          <div className="flex justify-between mt-1">
                            <span>Còn lại: {stockInfo.stock}</span>
                            <span>Giá: {stockInfo.price}đ</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.stockQuantity !== undefined
                            ? `Estimated Stock: ${product.stockQuantity} units`
                            : 'Check real-time stock for accurate information'}
                        </p>
                      )}
                    </div>
                  </>
                )}
                
                <Separator className="my-4" />
                
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatPrice(product.price * quantity)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Payment Column */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Complete Purchase</CardTitle>
                <CardDescription>Securely purchase your digital product</CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Once purchase is complete, you'll receive your digital product immediately.
                </p>
                
                {stockInfo && stockInfo.success === "false" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-4">
                    <p className="text-amber-800 text-sm">{stockInfo.description || 'There was an issue checking stock information'}</p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex-col space-y-4">
                <BuyNowButton
                  kioskToken={product.kiosk_token || ''}
                  quantity={quantity}
                  promotionCode={promotionCode || undefined}
                  isInStock={product.inStock && (
                    stockInfo ? stockInfo.stock > 0 : product.stockQuantity > 0
                  )}
                  onSuccess={() => {
                    // Additional success handling if needed
                  }}
                />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
