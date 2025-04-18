
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShoppingCart, 
  ExternalLink,
  ShoppingBag, 
  InfoIcon,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchProductStock } from '@/services/orderService';
import { Product } from '@/types';
import { toast } from 'sonner';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';

interface BuyNowSectionProps {
  product: Product;
}

export function BuyNowSection({ product }: BuyNowSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [stockInfo, setStockInfo] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  
  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  // Check stock information from API
  const checkRealTimeStock = async () => {
    if (!product.kiosk_token) {
      toast.error('No kiosk token available for this product');
      return;
    }
    
    setStockLoading(true);
    
    try {
      const stockData = await fetchProductStock(product.kiosk_token);
      setStockInfo(stockData);
      toast.success('Stock information updated');
    } catch (error: any) {
      console.error('Failed to fetch stock info:', error);
      toast.error(error.message || 'Failed to fetch stock information');
    } finally {
      setStockLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div>
          <Label htmlFor="product-quantity" className="mb-1 block">Quantity</Label>
          <div className="flex items-center">
            <Input
              id="product-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20"
            />
          </div>
        </div>
        
        {product.kiosk_token && (
          <div className="flex flex-col">
            <button
              onClick={checkRealTimeStock}
              disabled={stockLoading}
              className="text-xs text-primary hover:underline flex items-center mt-auto"
            >
              {stockLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> 
                  Checking...
                </>
              ) : (
                <>
                  <InfoIcon className="h-3 w-3 mr-1" /> 
                  Check real-time stock
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {stockInfo && (
        <div className="p-3 bg-muted rounded-md text-sm">
          {stockInfo.success === "true" ? (
            <>
              <p className="font-medium">{stockInfo.name}</p>
              <div className="flex justify-between mt-1">
                <span>Còn lại: {stockInfo.stock}</span>
                <span>Giá: {stockInfo.price}đ</span>
              </div>
            </>
          ) : (
            <p className="text-amber-800">
              {stockInfo.description || 'Unable to fetch stock information'}
            </p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <Button className="w-full bg-primary hover:bg-primary-dark">
          <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
        </Button>
        
        <BuyNowButton
          kioskToken={product.kiosk_token || ''}
          productId={product.id}
          quantity={quantity}
          isInStock={product.inStock && (
            stockInfo ? stockInfo.stock > 0 : true
          )}
        />
      </div>
    </div>
  );
}
