
import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrderApi } from '@/hooks/use-order-api';

export const usePurchaseDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const navigate = useNavigate();
  const { createOrder } = useOrderApi();
  
  // Open dialog with product
  const openDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setOpen(true);
  }, []);
  
  // Close dialog
  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);
  
  // Handle purchase confirmation
  const handleConfirm = useCallback(async (quantity: number, promotionCode?: string) => {
    if (!selectedProduct) {
      toast.error('Không tìm thấy thông tin sản phẩm');
      return;
    }
    
    try {
      const result = await createOrder({
        kioskToken: selectedProduct.kiosk_token || '',
        productId: selectedProduct.id,
        quantity,
        promotionCode
      });
      
      if (result.success && result.orderId) {
        toast.success('Đặt hàng thành công!');
        closeDialog();
        navigate(`/order-success?orderId=${result.orderId}`);
      } else {
        throw new Error(result.message || 'Không thể tạo đơn hàng');
      }
    } catch (error: any) {
      console.error('Error during purchase:', error);
      toast.error(error.message || 'Đã xảy ra lỗi khi đặt hàng');
    }
  }, [selectedProduct, createOrder, closeDialog, navigate]);
  
  return {
    open,
    selectedProduct,
    openDialog,
    closeDialog,
    handleConfirm
  };
};
