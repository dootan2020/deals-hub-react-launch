import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrderApi } from '@/hooks/use-order-api';
import { supabase } from '@/integrations/supabase/client';
import { recordPurchaseActivity, checkUserBehaviorAnomaly } from '@/utils/fraud-detection';

interface Product {
  id: string;
  kiosk_token: string;
  title: string;
  price: number;
  stockQuantity: number;
  description?: string;
  images?: string[];
  categoryId?: string;
  rating?: number;
  reviewCount?: number;
  badges?: string[];
  features?: string[];
  slug?: string;
  inStock?: boolean;
  specifications?: object;
  createdAt?: string;
  stock?: number;
  shortDescription?: string;
}

async function logOrderActivity({
  orderId,
  userId,
  action,
  oldStatus,
  newStatus,
  metadata,
}: {
  orderId: string;
  userId: string | null;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  metadata?: any;
}) {
  try {
    await supabase.from('order_activities').insert([
      {
        order_id: orderId,
        user_id: userId,
        action,
        old_status: oldStatus,
        new_status: newStatus,
        metadata,
      }
    ]);
    // No need to toast here; for audit only
  } catch (error) {
    // Optionally log to a system like Sentry here
    console.error('Failed to log order activity:', error);
  }
}

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
        setVerifiedStock(null);
        setVerifiedPrice(null);
        return;
      }

      if (data?.success === false || typeof data?.data?.stock !== 'number') {
        toast({
          title: 'Không thể xác minh sản phẩm',
          description: data?.message || 'Có lỗi xảy ra khi xác minh sản phẩm',
          variant: 'destructive',
        });
        setVerifiedStock(null);
        setVerifiedPrice(null);
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
      setVerifiedStock(null);
      setVerifiedPrice(null);
    } finally {
      setIsVerifying(false);
    }
  }, [selectedProduct, toast]);

  useEffect(() => {
    if (open && selectedProduct) {
      verifyProduct();
    }
  }, [open, selectedProduct, verifyProduct]);

  const getLatestStock = async (kiosk_token: string) => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('order-api', {
        body: {
          action: 'get-stock',
          kioskToken: kiosk_token
        }
      });
      if (error || data?.success === false || typeof data?.data?.stock !== 'number') {
        throw new Error(error?.message || data?.message || 'Could not get stock');
      }
      return { stock: data.data.stock, price: data.data.price };
    } catch (e) {
      toast({
        title: 'Không thể xác minh số lượng sản phẩm',
        description: (e as any).message || 'Có lỗi xảy ra khi xác minh số lượng',
        variant: 'destructive',
      });
      throw e;
    } finally {
      setIsVerifying(false);
    }
  };

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

    let latestStock = null;
    let latestPrice = null;
    try {
      const { stock, price } = await getLatestStock(selectedProduct.kiosk_token);
      latestStock = stock;
      latestPrice = price;
      setVerifiedStock(stock);
      setVerifiedPrice(price);

      if (quantity > stock) {
        toast({
          title: 'Không thể tạo đơn hàng',
          description: 'Số lượng vượt quá số lượng sản phẩm hiện có',
          variant: 'destructive',
        });
        return false;
      }
    } catch {
      return false;
    }

    setSubmitting(true);

    try {
      const totalAmount = (latestPrice || selectedProduct.price) * quantity;

      if (user?.id) {
        const isSuspicious = await recordPurchaseActivity(user.id, totalAmount, selectedProduct.id);
        if (isSuspicious) {
          const behaviorAnomaly = await checkUserBehaviorAnomaly(user.id);
          if (behaviorAnomaly) {
            setSubmitting(false);
            toast.error(
              "Không thể xử lý giao dịch",
              "Hoạt động đáng ngờ được phát hiện. Vui lòng liên hệ hỗ trợ."
            );
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

      const orderResult = await createOrder({
        kioskToken: selectedProduct.kiosk_token,
        productId: selectedProduct.id,
        quantity: quantity,
        promotionCode: promotionCode,
        priceUSD: totalAmount / 24000
      });

      if (orderResult?.success && orderResult.orderId) {
        await logOrderActivity({
          orderId: orderResult.orderId,
          userId: user?.id ?? null,
          action: "created",
          metadata: {
            quantity,
            promotionCode,
            price: latestPrice,
            totalAmount,
            productId: selectedProduct.id,
          }
        });

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
  }, [selectedProduct, toast, quantity, promotionCode, createOrder, user?.id]);

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
