import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DepositHistoryCardProps {
  isAdmin: boolean;
  isStaff: boolean;
  isRefreshing: boolean;
  onProcessTransaction: (transactionId: string) => void;
  onCheckOrder: (orderId: string) => void;
}

const DepositHistoryCard = ({
  isAdmin,
  isStaff,
  isRefreshing,
  onProcessTransaction,
  onCheckOrder,
}: DepositHistoryCardProps) => {
  return (
    <Card className="lg:col-span-3 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-gray-50/50 hover:border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lịch sử nạp tiền</CardTitle>
        <History className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Xem lịch sử các giao dịch nạp tiền của bạn
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button asChild className="mr-2">
          <Link to="/deposit-history">Xem lịch sử nạp tiền</Link>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => onCheckOrder('9HB88101NP1033700')}
          disabled={isRefreshing}
          title="Kiểm tra và xử lý đơn hàng 9HB88101NP1033700"
        >
          {isRefreshing ? 'Đang xử lý...' : 'Xử lý đơn #9HB88101NP1033700'}
        </Button>
        
        {(isAdmin || isStaff) && (
          <>
            <Button 
              variant="outline" 
              onClick={() => onProcessTransaction('4EY84172EU8800452')}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Đang xử lý...' : 'Xử lý giao dịch #4EY84172EU8800452'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onProcessTransaction('9HB88101NP1033700')}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Đang xử lý...' : 'Xử lý giao dịch #9HB88101NP1033700'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default DepositHistoryCard;
