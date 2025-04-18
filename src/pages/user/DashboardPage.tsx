
import { useEffect, useState } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ShoppingCart, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OrderStats {
  totalOrders: number;
  processingOrders: number;
  completedOrders: number;
}

const DashboardPage = () => {
  const { user, userBalance } = useAuth();
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    processingOrders: 0,
    completedOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderStats = async () => {
      if (!user) return;

      try {
        // Using a simpler approach to avoid type instantiation issues
        
        // Get total orders count
        const { error: totalError, count: totalCount } = await supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);
        
        // Get processing orders count
        const { error: processingError, count: processingCount } = await supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'processing');
        
        // Get completed orders count
        const { error: completedError, count: completedCount } = await supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'completed');

        // Check for errors
        if (totalError || processingError || completedError) {
          console.error('Error fetching order statistics', { 
            totalError, 
            processingError, 
            completedError
          });
        }

        // Update state with counts (defaulting to 0 if null)
        setOrderStats({
          totalOrders: totalCount ?? 0,
          processingOrders: processingCount ?? 0,
          completedOrders: completedCount ?? 0
        });
      } catch (error) {
        console.error('Error fetching order stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderStats();
  }, [user]);

  return (
    <UserLayout title="Bảng điều khiển">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Số dư tài khoản</CardTitle>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${userBalance.toLocaleString('vi-VN')} VNĐ`}
            </div>
            <p className="text-xs text-muted-foreground">
              Số dư hiện tại của bạn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng đang xử lý</CardTitle>
            <ShoppingCart className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : orderStats.processingOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Trên tổng số {orderStats.totalOrders} đơn hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng đã hoàn thành</CardTitle>
            <Clock className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : orderStats.completedOrders}
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
