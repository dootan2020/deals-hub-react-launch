
import React, { useState, useEffect } from 'react';
import {
  PayPalButtons,
  usePayPalScriptReducer,
  SCRIPT_LOADING_STATE
} from '@paypal/react-paypal-js';
import { toast } from '@/hooks/use-toast';
import { PayPalProcessingState } from '../PayPalProcessingState';
import { PayPalStateError } from '../PayPalStateError';

interface PayPalCheckoutButtonProps {
  amount: number;
  onSuccess: () => void;
  onError?: (error: string) => void; // Add the onError prop
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({ amount, onSuccess, onError }) => {
  const [{ isPending, isRejected }, paypalDispatch] = usePayPalScriptReducer();
  const [showButtons, setShowButtons] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !isRejected) {
      setShowButtons(true);
    }
    if (isRejected) {
      setErrorMessage('Không thể kết nối với PayPal. Vui lòng thử lại sau.');
    }
  }, [isPending, isRejected]);

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

  const handleRetry = () => {
    // Reset the PayPal script with correct action type
    paypalDispatch({
      type: 'resetOptions' as any,
      value: {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency: 'USD',
        intent: 'capture'
      }
    });
  };

  if (isPending) {
    return <PayPalProcessingState />;
  }

  if (isRejected) {
    return (
      <PayPalStateError
        errorMessage={errorMessage || 'Lỗi khi tải PayPal.'}
        onRetry={handleRetry}
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
