
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export const usePurchaseDialogState = (open: boolean, productPrice: number) => {
  const { userBalance, refreshUserBalance } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [localBalance, setLocalBalance] = useState(userBalance); // Initialize with current balance
  
  // Update localBalance whenever userBalance changes from context
  useEffect(() => {
    console.log('userBalance from context updated: ', userBalance);
    setLocalBalance(userBalance);
  }, [userBalance]);
  
  // Refresh balance when dialog opens but don't update localBalance here
  // Let the above useEffect handle it when userBalance is actually updated
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
