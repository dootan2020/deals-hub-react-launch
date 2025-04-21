
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, isSameWeek, isSameMonth } from 'date-fns';

// Types
export interface DashboardStats {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  completedOrders: number;
  failedOrders: number;
  processingOrders: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface ProductSales {
  id: string;
  title: string;
  sold: number;
  revenue: number;
  image?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product_id: string;
  product?: {
    title?: string;
    images?: string[];
  };
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
      // Get today, this week, and this month date ranges
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      
      // Fetch orders for calculating revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, total_price, status');
      
      if (ordersError) throw ordersError;
      
      // Calculate revenue stats
      const todayRevenue = orders
        .filter((order) => isToday(new Date(order.created_at)))
        .reduce((acc, order) => acc + (order.total_price || 0), 0);
        
      const weekRevenue = orders
        .filter((order) => isSameWeek(new Date(order.created_at), today))
        .reduce((acc, order) => acc + (order.total_price || 0), 0);
        
      const monthRevenue = orders
        .filter((order) => isSameMonth(new Date(order.created_at), today))
        .reduce((acc, order) => acc + (order.total_price || 0), 0);
      
      // Calculate order stats
      const completedOrders = orders.filter((order) => order.status === 'completed').length;
      const failedOrders = orders.filter((order) => order.status === 'failed').length;
      const processingOrders = orders.filter((order) => order.status === 'processing').length;
      
      // Set stats
      setStats({
        todayRevenue,
        weekRevenue,
        monthRevenue,
        completedOrders,
        failedOrders,
        processingOrders
      });
      
      // Group orders by date for charts
      const dailyRevenueData: RevenueData[] = [];
      const weeklyRevenueData: RevenueData[] = [];
      const monthlyRevenueData: RevenueData[] = [];
      
      // Generate daily data (24 hours)
      for (let i = 0; i < 24; i++) {
        const hour = new Date();
        hour.setHours(i, 0, 0, 0);
        const hourStr = format(hour, 'yyyy-MM-dd HH:00');
        
        const hourOrders = orders.filter(
          (order) => format(new Date(order.created_at), 'yyyy-MM-dd HH') === format(hour, 'yyyy-MM-dd HH')
        );
        
        dailyRevenueData.push({
          date: hourStr,
          revenue: hourOrders.reduce((acc, order) => acc + (order.total_price || 0), 0),
          orders: hourOrders.length
        });
      }
      
      // Generate weekly data (7 days)
      for (let i = 6; i >= 0; i--) {
        const day = subDays(today, i);
        const dayStr = format(day, 'yyyy-MM-dd');
        
        const dayOrders = orders.filter(
          (order) => format(new Date(order.created_at), 'yyyy-MM-dd') === dayStr
        );
        
        weeklyRevenueData.push({
          date: dayStr,
          revenue: dayOrders.reduce((acc, order) => acc + (order.total_price || 0), 0),
          orders: dayOrders.length
        });
      }
      
      // Generate monthly data (30 days)
      for (let i = 29; i >= 0; i--) {
        const day = subDays(today, i);
        const dayStr = format(day, 'yyyy-MM-dd');
        
        const dayOrders = orders.filter(
          (order) => format(new Date(order.created_at), 'yyyy-MM-dd') === dayStr
        );
        
        monthlyRevenueData.push({
          date: dayStr,
          revenue: dayOrders.reduce((acc, order) => acc + (order.total_price || 0), 0),
          orders: dayOrders.length
        });
      }
      
      setRevenueDaily(dailyRevenueData);
      setRevenueWeekly(weeklyRevenueData);
      setRevenueMonthly(monthlyRevenueData);
      
      // Orders by status
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
      
      // Fetch top products
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
      
      // Calculate top products by sales
      const productSales: Record<string, ProductSales> = {};
      
      orderItems.forEach((item: OrderItem) => {
        if (item.product_id) {
          const productId = item.product_id.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              title: item.product?.title || 'Unknown Product',
              sold: 0,
              revenue: 0,
              image: item.product?.images?.[0] || undefined
            };
          }
          
          productSales[productId].sold += item.quantity || 0;
          productSales[productId].revenue += (item.price * item.quantity) || 0;
        }
      });
      
      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      
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
