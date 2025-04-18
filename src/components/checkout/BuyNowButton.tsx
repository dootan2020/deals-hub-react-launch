
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2, CheckCircle2 } from 'lucide-react';
import { OrderSuccessModal } from './OrderSuccessModal';
import { PurchaseConfirmationModal } from './PurchaseConfirmationModal';
import { OrderError } from './OrderError';
import { OrderProcessing } from './OrderProcessing';
import { useBuyNow } from '@/hooks/use-buy-now';
import { Product } from '@/types';

interface BuyNowButtonProps {
  kioskToken: string;
  productId?: string;
  quantity: number;
  promotionCode?: string;
  isInStock: boolean;
  onSuccess?: () => void;
  className?: string;
  product?: Product;
}

export function BuyNowButton({ 
  kioskToken, 
  productId,
  quantity, 
  promotionCode, 
  isInStock = true, 
  onSuccess,
  className,
  product
}: BuyNowButtonProps) {
  const {
    loading,
    orderProcessing,
    error,
    retrying,
    orderProducts,
    orderId,
    showModal,
    showConfirmation,
    setShowModal,
    setShowConfirmation,
    handleBuyNow,
    handleConfirmPurchase,
    retryProcessing
  } = useBuyNow({
    kioskToken,
    productId,
    quantity,
    promotionCode,
    onSuccess,
    product
  });

  const isDisabled = loading || orderProcessing || !isInStock || !kioskToken || kioskToken.trim() === '';

  return (
    <>
      <div className="w-full space-y-3">
        <Button 
          className={`w-full py-6 text-base font-medium bg-primary hover:bg-primary-dark transition-all ${className || ''}`}
          disabled={isDisabled}
          onClick={handleBuyNow}
          type="button"
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
        
        {error && <OrderError error={error} />}
        {orderProcessing && <OrderProcessing />}
        
        {error && orderId && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={retryProcessing}
            disabled={retrying}
            type="button"
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
      
      {product && (
        <PurchaseConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmPurchase}
          product={product}
          quantity={quantity}
        />
      )}
      
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
