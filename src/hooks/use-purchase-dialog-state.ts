
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePurchaseDialogState = (open: boolean, productPrice: number, userId?: string) => {
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch balance directly from Supabase when dialog opens
  useEffect(() => {
    const fetchBalance = async () => {
      if (!open || !userId) return;

      setIsLoadingBalance(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching balance:', error);
          setError('Không thể tải số dư. Vui lòng thử lại.');
          return;
        }

        // Only update balance if we have valid data
        if (data && typeof data.balance === 'number') {
          setBalance(data.balance);
        } else {
          setBalance(0);
          console.warn('No valid balance data received');
        }
      } catch (err) {
        console.error('Error in fetchBalance:', err);
        setError('Không thể tải số dư. Vui lòng thử lại.');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [open, userId]);

  // Reset form state when dialog opens
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setPromotionCode('');
      setError(null);
    }
  }, [open]);

  const totalPrice = quantity * productPrice;
  const canAfford = balance >= totalPrice;

  return {
    quantity,
    setQuantity,
    promotionCode,
    setPromotionCode,
    error,
    setError,
    balance,
    totalPrice,
    canAfford,
    isLoadingBalance
  };
};
