
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { StatsCard } from '@/components/admin/dashboard/StatsCard';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { RecentOrdersTable } from '@/components/admin/dashboard/RecentOrdersTable';
import { supabase } from '@/integrations/supabase/client';
import { TrendingDown, TrendingUp, Package2, ShoppingCart, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    weeklyOrders: 0,
    topProduct: {
      title: '',
      sales: 0
    }
  });
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent orders
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            id,
            total_price,
            status,
            created_at,
            user:user_id(email),
            product:product_id(title)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders(orders || []);

        // Fetch weekly revenue data
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: weeklyOrders } = await supabase
          .from('orders')
          .select('total_price, created_at')
          .gte('created_at', weekAgo.toISOString())
          .order('created_at', { ascending: true });

        // Group by date and calculate daily revenue
        const dailyRevenue = (weeklyOrders || []).reduce((acc: any, order: any) => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + order.total_price;
          return acc;
        }, {});

        const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
          date,
          revenue
        }));

        setRevenueData(chartData);

        // Calculate today's stats
        const todayStr = today.toISOString().split('T')[0];
        const todayRevenue = dailyRevenue[todayStr] || 0;
        const weeklyOrderCount = (weeklyOrders || []).length;

        setStats({
          todayRevenue,
          weeklyOrders: weeklyOrderCount,
          topProduct: {
            title: "Email Account Premium",
            sales: 25
          }
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
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
            icon={Package2}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <RevenueChart data={revenueData} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <RecentOrdersTable orders={recentOrders} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
