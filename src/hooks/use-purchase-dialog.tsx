
import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrderApi } from '@/hooks/use-order-api';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';
import { convertVNDtoUSD } from '@/utils/currency';
import { fetchProductInfoByKioskToken } from '@/services/product/mockProductService';
import { useProxyConfig } from '@/hooks/useProxyConfig';

export const usePurchaseDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStock, setVerifiedStock] = useState<number | null>(null);
  const [verifiedPrice, setVerifiedPrice] = useState<number | null>(null);
  const navigate = useNavigate();
  const { createOrder } = useOrderApi();
  const { data: currencySettings } = useCurrencySettings();
  const { proxyConfig } = useProxyConfig();
  
  // Reset state when dialog closes
  const closeDialog = useCallback(() => {
    setOpen(false);
    setVerifiedStock(null);
    setVerifiedPrice(null);
    setIsVerifying(false);
  }, []);
  
  // Verify stock before opening dialog
  const openDialog = useCallback(async (product: Product) => {
    setSelectedProduct(product);
    setOpen(true);

    // Start stock verification only if we have a kiosk token
    if (product.kiosk_token) {
      setIsVerifying(true);
      try {
        const result = await fetchProductInfoByKioskToken(
          product.kiosk_token,
          null,
          proxyConfig
        );

        if (result.success === "true") {
          setVerifiedStock(Number(result.stock) || 0);
          setVerifiedPrice(Number(result.price) || product.price);
        } else {
          toast.error('Không thể xác minh tồn kho sản phẩm');
          closeDialog();
        }
      } catch (error: any) {
        console.error('Error verifying stock:', error);
        toast.error('Lỗi khi kiểm tra tồn kho');
        closeDialog();
      } finally {
        setIsVerifying(false);
      }
    }
  }, [closeDialog, proxyConfig]);
  
  // Handle purchase confirmation
  const handleConfirm = useCallback(async (quantity: number, promotionCode?: string) => {
    if (!selectedProduct) {
      toast.error('Không tìm thấy thông tin sản phẩm');
      return;
    }

    // Check if we have verified stock data
    if (verifiedStock !== null && quantity > verifiedStock) {
      toast.error('Số lượng vượt quá tồn kho hiện có');
      return;
    }
    
    try {
      // Get the exchange rate
      const rate = currencySettings?.vnd_per_usd ?? 24000;
      
      // Use verified price if available, otherwise use product price
      const finalPrice = verifiedPrice || selectedProduct.price;
      const priceUSD = convertVNDtoUSD(finalPrice, rate);
      
      const result = await createOrder({
        kioskToken: selectedProduct.kiosk_token || '',
        productId: selectedProduct.id,
        quantity,
        promotionCode,
        priceUSD
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
  }, [selectedProduct, verifiedStock, verifiedPrice, createOrder, closeDialog, navigate, currencySettings]);
  
  return {
    open,
    selectedProduct,
    openDialog,
    closeDialog,
    handleConfirm,
    isVerifying,
    verifiedStock,
    verifiedPrice
  };
};
