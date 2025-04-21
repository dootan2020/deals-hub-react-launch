
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateOrderStats, DashboardStats, Order } from '@/utils/admin/statsUtils';
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
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*');
      
      if (ordersError) throw ordersError;
      
      // Convert to the correct Order type
      const orders = ordersData as Order[];
      
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
      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id (
            title,
            images
          )
        `);
      
      if (itemsError) throw itemsError;

      // Make sure we cast the data to the correct type
      const orderItems = orderItemsData.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product_id: item.product_id as string,
        product: item.product as { title?: string; images?: string[] }
      })) as OrderItem[];
      
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
