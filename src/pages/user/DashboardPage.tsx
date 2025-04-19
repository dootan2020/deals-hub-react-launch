
import { useAuth } from '@/context/AuthContext';
import UserLayout from '@/components/layout/UserLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ShoppingCart, Clock, History, RefreshCw } from 'lucide-react';
import { useOrderStats } from '@/hooks/useOrderStats';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { processSpecificTransaction } from '@/utils/paymentUtils';

const DashboardPage = () => {
  const { user, userBalance, refreshUserBalance } = useAuth();
  const { stats, isLoading } = useOrderStats(user?.id);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);

  const handleRefreshBalance = async () => {
    try {
      setIsRefreshing(true);
      await refreshUserBalance();
      toast.success('Cập nhật số dư thành công!');
    } catch (error) {
      toast.error('Không thể cập nhật số dư.');
      console.error('Error refreshing balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to manually process a specific transaction
  const handleProcessTransaction = async (transactionId: string) => {
    try {
      setIsRefreshing(true);
      toast.info(`Đang xử lý giao dịch ${transactionId}...`);
      
      const result = await processSpecificTransaction(transactionId);
      
      if (result.success) {
        toast.success('Xử lý giao dịch thành công!');
        await refreshUserBalance();
      } else {
        toast.error(`Lỗi: ${result.error || 'Không thể xử lý giao dịch'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <UserLayout title="Bảng điều khiển">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Số dư tài khoản</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : formatCurrency(userBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Số dư hiện tại của bạn
            </p>
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
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Đang cập nhật...' : 'Cập nhật số dư'}
            </Button>
          </CardFooter>
        </Card>

        {/* Processing Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng đang xử lý</CardTitle>
            <ShoppingCart className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.processing}
            </div>
            <p className="text-xs text-muted-foreground">
              Trên tổng số {stats.total} đơn hàng
            </p>
          </CardContent>
        </Card>

        {/* Completed Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng đã hoàn thành</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              Đơn hàng thành công
            </p>
          </CardContent>
        </Card>

        {/* Deposit History Card */}
        <Card className="lg:col-span-3">
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
              <Link to="/deposit-history">
                Xem lịch sử nạp tiền
              </Link>
            </Button>
            {/* Hidden button for admin/support to process the specific transaction */}
            {(user && (userRoles.includes('admin') || userRoles.includes('staff'))) && (
              <Button 
                variant="outline" 
                onClick={() => handleProcessTransaction('4EY84172EU8800452')}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Đang xử lý...' : 'Xử lý giao dịch #4EY84172EU8800452'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </UserLayout>
  );
};

export default DashboardPage;
