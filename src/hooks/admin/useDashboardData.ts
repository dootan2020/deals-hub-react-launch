
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateOrderStats, DashboardStats } from '@/utils/admin/statsUtils';
import { generateRevenueData, RevenueData } from '@/utils/admin/revenueUtils';
import { calculateProductSales, ProductSales, OrderItem } from '@/utils/admin/productSalesUtils';

interface OrdersByStatus {
  status: string;
  count: number;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueDaily, setRevenueDaily] = useState<RevenueData[]>([]);
  const [revenueWeekly, setRevenueWeekly] = useState<RevenueData[]>([]);
  const [revenueMonthly, setRevenueMonthly] = useState<RevenueData[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, total_price, status');
      
      if (ordersError) throw ordersError;
      
      // Calculate stats
      const statsData = calculateOrderStats(orders);
      setStats(statsData);
      
      // Generate revenue data
      const { dailyRevenueData, weeklyRevenueData, monthlyRevenueData } = generateRevenueData(orders);
      setRevenueDaily(dailyRevenueData);
      setRevenueWeekly(weeklyRevenueData);
      setRevenueMonthly(monthlyRevenueData);
      
      // Calculate orders by status
      const statusCounts: Record<string, number> = {};
      orders.forEach(order => {
        if (order.status) {
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        }
      });
      
      const orderStatusData = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));
      
      setOrdersByStatus(orderStatusData);
      
      // Fetch and calculate top products
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id, 
          quantity, 
          price, 
          product_id, 
          product:product_id (
            title,
            images
          )
        `);
      
      if (itemsError) throw itemsError;
      
      const topProductsList = calculateProductSales(orderItems);
      setTopProducts(topProductsList);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  return {
    stats,
    revenueDaily,
    revenueWeekly,
    revenueMonthly,
    ordersByStatus,
    topProducts,
    isLoading,
    error,
    refreshData: fetchDashboardData
  };
};
