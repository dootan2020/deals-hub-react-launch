
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export const usePurchaseDialogState = (open: boolean, productPrice: number) => {
  const { userBalance, refreshUserBalance } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [localBalance, setLocalBalance] = useState(0);
  
  // Update localBalance whenever userBalance changes
  useEffect(() => {
    setLocalBalance(userBalance);
    console.log('userBalance from context updated localBalance:', userBalance);
  }, [userBalance]);
  
  // Refresh balance when dialog opens
  useEffect(() => {
    if (open) {
      console.log('Dialog opened, refreshing user balance');
      refreshUserBalance()
        .then(() => {
          console.log('User balance refresh completed');
        })
        .catch(error => {
          console.error('Error refreshing balance:', error);
        });
      
      // Reset form state
      setQuantity(1);
      setPromotionCode('');
      setError(null);
    }
  }, [open, refreshUserBalance]);

  const totalPrice = quantity * productPrice;
  const canAfford = localBalance >= totalPrice;

  return {
    quantity,
    setQuantity,
    promotionCode,
    setPromotionCode,
    error,
    setError,
    localBalance,
    totalPrice,
    canAfford
  };
};
