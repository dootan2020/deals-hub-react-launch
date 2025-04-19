import { Link } from 'react-router-dom';
import { Wallet, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface BalanceCardProps {
  userBalance: number;
  isRefreshing: boolean;
  onRefreshBalance: () => void;
}

const BalanceCard = ({ userBalance, isRefreshing, onRefreshBalance }: BalanceCardProps) => {
  return (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-md hover:bg-gray-50/50 hover:border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Số dư tài khoản</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(userBalance)}</div>
        <p className="text-xs text-muted-foreground">Số dư hiện tại của bạn</p>
      </CardContent>
      <CardFooter className="pt-0 flex flex-col gap-2">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/deposit">
            <Wallet className="mr-2 h-4 w-4" />
            Nạp tiền
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onRefreshBalance}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Đang cập nhật...' : 'Cập nhật số dư'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BalanceCard;
