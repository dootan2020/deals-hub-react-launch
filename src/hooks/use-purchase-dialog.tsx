
import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';
import { convertVNDtoUSD } from '@/utils/currency';
import { fetchProductInfoByKioskToken } from '@/services/product/mockProductService';
import { useProxyConfig } from '@/hooks/useProxyConfig';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const usePurchaseDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStock, setVerifiedStock] = useState<number | null>(null);
  const [verifiedPrice, setVerifiedPrice] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { data: currencySettings } = useCurrencySettings();
  const { proxyConfig } = useProxyConfig();
  const [orderResult, setOrderResult] = useState<any>(null);
  const { user } = useAuth();

  const closeDialog = useCallback(() => {
    setOpen(false);
    setVerifiedStock(null);
    setVerifiedPrice(null);
    setIsVerifying(false);
    setOrderResult(null);
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
          console.log('Order status changed:', payload);
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
  }, [orderResult?.orderId, navigate, closeDialog]);

  const handleConfirm = useCallback(async (quantity: number, promotionCode?: string) => {
    if (!selectedProduct) {
      toast.error('Product information not found');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to purchase');
      return;
    }

    if (verifiedStock !== null && quantity > verifiedStock) {
      toast.error('Requested quantity exceeds available stock');
      return;
    }
    
    setIsProcessing(true);
    try {
      const rate = currencySettings?.vnd_per_usd ?? 24000;
      
      const finalPrice = verifiedPrice || selectedProduct.price;
      const priceUSD = convertVNDtoUSD(finalPrice, rate);
      
      // Use supabase.rpc to call the database function rather than directly using the function name string
      const { data, error } = await supabase.rpc('create_order_and_deduct_balance', {
        p_user_id: user.id,
        p_product_id: selectedProduct.id,
        p_quantity: quantity,
        p_price_per_unit: priceUSD,
        p_promotion_code: promotionCode || null,
        p_kiosk_token: selectedProduct.kiosk_token || null
      });
      
      if (error) {
        console.error('Order API error:', error);
        setOrderError(error.message || 'Failed to place order');
        setOrderStatus('error');
        return { success: false, message: error.message || 'Không thể tạo đơn hàng' };
      }
      
      console.log('Order created successfully with ID:', data);
      setOrderResult({ orderId: data });
      
      toast.success('Order placed! Processing your request...');
      
      // Call the apply-keys edge function
      const { error: applyKeysError } = await supabase.functions
        .invoke('apply-keys', {
          body: { orderId: data }
        });
      
      if (applyKeysError) {
        console.error('Error applying keys:', applyKeysError);
        toast.error('Order placed but error applying keys. Please contact support.');
      }
      
    } catch (error: any) {
      console.error('Error during purchase:', error);
      toast.error(error.message || 'An error occurred during purchase');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedProduct, verifiedStock, verifiedPrice, currencySettings, user]);

  return {
    open,
    selectedProduct,
    openDialog,
    closeDialog,
    handleConfirm,
    isVerifying,
    isProcessing,
    verifiedStock,
    verifiedPrice
  };
};
