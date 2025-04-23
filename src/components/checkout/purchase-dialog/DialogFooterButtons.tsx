
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';

export interface DialogFooterButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  isVerifying: boolean;
  hasEnoughBalance: boolean;
  onClose?: () => void; // Alias for onCancel
  onPurchase?: () => Promise<void>; // Alias for onConfirm
  isProcessing?: boolean; // Alias for isSubmitting
  hasBalance?: boolean; // Alias for hasEnoughBalance
  isLoadingBalance?: boolean;
}

export const DialogFooterButtons = ({
  onCancel,
  onConfirm,
  isSubmitting,
  isVerifying,
  hasEnoughBalance,
  onClose,
  onPurchase,
  isProcessing,
  hasBalance,
  isLoadingBalance = false,
}: DialogFooterButtonsProps) => {
  // Use aliases if provided
  const handleCancel = onClose || onCancel;
  const handleConfirm = onPurchase ? () => { onPurchase(); } : onConfirm;
  const isSubmittingOrProcessing = isSubmitting || isProcessing;
  const hasEnoughBalanceOrHasBalance = hasEnoughBalance || hasBalance;
  
  return (
    <>
      <Button 
        variant="outline" 
        className="flex-1" 
        onClick={handleCancel} 
        disabled={isSubmittingOrProcessing || isVerifying}
      >
        Hủy bỏ
      </Button>
      <Button 
        variant="default" 
        className="flex-1 bg-primary text-white" 
        disabled={!hasEnoughBalanceOrHasBalance || isSubmittingOrProcessing || isVerifying || isLoadingBalance}
        onClick={handleConfirm}
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
            Đang kiểm tra
          </>
        ) : isSubmittingOrProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
            Đang xử lý
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" /> 
            Thanh toán
          </>
        )}
      </Button>
    </>
  );
};

export default DialogFooterButtons;
