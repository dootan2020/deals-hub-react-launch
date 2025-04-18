
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Loader2, 
  AlertCircle,
  CheckCircle2, 
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { placeOrder, waitForOrderProcessing } from '@/services/orderService';
import { OrderSuccessModal } from './OrderSuccessModal';

interface BuyNowButtonProps {
  kioskToken: string;
  productId?: string;
  quantity: number;
  promotionCode?: string;
  isInStock: boolean;
  onSuccess?: () => void;
  className?: string; // Added className prop
}

export function BuyNowButton({ 
  kioskToken, 
  productId,
  quantity, 
  promotionCode, 
  isInStock = true, 
  onSuccess,
  className
}: BuyNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [orderProducts, setOrderProducts] = useState<any[] | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const handleBuyNow = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate both kioskToken and productId
      if (!kioskToken || kioskToken.trim() === '') {
        throw new Error('Product information is incomplete: missing kiosk token');
      }
      
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      // Step 1: Place the order
      const orderResponse = await placeOrder({
        kioskToken,
        quantity,
        promotionCode
      });
      
      if (orderResponse.success !== "true" || !orderResponse.order_id) {
        throw new Error(orderResponse.description || 'Order failed');
      }
      
      setOrderId(orderResponse.order_id);
      setOrderProcessing(true);
      toast.info('Order placed! Processing your request...', {
        duration: 3000,
      });
      
      // Step 2: Wait for order processing
      const products = await waitForOrderProcessing(orderResponse.order_id);
      
      setOrderProducts(products);
      setShowModal(true);
      setOrderProcessing(false);
      
      toast.success('Order completed successfully!', {
        duration: 5000,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      
      toast.error('Order failed: ' + (err.message || 'Unknown error'), {
        duration: 5000,
      });
      
      console.error('Buy now error:', err);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };
  
  const retryProcessing = async () => {
    if (!orderId) return;
    
    setRetrying(true);
    setError(null);
    
    try {
      const products = await waitForOrderProcessing(orderId, 1);
      
      setOrderProducts(products);
      setShowModal(true);
      setOrderProcessing(false);
      
      toast.success('Order data retrieved successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Still processing, please try again later');
      toast.error('Failed to retrieve order data: ' + (err.message || 'Unknown error'), {
        duration: 5000,
      });
    } finally {
      setRetrying(false);
    }
  };
  
  // Disable button if the product is not ready for purchase
  const isDisabled = loading || orderProcessing || !isInStock || !kioskToken || kioskToken.trim() === '';
  
  return (
    <>
      <div className="w-full space-y-3">
        <Button 
          className={`w-full py-6 text-base font-medium bg-primary hover:bg-primary-dark transition-all ${className || ''}`}
          disabled={isDisabled}
          onClick={handleBuyNow}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : orderProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Please wait...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Buy Now
            </>
          )}
        </Button>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {orderProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
            <p className="font-medium text-blue-700 mb-1 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order is being processed
            </p>
            <p className="text-blue-600 mb-3">
              Please wait while we prepare your order. This usually takes 5-10 seconds.
            </p>
            
            <div className="w-full bg-blue-200 rounded-full h-1.5 mb-1">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs text-blue-500 text-right">Waiting for confirmation...</p>
          </div>
        )}
        
        {error && orderId && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={retryProcessing}
            disabled={retrying}
          >
            {retrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Retry Getting Order Data
              </>
            )}
          </Button>
        )}
      </div>
      
      {orderProducts && showModal && (
        <OrderSuccessModal
          open={showModal}
          onClose={() => setShowModal(false)}
          orderId={orderId || ''}
          products={orderProducts}
        />
      )}
    </>
  );
}
