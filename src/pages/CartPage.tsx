
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Tag, ArrowRight, PackageOpen, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';

// Mock cart data for demo - in a real app, this would come from a cart context/state
const mockCartItem = {
  id: 'demo-product',
  title: 'Gmail USA 2023-2024',
  description: 'Gmail USA với domain @gmail.com, tạo 2023-2024',
  price: 16000,
  quantity: 1,
  kioskToken: 'IEB8KZ8SAJQ5616W2M21', // Example kiosk token for demo
  inStock: true
};

export default function CartPage() {
  const [quantity, setQuantity] = useState(mockCartItem.quantity);
  const [promotionCode, setPromotionCode] = useState('');
  
  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
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

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-2xl font-bold flex items-center mb-6">
          <ShoppingCart className="h-5 w-5 mr-2" /> 
          Your Shopping Cart
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items Column */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cart Items (1)</CardTitle>
                <CardDescription>Review your items before checkout</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 border rounded-md bg-muted/30">
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <PackageOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{mockCartItem.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {mockCartItem.description}
                      </p>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium">
                          {formatPrice(mockCartItem.price)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <Label htmlFor="cart-quantity" className="sr-only">Quantity</Label>
                          <Input
                            id="cart-quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="w-16 h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      This is a demo cart with a sample product. In a real implementation, your actual cart items would be displayed here.
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link to="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Checkout Summary Column */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(mockCartItem.price * quantity)}</span>
                </div>
                
                <div>
                  <Label htmlFor="cart-promotion" className="flex items-center gap-1 mb-1.5">
                    <Tag className="h-4 w-4" /> Promotion Code
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="cart-promotion"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">Apply</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(mockCartItem.price * quantity)}</span>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <BuyNowButton
                  kioskToken={mockCartItem.kioskToken}
                  quantity={quantity}
                  promotionCode={promotionCode || undefined}
                  isInStock={mockCartItem.inStock}
                  onSuccess={() => {
                    // Additional success handling if needed
                  }}
                />
                
                <p className="text-xs text-center text-muted-foreground mt-4">
                  By clicking "Buy Now", you agree to the terms of service and privacy policy
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
