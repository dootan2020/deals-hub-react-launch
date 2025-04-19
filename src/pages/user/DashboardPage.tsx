
import { useAuth } from '@/context/AuthContext';
import UserLayout from '@/components/layout/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ShoppingCart, Clock } from 'lucide-react';
import { useOrderStats } from '@/hooks/useOrderStats';

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
      </div>
    </UserLayout>
  );
};

export default DashboardPage;
