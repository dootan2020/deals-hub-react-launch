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
import { Database } from '@/integrations/supabase/types';

type OrderInsert = Database['public']['Tables']['orders']['Insert'];

export const usePurchaseDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStock, setVerifiedStock] = useState<number | null>(null);
  const [verifiedPrice, setVerifiedPrice] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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
    setOrderError(null);
    setOrderStatus('idle');
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

    setIsProcessing(true);
    setOrderStatus('loading');
    setOrderError(null);
    
    try {
      const rate = currencySettings?.vnd_per_usd ?? 24000;
      
      const finalPrice = verifiedPrice || selectedProduct.price;
      const priceUSD = convertVNDtoUSD(finalPrice, rate);
      
      const orderData: OrderInsert = {
        user_id: user.id,
        product_id: selectedProduct.id,
        total_price: priceUSD * quantity,
        qty: quantity,
        promotion_code: promotionCode || null,
        status: 'pending',
        keys: []
      };
      
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();
    
    if (error) {
      console.error('Order API error:', error);
      setOrderError(error.message || 'Failed to place order');
      setOrderStatus('error');
      return { success: false, message: error.message || 'Could not create order' };
    }
    
    console.log('Order created successfully with ID:', data.id);
    setOrderResult({ orderId: data.id });
    setOrderStatus('success');
    
    toast.success('Order placed! Processing your request...');
    
    const { error: applyKeysError } = await supabase.functions
      .invoke('apply-keys', {
        body: { orderId: data.id }
      });
    
    if (applyKeysError) {
      console.error('Error applying keys:', applyKeysError);
      toast.error('Order placed but error applying keys. Please contact support.');
    }
    
    return { success: true, orderId: data.id };
  } catch (error: any) {
    console.error('Error during purchase:', error);
    setOrderError(error.message || 'An error occurred during purchase');
    setOrderStatus('error');
    toast.error(error.message || 'An error occurred during purchase');
    return { success: false, message: error.message || 'An error occurred during purchase' };
  } finally {
    setIsProcessing(false);
  }
}, [selectedProduct, verifiedPrice, currencySettings, user]);

  return {
    open,
    selectedProduct,
    openDialog,
    closeDialog,
    handleConfirm,
    isVerifying,
    isProcessing,
    verifiedStock,
    verifiedPrice,
    orderError,
    orderStatus,
    orderResult
  };
};
