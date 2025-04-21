import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useOrderApi } from '@/hooks/use-order-api';
import { supabase } from '@/integrations/supabase/client';
import { recordPurchaseActivity, checkUserBehaviorAnomaly } from '@/utils/fraud-detection';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import { generateIdempotencyKey } from '@/utils/idempotencyUtils';
import { useProductVerification } from './useProductVerification';
import { useOrderIdempotencyKey } from './useOrderIdempotencyKey';
import { logOrderActivity, checkFraudAndReport } from './usePurchaseActivity';

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

function generateOrderIdempotencyKey(userId: string | undefined, productId: string, quantity: number): string {
  return generateIdempotencyKey('order', { 
    user_id: userId || 'anonymous',
    product_id: productId,
    quantity: quantity,
    timestamp: new Date().getTime()
  });
}

export const usePurchaseDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { createOrder } = useOrderApi();

  const {
    isVerifying,
    verifiedStock,
    verifiedPrice,
    verifyProduct,
    setVerifiedStock,
    setVerifiedPrice,
    getLatestStock,
  } = useProductVerification(selectedProduct, open);

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

  useEffect(() => {
    if (open && selectedProduct) {
      verifyProduct();
    }
  }, [open, selectedProduct, verifyProduct]);

  const handleConfirm = useCallback(async (quantity: number, promotionCode?: string) => {
    if (!selectedProduct) {
      toast.error('Không thể tạo đơn hàng', { description: 'Không có sản phẩm nào được chọn' });
      return false;
    }

    if (quantity <= 0) {
      toast.error('Không thể tạo đơn hàng', { description: 'Số lượng phải lớn hơn 0' });
      return false;
    }

    const sanitizedPromoCode = promotionCode ? sanitizeHtml(promotionCode.trim()) : undefined;

    let latestStock = null;
    let latestPrice = null;
    try {
      const { stock, price } = await getLatestStock(selectedProduct.kiosk_token);
      latestStock = stock;
      latestPrice = price;
      setVerifiedStock(stock);
      setVerifiedPrice(price);

      if (quantity > stock) {
        toast.error('Không thể tạo đơn hàng', { description: 'Số lượng vượt quá số lượng sản phẩm hiện có' });
        return false;
      }
    } catch {
      return false;
    }

    setSubmitting(true);

    try {
      const totalAmount = (latestPrice || selectedProduct.price) * quantity;

      const idempotencyKey = useOrderIdempotencyKey(
        user?.id,
        selectedProduct.id,
        quantity
      );

      if (user?.id) {
        const isFraud = await checkFraudAndReport(user.id, totalAmount, selectedProduct.id);
        if (isFraud) {
          setSubmitting(false);
          toast.error("Không thể xử lý giao dịch", {
            description: "Hoạt động đáng ngờ được phát hiện. Vui lòng liên hệ hỗ trợ."
          });
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

      const orderResult = await createOrder({
        kioskToken: selectedProduct.kiosk_token,
        productId: selectedProduct.id,
        quantity: quantity,
        promotionCode: sanitizedPromoCode,
        priceUSD: totalAmount / 24000,
        idempotencyKey: idempotencyKey
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
            idempotencyKey
          }
        });

        toast.success('Đặt hàng thành công', {
          description: orderResult.message || 'Đơn hàng đã được tạo thành công'
        });
        setOpen(false);
        return true;
      } else {
        toast.error('Không thể tạo đơn hàng', {
          description: orderResult?.message || 'Có lỗi xảy ra khi tạo đơn hàng'
        });
        return false;
      }
    } catch (err: any) {
      toast.error('Không thể tạo đơn hàng', {
        description: err.message || 'Có lỗi xảy ra khi tạo đơn hàng'
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [selectedProduct, user?.id, createOrder, setVerifiedStock, setVerifiedPrice, getLatestStock]);

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
