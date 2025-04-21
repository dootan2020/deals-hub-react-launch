
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useDashboardData } from '@/hooks/admin/useDashboardData';
import { StatCard } from '@/components/admin/dashboard/StatCard';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { OrdersChart } from '@/components/admin/dashboard/OrdersChart';
import { TopProductsTable } from '@/components/admin/dashboard/TopProductsTable';
import { Button } from '@/components/ui/button'; // Fix: import Button from the correct location
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, CircleDollarSign, ShoppingCart, Package, PackageOpen, FileBarChart, RefreshCw, BarChart3, ChartPie } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
  const {
    stats,
    revenueDaily,
    revenueWeekly,
    revenueMonthly,
    ordersByStatus,
    topProducts,
    isLoading,
    error,
    refreshData
  } = useDashboardData();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error('Lỗi khi tải dữ liệu Dashboard', {
        description: error.message
      });
    }
  }, [error]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
      toast.success('Dữ liệu đã được cập nhật');
    } catch (err) {
      toast.error('Không thể cập nhật dữ liệu');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return '...';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <AdminLayout title="Thống kê kinh doanh">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">Tổng quan doanh thu</h2>
        <Button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          <span>{isRefreshing ? "Đang cập nhật..." : "Làm mới"}</span>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Doanh thu hôm nay"
          value={formatCurrency(stats?.todayRevenue)}
          icon={CircleDollarSign}
          iconColor="text-green-500"
          isLoading={isLoading}
          description="Tổng doanh thu trong 24 giờ qua"
        />
        <StatCard
          title="Doanh thu tuần này"
          value={formatCurrency(stats?.weekRevenue)}
          icon={TrendingUp}
          iconColor="text-blue-500"
          isLoading={isLoading}
          description="Tính từ đầu tuần đến hiện tại"
          trend="up"
          trendValue="12% so với tuần trước"
        />
        <StatCard
          title="Đơn hàng thành công"
          value={stats?.completedOrders ?? '...'}
          icon={ShoppingCart}
          iconColor="text-emerald-500"
          isLoading={isLoading}
          description="Tổng số đơn đã hoàn thành"
        />
        <StatCard
          title="Đơn hàng thất bại"
          value={stats?.failedOrders ?? '...'}
          icon={TrendingDown}
          iconColor="text-rose-500"
          isLoading={isLoading}
          description={`${stats?.processingOrders || 0} đơn đang xử lý`}
          trend="down"
          trendValue="5% so với tháng trước"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <RevenueChart
            dailyData={revenueDaily}
            weeklyData={revenueWeekly}
            monthlyData={revenueMonthly}
            isLoading={isLoading}
          />
        </div>
        <div className="md:col-span-1">
          <OrdersChart 
            data={ordersByStatus} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      {/* Top products */}
      <div className="mb-8">
        <TopProductsTable 
          data={topProducts}
          isLoading={isLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
