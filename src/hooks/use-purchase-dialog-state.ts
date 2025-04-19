
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePurchaseDialogState = (open: boolean, productPrice: number, userId?: string) => {
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Reset form state when dialog opens
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setPromotionCode('');
      setError(null);
    }
  }, [open]);

  // Fetch balance directly from Supabase when dialog opens
  useEffect(() => {
    const fetchBalance = async () => {
      if (!open || !userId) return;

      setIsLoadingBalance(true);
      setError(null);

      try {
        console.log('Fetching balance for user in dialog:', userId);
        
        // Force refresh the session before fetching balance
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session refresh error in dialog:', sessionError);
          throw new Error('Không thể làm mới phiên đăng nhập');
        }
        
        if (!sessionData.session) {
          console.error('No active session found in dialog');
          throw new Error('Phiên đăng nhập không hợp lệ');
        }

        // Get fresh balance data directly from database
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Balance fetch error in dialog:', error);
          throw error;
        }

        // Validate and update balance
        if (data && typeof data.balance === 'number') {
          console.log('Balance fetched successfully in dialog:', data.balance);
          setBalance(data.balance);
        } else {
          console.warn('No valid balance data received in dialog');
          setBalance(0);
          toast.error('Không thể tải số dư. Đang hiển thị số dư mặc định.');
        }
      } catch (err) {
        console.error('Error fetching balance in dialog:', err);
        setError('Không thể tải số dư. Vui lòng thử lại.');
        setBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    // Fetch balance whenever dialog opens
    if (open) {
      fetchBalance();
    }
  }, [open, userId]);

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
