
import { useAuth } from '@/context/AuthContext';
import UserLayout from '@/components/layout/UserLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ShoppingCart, Clock, History } from 'lucide-react';
import { useOrderStats } from '@/hooks/useOrderStats';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user, userBalance } = useAuth();
  const { stats, isLoading } = useOrderStats(user?.id);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);

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
          <CardFooter className="pt-0">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/deposit">
                <Wallet className="mr-2 h-4 w-4" />
                Nạp tiền
              </Link>
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
          <CardFooter>
            <Button asChild>
              <Link to="/deposit-history">
                Xem lịch sử nạp tiền
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </UserLayout>
  );
};

export default DashboardPage;
