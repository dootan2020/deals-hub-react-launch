
import { format, subDays } from 'date-fns';
import { Order } from './statsUtils';

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export const generateRevenueData = (orders: Order[]) => {
  const today = new Date();
  
  const dailyRevenueData: RevenueData[] = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(i, 0, 0, 0);
    const hourStr = format(hour, 'yyyy-MM-dd HH:00');
    
    const hourOrders = orders.filter(
      (order) => format(new Date(order.created_at || ''), 'yyyy-MM-dd HH') === format(hour, 'yyyy-MM-dd HH')
    );
    
    return {
      date: hourStr,
      revenue: hourOrders.reduce((acc, order) => acc + (order.total_price || 0), 0),
      orders: hourOrders.length
    };
  });
  
  const weeklyRevenueData: RevenueData[] = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i);
    const dayStr = format(day, 'yyyy-MM-dd');
    
    const dayOrders = orders.filter(
      (order) => format(new Date(order.created_at || ''), 'yyyy-MM-dd') === dayStr
    );
    
    return {
      date: dayStr,
      revenue: dayOrders.reduce((acc, order) => acc + (order.total_price || 0), 0),
      orders: dayOrders.length
    };
  });
  
  const monthlyRevenueData: RevenueData[] = Array.from({ length: 30 }, (_, i) => {
    const day = subDays(today, 29 - i);
    const dayStr = format(day, 'yyyy-MM-dd');
    
    const dayOrders = orders.filter(
      (order) => format(new Date(order.created_at || ''), 'yyyy-MM-dd') === dayStr
    );
    
    return {
      date: dayStr,
      revenue: dayOrders.reduce((acc, order) => acc + (order.total_price || 0), 0),
      orders: dayOrders.length
    };
  });

  return {
    dailyRevenueData,
    weeklyRevenueData,
    monthlyRevenueData
  };
};
