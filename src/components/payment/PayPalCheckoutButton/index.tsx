
import React, { useState, useEffect } from 'react';
import { PayPalButtons, usePayPalScriptReducer, SCRIPT_LOADING_STATE } from '@paypal/react-paypal-js';
import { toast } from '@/hooks/use-toast';
import { PayPalProcessingState } from '../PayPalProcessingState';
import { PayPalStateError } from '../PayPalStateError';

interface PayPalCheckoutButtonProps {
  amount: number;
  onSuccess: () => void;
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({ amount, onSuccess }) => {
  // Access the PayPal script loading state from the provider
  const [{ isPending, isRejected }, paypalDispatch] = usePayPalScriptReducer();
  const [showButtons, setShowButtons] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Show buttons only when the script is loaded
  useEffect(() => {
    if (!isPending && !isRejected) {
      setShowButtons(true);
    }
    if (isRejected) {
      setErrorMessage('Không thể kết nối với PayPal. Vui lòng thử lại sau.');
    }
  }, [isPending, isRejected]);

  // Handle payment success
  const handleApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      toast.success('Thanh toán thành công qua PayPal!');
      onSuccess();
    });
  };

  // Handle errors
  const handleError = (err: any) => {
    toast.error('Đã có lỗi xảy ra trong quá trình thanh toán với PayPal.');
    console.error('PayPal Checkout error:', err);
  };

  const handleRetry = () => {
    // Reset the PayPal script loading state to trigger a reload
    // Using the correct dispatch type "resetOptions" which is valid for DISPATCH_ACTION
    paypalDispatch({
      type: "resetOptions",
      value: {
        clientId: undefined
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
          createOrder={(data, actions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [{
                amount: {
                  value: amount.toFixed(2),
                  currency_code: 'USD'
                }
              }],
            });
          }}
          onApprove={handleApprove}
          onError={handleError}
          onCancel={() => toast.warning('Thanh toán bị hủy bỏ bởi người dùng.')}
        />
      )}
    </>
  );
};

export default PayPalCheckoutButton;
