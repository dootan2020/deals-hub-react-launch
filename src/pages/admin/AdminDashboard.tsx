
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
}

const StatCard = ({ title, value, description, icon, linkTo }: StatCardProps) => (
  <Card className="overflow-hidden">
    <Link to={linkTo} className="block h-full hover:bg-muted/5 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="bg-primary/10 w-9 h-9 rounded-lg flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold pb-1">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Link>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    usersCount: 0,
    transactionsTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch product count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        // Fetch orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        // Fetch users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        // Fetch transactions total
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'completed')
          .eq('type', 'deposit');
        
        const transactionsTotal = transactions
          ? transactions.reduce((sum, tx) => sum + Number(tx.amount), 0)
          : 0;
        
        if (productsError || ordersError || usersError || transactionsError) {
          console.error("Error fetching stats:", { 
            productsError, ordersError, usersError, transactionsError 
          });
          return;
        }
        
        setStats({
          productsCount: productsCount || 0,
          ordersCount: ordersCount || 0,
          usersCount: usersCount || 0,
          transactionsTotal,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Tổng quan về hệ thống AccZen.net
        </p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-14" />
              <CardContent>
                <div className="h-8 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Sản phẩm"
            value={stats.productsCount}
            description="Tổng số sản phẩm trong hệ thống"
            icon={<Package className="h-5 w-5" />}
            linkTo="/admin/products"
          />
          <StatCard
            title="Đơn hàng"
            value={stats.ordersCount}
            description="Tổng số đơn hàng đã xử lý"
            icon={<ShoppingCart className="h-5 w-5" />}
            linkTo="/admin/orders"
          />
          <StatCard
            title="Người dùng"
            value={stats.usersCount}
            description="Tổng số người dùng đã đăng ký"
            icon={<Users className="h-5 w-5" />}
            linkTo="/admin/users"
          />
          <StatCard
            title="Doanh thu"
            value={`$${stats.transactionsTotal.toFixed(2)}`}
            description="Tổng doanh thu từ nạp tiền"
            icon={<CreditCard className="h-5 w-5" />}
            linkTo="/admin/transactions"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Các hoạt động đơn hàng mới nhất trên hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chức năng đang được phát triển
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Số dư người dùng</CardTitle>
            <CardDescription>Thống kê số dư của người dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chức năng đang được phát triển
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
