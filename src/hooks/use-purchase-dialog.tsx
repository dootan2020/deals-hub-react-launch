
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrderApi } from '@/hooks/use-order-api';
import { supabase } from '@/integrations/supabase/client';
import { recordPurchaseActivity, checkUserBehaviorAnomaly } from '@/utils/fraud-detection';
import { Product } from '@/types';
import { usePurchaseToast } from "@/hooks/purchase/usePurchaseToast";

// Dùng helper mới cho toast và trạng thái
export const usePurchaseDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStock, setVerifiedStock] = useState<number | null>(null);
  const [verifiedPrice, setVerifiedPrice] = useState<number | null>(null);

  const { user } = useAuth();
  const { createOrder } = useOrderApi();
  const {
    notifyLoading,
    notifySuccess,
    notifyError,
    handleApiError,
    status: submittingStatus,
    setStatus: setSubmittingStatus,
  } = usePurchaseToast();

  const openDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setOpen(true);
    setQuantity(1);
    setPromotionCode('');
    setVerifiedStock(null);
    setVerifiedPrice(null);
    setSubmittingStatus("idle");
  }, [setSubmittingStatus]);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
    setPromotionCode('');
    setVerifiedStock(null);
    setVerifiedPrice(null);
    setSubmittingStatus("idle");
  }, [setSubmittingStatus]);

  const handleQuantityChange = (value: number) => setQuantity(value);
  const handlePromotionCodeChange = (value: string) => setPromotionCode(value);

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
        notifyError('Không thể xác minh sản phẩm', error.message || 'Có lỗi xảy ra khi xác minh sản phẩm');
        return;
      }
      if (data?.success === false) {
        notifyError('Không thể xác minh sản phẩm', data.message || 'Có lỗi xảy ra khi xác minh sản phẩm');
        return;
      }
      setVerifiedStock(data.data.stock);
      setVerifiedPrice(data.data.price);
    } catch (err: any) {
      notifyError('Không thể xác minh sản phẩm', err.message || 'Có lỗi xảy ra khi xác minh sản phẩm');
    } finally {
      setIsVerifying(false);
    }
  }, [selectedProduct, notifyError]);

  useEffect(() => {
    if (open && selectedProduct) {
      verifyProduct();
    }
  }, [open, selectedProduct, verifyProduct]);

  // Đã gom logic toast, status vào usePurchaseToast
  const handleConfirm = useCallback(async (quantity: number, promotionCode?: string) => {
    if (!selectedProduct) {
      notifyError("Không thể tạo đơn hàng", "Không có sản phẩm nào được chọn");
      return false;
    }
    if (quantity <= 0) {
      notifyError("Không thể tạo đơn hàng", "Số lượng phải lớn hơn 0");
      return false;
    }
    if (verifiedStock === null) {
      notifyError("Không thể tạo đơn hàng", "Không thể xác minh số lượng sản phẩm");
      return false;
    }
    if (quantity > verifiedStock) {
      notifyError("Không thể tạo đơn hàng", "Số lượng vượt quá số lượng sản phẩm hiện có");
      return false;
    }

    notifyLoading();

    try {
      const totalAmount = (verifiedPrice || selectedProduct.price) * quantity;

      if (user?.id) {
        const isSuspicious = await recordPurchaseActivity(user.id, totalAmount, selectedProduct.id);
        if (isSuspicious) {
          const behaviorAnomaly = await checkUserBehaviorAnomaly(user.id);
          if (behaviorAnomaly) {
            notifyError("Không thể xử lý giao dịch", "Hoạt động đáng ngờ được phát hiện. Vui lòng liên hệ hỗ trợ.");
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
            setSubmittingStatus("idle");
            return false;
          }
        }
      }

      const orderResult = await createOrder({
        kioskToken: selectedProduct.kiosk_token,
        productId: selectedProduct.id,
        quantity,
        promotionCode,
        priceUSD: totalAmount / 24000
      });

      if (orderResult?.success) {
        notifySuccess("Mua thành công", "Đơn hàng đã được tạo thành công.");
        setOpen(false);
        setSubmittingStatus("idle");
        return true;
      } else {
        notifyError("Không thể tạo đơn hàng", orderResult?.message || "Có lỗi xảy ra khi tạo đơn hàng");
        setSubmittingStatus("idle");
        return false;
      }
    } catch (err: any) {
      handleApiError(err, "Có lỗi xảy ra khi tạo đơn hàng");
      setSubmittingStatus("idle");
      return false;
    }
  }, [
    selectedProduct,
    notifyError,
    notifyLoading,
    notifySuccess,
    handleApiError,
    setSubmittingStatus,
    verifiedPrice,
    verifiedStock,
    createOrder,
    user?.id
  ]);

  return {
    open,
    selectedProduct,
    quantity,
    promotionCode,
    isVerifying,
    verifiedStock,
    verifiedPrice,
    submitting: submittingStatus === "loading",
    openDialog,
    closeDialog,
    handleQuantityChange,
    handlePromotionCodeChange,
    handleConfirm,
    verifyProduct
  };
};

