
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProductVerification(selectedProduct: any, open: boolean) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStock, setVerifiedStock] = useState<number | null>(null);
  const [verifiedPrice, setVerifiedPrice] = useState<number | null>(null);

  const verifyProduct = useCallback(async () => {
    if (!selectedProduct) return;
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('order-api', {
        body: { action: 'get-stock', kioskToken: selectedProduct.kiosk_token }
      });

      if (error) {
        toast.error('Không thể xác minh sản phẩm', { description: error.message || 'Có lỗi xảy ra khi xác minh sản phẩm' });
        setVerifiedStock(null);
        setVerifiedPrice(null);
        return;
      }

      if (data?.success === false || typeof data?.data?.stock !== 'number') {
        toast.error('Không thể xác minh sản phẩm', { description: data?.message || 'Có lỗi xảy ra khi xác minh sản phẩm' });
        setVerifiedStock(null);
        setVerifiedPrice(null);
        return;
      }

      setVerifiedStock(data.data.stock);
      setVerifiedPrice(data.data.price);
    } catch (err: any) {
      toast.error('Không thể xác minh sản phẩm', { description: err.message || 'Có lỗi xảy ra khi xác minh sản phẩm' });
      setVerifiedStock(null);
      setVerifiedPrice(null);
    } finally {
      setIsVerifying(false);
    }
  }, [selectedProduct]);

  const getLatestStock = async (kiosk_token: string) => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('order-api', {
        body: { action: 'get-stock', kioskToken: kiosk_token }
      });
      if (error || data?.success === false || typeof data?.data?.stock !== 'number') {
        throw new Error(error?.message || data?.message || 'Could not get stock');
      }
      return { stock: data.data.stock, price: data.data.price };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    verifiedStock,
    verifiedPrice,
    verifyProduct,
    setVerifiedStock,
    setVerifiedPrice,
    getLatestStock,
  };
}
