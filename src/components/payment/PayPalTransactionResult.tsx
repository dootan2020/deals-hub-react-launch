
import { Button } from '@/components/ui/button';
import { XOctagon, Loader2, RefreshCw } from 'lucide-react';

interface PayPalTransactionResultProps {
  paymentError: string | null;
  transactionId: string | null;
  isShowPayPal: boolean;
  onCloseError: () => void;
  onVerify: () => void;
  isVerifying: boolean;
}

export const PayPalTransactionResult: React.FC<PayPalTransactionResultProps> = ({
  paymentError,
  transactionId,
  isShowPayPal,
  onCloseError,
  onVerify,
  isVerifying,
}) => (
  <>
    {paymentError && (
      <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 p-3 rounded-md mb-2">
        <XOctagon className="h-5 w-5 text-red-500" />
        <div>
          <span className="font-bold">Thanh toán thất bại:</span> {paymentError}
        </div>
        <Button 
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={onCloseError}
        >
          Đóng
        </Button>
      </div>
    )}
    {transactionId && !isShowPayPal && (
      <div className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 p-3 rounded-md mb-2">
        <div className="flex-1">
          <span className="font-semibold">Giao dịch đã được ghi nhận:</span> 
          <div className="text-sm mt-1">ID: {transactionId}</div>
        </div>
        <Button 
          size="sm"
          variant="outline"
          className="whitespace-nowrap"
          onClick={onVerify}
          disabled={isVerifying}
        >
          {isVerifying
            ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang kiểm tra...</>)
            : (<><RefreshCw className="h-4 w-4 mr-2" /> Kiểm tra trạng thái</>)
          }
        </Button>
      </div>
    )}
  </>
);
