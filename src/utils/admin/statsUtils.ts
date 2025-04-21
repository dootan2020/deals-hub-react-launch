
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, isSameWeek, isSameMonth } from 'date-fns';
import { Database } from '@/types/database.types';

export type Order = Database['public']['Tables']['orders']['Row'];

export interface DashboardStats {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  completedOrders: number;
  failedOrders: number;
  processingOrders: number;
}

export const calculateOrderStats = (orders: Order[]): DashboardStats => {
  const today = new Date();
  
  const todayRevenue = orders
    .filter((order) => isToday(new Date(order.created_at || '')))
    .reduce((acc, order) => acc + (order.total_price || 0), 0);
    
  const weekRevenue = orders
    .filter((order) => isSameWeek(new Date(order.created_at || ''), today))
    .reduce((acc, order) => acc + (order.total_price || 0), 0);
    
  const monthRevenue = orders
    .filter((order) => isSameMonth(new Date(order.created_at || ''), today))
    .reduce((acc, order) => acc + (order.total_price || 0), 0);
  
  const completedOrders = orders.filter((order) => order.status === 'completed').length;
  const failedOrders = orders.filter((order) => order.status === 'failed').length;
  const processingOrders = orders.filter((order) => order.status === 'processing').length;

  return {
    todayRevenue,
    weekRevenue,
    monthRevenue,
    completedOrders,
    failedOrders,
    processingOrders
  };
};
