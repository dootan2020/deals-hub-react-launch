
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useAdminDashboard = (dateRange: { from: Date; to: Date }) => {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    weeklyOrders: 0,
    topProduct: {
      title: '',
      sales: 0
    }
  });
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
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString())
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders(orders || []);

        // Fetch revenue data
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total_price, created_at')
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString())
          .order('created_at', { ascending: true });

        // Process revenue data
        const dailyRevenue = (revenueData || []).reduce((acc: any, order: any) => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + order.total_price;
          return acc;
        }, {});

        const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
          date,
          revenue
        }));

        setRevenueData(chartData);

        // Calculate stats
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRevenue = dailyRevenue[todayStr] || 0;

        setStats({
          todayRevenue,
          weeklyOrders: (revenueData || []).length,
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
  }, [dateRange]);

  return {
    recentOrders,
    revenueData,
    stats,
    isLoading
  };
};
