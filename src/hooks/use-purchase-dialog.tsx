
import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrderApi } from '@/hooks/use-order-api';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';
import { convertVNDtoUSD } from '@/utils/currency';

export const usePurchaseDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const navigate = useNavigate();
  const { createOrder } = useOrderApi();
  const { data: currencySettings } = useCurrencySettings();
  
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
      // Get the exchange rate
      const rate = currencySettings?.vnd_per_usd ?? 24000;
      
      // Calculate the USD price
      const priceUSD = convertVNDtoUSD(selectedProduct.price, rate);
      
      const result = await createOrder({
        kioskToken: selectedProduct.kiosk_token || '',
        productId: selectedProduct.id,
        quantity,
        promotionCode,
        priceUSD // Add the USD price to the order data
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
  }, [selectedProduct, createOrder, closeDialog, navigate, currencySettings]);
  
  return {
    open,
    selectedProduct,
    openDialog,
    closeDialog,
    handleConfirm
  };
};
