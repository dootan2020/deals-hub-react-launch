
import React from 'react';
import { calculateFee, calculateNetAmount } from '@/utils/payment';

interface PayPalDetailsProps {
  amount: number;
}

export const PayPalDetails: React.FC<PayPalDetailsProps> = ({ amount }) => {
  // Guard against invalid amounts
  if (isNaN(amount) || amount <= 0) {
    return null;
  }
  
  const fee = calculateFee(amount);
  const netAmount = calculateNetAmount(amount);
  
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="text-sm font-medium mb-2">Chi tiết thanh toán</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Số tiền nạp:</span>
          <span>${amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Phí PayPal:</span>
          <span>-${fee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-2">
          <span>Số tiền thực nhận:</span>
          <span>${netAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
