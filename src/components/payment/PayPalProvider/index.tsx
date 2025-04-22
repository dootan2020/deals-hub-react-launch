
import React from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { usePayPalClientId } from '../hooks/usePayPalClientId';

interface PayPalProviderProps {
  children: React.ReactNode;
}

export const PayPalProvider: React.FC<PayPalProviderProps> = ({ children }) => {
  const { paypalClientId, errorMessage } = usePayPalClientId();

  if (errorMessage) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <p className="font-medium">PayPal không khả dụng</p>
        <p className="text-sm mt-1">{errorMessage}</p>
      </div>
    );
  }

  if (!paypalClientId) {
    return (
      <div className="p-4 border rounded-md bg-gray-50">
        <div className="h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-center text-sm text-gray-500 mt-2">Đang tải cấu hình PayPal...</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider 
      options={{
        clientId: paypalClientId,
        currency: 'USD',
        intent: 'capture'
      }}
      deferLoading={false}
    >
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;
