
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';

interface DialogFooterButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  isVerifying: boolean;
  hasEnoughBalance: boolean;
}

export const DialogFooterButtons = ({
  onCancel,
  onConfirm,
  isSubmitting,
  isVerifying,
  hasEnoughBalance,
}: DialogFooterButtonsProps) => {
  return (
    <>
      <Button 
        variant="outline" 
        className="flex-1" 
        onClick={onCancel} 
        disabled={isSubmitting || isVerifying}
      >
        Hủy bỏ
      </Button>
      <Button 
        variant="default" 
        className="flex-1 bg-primary text-white" 
        disabled={!hasEnoughBalance || isSubmitting || isVerifying}
        onClick={onConfirm}
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
            Đang kiểm tra
          </>
        ) : isSubmitting ? (
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
