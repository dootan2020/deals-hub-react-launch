
import { Button } from '@/components/ui/button';
import { XOctagon, Loader2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface PayPalTransactionResultProps {
  paymentError: string | null;
  transactionId: string | null;
  isShowPayPal: boolean;
  onCloseError: () => void;
  onVerify: () => void;
  isVerifying: boolean;
  paymentStatus?: 'pending' | 'completed' | 'failed' | null;
}

export const PayPalTransactionResult: React.FC<PayPalTransactionResultProps> = ({
  paymentError,
  transactionId,
  isShowPayPal,
  onCloseError,
  onVerify,
  isVerifying,
  paymentStatus
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Status based styling
  const getStatusUI = () => {
    if (paymentStatus === 'completed') {
      return {
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      };
    }
    else if (paymentStatus === 'failed') {
      return {
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: <XOctagon className="h-5 w-5 text-red-500" />
      };
    }
    return {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: <AlertCircle className="h-5 w-5 text-blue-500" />
    };
  };

  return (
    <>
      {paymentError && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 p-3 rounded-md mb-2">
          <XOctagon className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
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
        <div className={`flex items-center gap-2 ${getStatusUI().bgColor} ${getStatusUI().textColor} border ${getStatusUI().borderColor} p-3 rounded-md mb-2 ${isCollapsed ? 'h-14 overflow-hidden' : ''}`}>
          {getStatusUI().icon}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {paymentStatus === 'completed' ? 'Giao dịch thành công:' : 
                 paymentStatus === 'failed' ? 'Giao dịch thất bại:' : 
                 'Giao dịch đã được ghi nhận:'}
              </span>
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className="text-xs underline ml-2"
              >
                {isCollapsed ? 'Xem chi tiết' : 'Thu gọn'}
              </button>
            </div>
            <div className={`text-sm mt-1 ${isCollapsed ? 'hidden' : 'block'}`}>
              ID: {transactionId}
              {paymentStatus === 'pending' && (
                <div className="mt-2 text-xs italic">
                  Trạng thái giao dịch đang được xử lý và số dư sẽ được cập nhật sau khi xác nhận từ PayPal.
                </div>
              )}
            </div>
          </div>
          <Button 
            size="sm"
            variant="outline"
            className="whitespace-nowrap ml-auto"
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
};
