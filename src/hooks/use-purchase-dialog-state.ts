
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const usePurchaseDialogState = (open: boolean, productPrice: number) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [liveBalance, setLiveBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  // Fetch live balance directly from Supabase when dialog opens or user changes
  useEffect(() => {
    const fetchLiveBalance = async () => {
      // Only proceed if dialog is open and we have a user
      if (!open || !user?.id) return;
      
      console.log('Fetching live balance for user:', user.id);
      setIsLoadingBalance(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching balance:', error);
          setError('Không thể tải số dư. Vui lòng thử lại.');
          return;
        }
        
        // Explicitly check that we have valid balance data
        if (data && typeof data.balance === 'number') {
          console.log('Received balance data:', data.balance);
          setLiveBalance(data.balance);
        } else {
          console.warn('No valid balance data received, defaulting to 0');
          setLiveBalance(0);
        }
      } catch (err) {
        console.error('Error in fetchLiveBalance:', err);
        setError('Không thể tải số dư. Vui lòng thử lại.');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchLiveBalance();
  }, [open, user]); // Added user as dependency to ensure refetch when user changes

  // Reset form state when dialog opens
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setPromotionCode('');
      setError(null);
    }
  }, [open]);

  const totalPrice = quantity * productPrice;
  const canAfford = liveBalance >= totalPrice;

  return {
    quantity,
    setQuantity,
    promotionCode,
    setPromotionCode,
    error,
    setError,
    liveBalance,
    totalPrice,
    canAfford,
    isLoadingBalance
  };
};
