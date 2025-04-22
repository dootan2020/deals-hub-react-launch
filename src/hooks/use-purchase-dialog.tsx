
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrderApi } from '@/hooks/use-order-api';
import { supabase } from '@/integrations/supabase/client';
import { recordPurchaseActivity, checkUserBehaviorAnomaly } from '@/utils/fraud-detection';
import { Product } from '@/types';

export const usePurchaseDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStock, setVerifiedStock] = useState<number | null>(null);
  const [verifiedPrice, setVerifiedPrice] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { createOrder } = useOrderApi();

  const openDialog = (product: Product) => {
    setSelectedProduct(product);
    setOpen(true);
    setQuantity(1);
    setPromotionCode('');
    setVerifiedStock(null);
    setVerifiedPrice(null);
  };

  const closeDialog = () => {
    setOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
    setPromotionCode('');
    setVerifiedStock(null);
    setVerifiedPrice(null);
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
  };

  const handlePromotionCodeChange = (value: string) => {
    setPromotionCode(value);
  };

  const verifyProduct = useCallback(async () => {
    if (!selectedProduct) return;

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('order-api', {
        body: {
          action: 'get-stock',
          kioskToken: selectedProduct.kiosk_token
        }
      });

      if (error) {
        console.error('Stock verification error:', error);
        toast({
          title: 'Không thể xác minh sản phẩm',
          description: error.message || 'Có lỗi xảy ra khi xác minh sản phẩm',
          variant: 'destructive',
        });
        return;
      }

      if (data?.success === false) {
        toast({
          title: 'Không thể xác minh sản phẩm',
          description: data.message || 'Có lỗi xảy ra khi xác minh sản phẩm',
          variant: 'destructive',
        });
        return;
      }

      setVerifiedStock(data.data.stock);
      setVerifiedPrice(data.data.price);
    } catch (err: any) {
      console.error('Stock verification failed:', err);
      toast({
        title: 'Không thể xác minh sản phẩm',
        description: err.message || 'Có lỗi xảy ra khi xác minh sản phẩm',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  }, [selectedProduct, toast]);

  useEffect(() => {
    if (open && selectedProduct) {
      verifyProduct();
    }
  }, [open, selectedProduct, verifyProduct]);

  const handleConfirm = useCallback(async (quantity: number, promotionCode?: string) => {
    if (!selectedProduct) {
      toast({
        title: 'Không thể tạo đơn hàng',
        description: 'Không có sản phẩm nào được chọn',
        variant: 'destructive',
      });
      return false;
    }

    if (quantity <= 0) {
      toast({
        title: 'Không thể tạo đơn hàng',
        description: 'Số lượng phải lớn hơn 0',
        variant: 'destructive',
      });
      return false;
    }

    if (verifiedStock === null) {
      toast({
        title: 'Không thể tạo đơn hàng',
        description: 'Không thể xác minh số lượng sản phẩm',
        variant: 'destructive',
      });
      return false;
    }

    if (quantity > verifiedStock) {
      toast({
        title: 'Không thể tạo đơn hàng',
        description: 'Số lượng vượt quá số lượng sản phẩm hiện có',
        variant: 'destructive',
      });
      return false;
    }

    setSubmitting(true);
    try {
      const totalAmount = (verifiedPrice || selectedProduct.price) * quantity;

      // Check if this is suspicious activity
      if (user?.id) {
        const isSuspicious = await recordPurchaseActivity(user.id, totalAmount, selectedProduct.id);
        
        if (isSuspicious) {
          // Also check for broader user behavior anomalies
          const behaviorAnomaly = await checkUserBehaviorAnomaly(user.id);
          
          if (behaviorAnomaly) {
            setSubmitting(false);
            toast.error(
              "Không thể xử lý giao dịch", 
              "Hoạt động đáng ngờ được phát hiện. Vui lòng liên hệ hỗ trợ."
            );
            
            // Log the suspicious activity
            await supabase.functions.invoke("fraud-detection", {
              body: {
                action: "report-suspicious",
                data: {
                  type: 'purchase',
                  user_id: user.id,
                  product_id: selectedProduct.id,
                  amount: totalAmount,
                  details: 'Multiple fraud indicators triggered'
                }
              }
            });
            
            return false;
          }
        }
      }
      
      // Continue with normal order processing
      const orderResult = await createOrder({
        kioskToken: selectedProduct.kiosk_token,
        productId: selectedProduct.id,
        quantity: quantity,
        promotionCode: promotionCode,
        priceUSD: totalAmount / 24000 // Convert VND to USD (approximate rate)
      });

      if (orderResult?.success) {
        toast({
          title: 'Đặt hàng thành công',
          description: orderResult.message || 'Đơn hàng đã được tạo thành công',
        });
        setOpen(false);
        return true;
      } else {
        toast({
          title: 'Không thể tạo đơn hàng',
          description: orderResult?.message || 'Có lỗi xảy ra khi tạo đơn hàng',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      toast({
        title: 'Không thể tạo đơn hàng',
        description: err.message || 'Có lỗi xảy ra khi tạo đơn hàng',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [selectedProduct, toast, quantity, promotionCode, verifiedPrice, verifiedStock, createOrder, user?.id]);

  return {
    open,
    selectedProduct,
    quantity,
    promotionCode,
    isVerifying,
    verifiedStock,
    verifiedPrice,
    submitting,
    openDialog,
    closeDialog,
    handleQuantityChange,
    handlePromotionCodeChange,
    handleConfirm,
    verifyProduct
  };
};
