
import React, { useState, useEffect } from 'react';
import {
  PayPalButtons,
  usePayPalScriptReducer,
  SCRIPT_LOADING_STATE
} from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import { PayPalProcessingState } from '../PayPalProcessingState';
import { PayPalStateError } from '../PayPalStateError';
import { supabase } from '@/integrations/supabase/client';

interface PayPalCheckoutButtonProps {
  amount: number;
  onSuccess: () => void;
  onError?: (error: string) => void;
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({ amount, onSuccess, onError }) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [showButtons, setShowButtons] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !isRejected) {
      setShowButtons(true);
    }
    if (isRejected) {
      setErrorMessage('Không thể kết nối với PayPal. Vui lòng thử lại sau.');
      if (onError) onError('Không thể kết nối với PayPal. Vui lòng thử lại sau.');
    }
  }, [isPending, isRejected, onError]);

  const createOrder = (_data: any, actions: any) => {
    return actions.order.create({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            value: amount.toFixed(2),
            currency_code: 'USD'
          }
        }
      ]
    });
  };

  const handleApprove = (_data: any, actions: any) => {
    return actions.order.capture().then((_details: any) => {
      toast.success('Thanh toán thành công qua PayPal!');
      onSuccess();
    });
  };

  const handleError = (err: any) => {
    const errorMessage = err?.message || 'Đã có lỗi xảy ra trong quá trình thanh toán với PayPal.';
    toast.error(errorMessage);
    console.error('PayPal Checkout error:', err);
    
    // Call the onError callback if provided
    if (onError) {
      onError(errorMessage);
    }
  };

  const handleCancel = () => {
    toast.warning('Thanh toán bị hủy bỏ bởi người dùng.');
  };

  if (isPending) {
    return <PayPalProcessingState />;
  }

  if (isRejected || errorMessage) {
    return (
      <PayPalStateError
        errorMessage={errorMessage || 'Lỗi khi tải PayPal.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <>
      {showButtons && (
        <PayPalButtons
          style={{ layout: 'horizontal', color: 'blue', shape: 'pill', label: 'pay' }}
          forceReRender={[amount]}
          createOrder={createOrder}
          onApprove={handleApprove}
          onError={handleError}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default PayPalCheckoutButton;
