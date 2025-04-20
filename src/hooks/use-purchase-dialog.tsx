import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrderApi } from '@/hooks/use-order-api';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';
import { convertVNDtoUSD } from '@/utils/currency';
import { fetchProductInfoByKioskToken } from '@/services/product/mockProductService';
import { useProxyConfig } from '@/hooks/useProxyConfig';
import { supabase } from '@/integrations/supabase/client';

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
  const [orderResult, setOrderResult] = useState<any>(null);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setVerifiedStock(null);
    setVerifiedPrice(null);
    setIsVerifying(false);
  }, []);

  const openDialog = useCallback(async (product: Product) => {
    setSelectedProduct(product);
    setOpen(true);

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

  useEffect(() => {
    if (!orderResult?.orderId) return;

    const channel = supabase
      .channel('order-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderResult.orderId}`
        },
        async (payload) => {
          if (payload.new.status === 'completed') {
            toast.success('Order completed successfully!');
            closeDialog();
            navigate(`/order-success?orderId=${orderResult.orderId}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderResult?.orderId]);

  const handleConfirm = useCallback(async (quantity: number, promotionCode?: string) => {
    if (!selectedProduct) {
      toast.error('Product information not found');
      return;
    }

    if (verifiedStock !== null && quantity > verifiedStock) {
      toast.error('Requested quantity exceeds available stock');
      return;
    }
    
    try {
      const rate = currencySettings?.vnd_per_usd ?? 24000;
      
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
        const { data: applyKeysResult, error: applyKeysError } = await supabase.functions
          .invoke('apply-keys', {
            body: { orderId: result.orderId }
          });
        
        if (applyKeysError) {
          console.error('Error applying keys:', applyKeysError);
          toast.error('Order placed but error applying keys. Please contact support.');
        }
      } else {
        throw new Error(result.message || 'Could not create order');
      }
    } catch (error: any) {
      console.error('Error during purchase:', error);
      toast.error(error.message || 'An error occurred during purchase');
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
