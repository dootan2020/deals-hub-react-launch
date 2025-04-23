
interface PayPalDetailsProps {
  amount: number;
}

export const PayPalDetails = ({ amount }: PayPalDetailsProps) => {
  const netAmount = amount; // In this case net amount is the same since we're not charging fees

  return (
    <div className="space-y-3 border rounded-md p-4 bg-blue-50/50">
      <div className="flex justify-between text-sm">
        <span>Số tiền nạp:</span>
        <span className="font-medium">${amount.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between text-sm text-green-600">
        <span>Phí giao dịch:</span>
        <span className="font-medium">$0.00</span>
      </div>
      
      <div className="flex justify-between pt-2 border-t">
        <span className="font-medium">Tổng thanh toán:</span>
        <span className="font-bold text-primary">${netAmount.toFixed(2)}</span>
      </div>
    </div>
  );
};
