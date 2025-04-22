
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

  const openDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setOpen(true);
    setQuantity(1);
    setPromotionCode('');
    setVerifiedStock(null);
    setVerifiedPrice(null);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
    setPromotionCode('');
    setVerifiedStock(null);
    setVerifiedPrice(null);
  }, []);

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
          title: "Không thể xác minh sản phẩm",
          description: error.message || "Có lỗi xảy ra khi xác minh sản phẩm",
          variant: "destructive",
        });
        return;
      }

      setVerifiedStock(data?.data?.stock ?? null);
      setVerifiedPrice(data?.data?.price ?? null);
    } catch (err: any) {
      console.error('Stock verification failed:', err);
      toast({
        title: "Không thể xác minh sản phẩm",
        description: err.message || "Có lỗi xảy ra khi xác minh sản phẩm",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [selectedProduct, toast]);

  const handleQuantityChange = useCallback((value: number) => {
    setQuantity(value);
  }, []);

  const handlePromotionCodeChange = useCallback((value: string) => {
    setPromotionCode(value);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedProduct) {
      toast({
        title: "Không thể tạo đơn hàng",
        description: "Không có sản phẩm nào được chọn",
        variant: "destructive",
      });
      return false;
    }

    // Validate quantity
    if (quantity <= 0 || (verifiedStock !== null && quantity > verifiedStock)) {
      toast({
        title: "Không thể tạo đơn hàng",
        description: "Số lượng không hợp lệ",
        variant: "destructive",
      });
      return false;
    }

    setSubmitting(true);
    try {
      const totalAmount = (verifiedPrice || selectedProduct.price) * quantity;

      if (user?.id) {
        const isSuspicious = await recordPurchaseActivity(user.id, totalAmount, selectedProduct.id);
        
        if (isSuspicious) {
          const behaviorAnomaly = await checkUserBehaviorAnomaly(user.id);
          
          if (behaviorAnomaly) {
            toast({
              title: "Không thể xử lý giao dịch",
              description: "Hoạt động đáng ngờ được phát hiện. Vui lòng liên hệ hỗ trợ.",
              variant: "destructive",
            });
            return false;
          }
        }
      }

      const orderResult = await createOrder({
        kioskToken: selectedProduct.kiosk_token,
        productId: selectedProduct.id,
        quantity: quantity,
        promotionCode: promotionCode || undefined,
        priceUSD: totalAmount / 24000
      });

      if (orderResult?.success) {
        toast({
          title: "Đặt hàng thành công",
          description: orderResult.message || "Đơn hàng đã được tạo thành công",
        });
        closeDialog();
        return true;
      } else {
        toast({
          title: "Không thể tạo đơn hàng", 
          description: orderResult?.message || "Có lỗi xảy ra khi tạo đơn hàng",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      toast({
        title: "Không thể tạo đơn hàng",
        description: err.message || "Có lỗi xảy ra khi tạo đơn hàng", 
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
    return false;
  }, [selectedProduct, quantity, promotionCode, verifiedPrice, verifiedStock, user?.id, toast, createOrder, closeDialog]);

  useEffect(() => {
    if (open && selectedProduct) {
      verifyProduct();
    }
  }, [open, selectedProduct, verifyProduct]);

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
    handleConfirm
  };
};
