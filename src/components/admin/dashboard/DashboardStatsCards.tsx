
import { StatsCard } from './StatsCard';
import { DollarSign, ShoppingCart, Package } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    todayRevenue: number;
    weeklyOrders: number;
    topProduct: {
      title: string;
      sales: number;
    };
  };
}

export function DashboardStatsCards({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Doanh thu hôm nay"
        value={new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(stats.todayRevenue)}
        description="So với hôm qua"
        icon={DollarSign}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Đơn hàng tuần này"
        value={stats.weeklyOrders}
        description="7 ngày qua"
        icon={ShoppingCart}
        trend={{ value: 5, isPositive: true }}
      />
      <StatsCard
        title="Sản phẩm bán chạy"
        value={stats.topProduct.title}
        description={`${stats.topProduct.sales} đơn hàng`}
        icon={Package}
      />
    </div>
  );
}
