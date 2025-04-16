
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package2, ShoppingCart, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  processingOrders: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    processingOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Get total products count
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Get out of stock products
        const { count: outOfStockProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('in_stock', false);

        // Get low stock products (less than 10)
        const { count: lowStockProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .lte('api_stock', 10)
          .eq('in_stock', true);

        // Get total orders
        const { count: totalOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        // Get processing orders
        const { count: processingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'processing');

        setStats({
          totalProducts: totalProducts || 0,
          outOfStockProducts: outOfStockProducts || 0,
          lowStockProducts: lowStockProducts || 0,
          totalOrders: totalOrders || 0,
          processingOrders: processingOrders || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSyncAll = async () => {
    try {
      const response = await fetch(`${window.location.origin}/functions/v1/product-sync?action=sync-all`);
      const result = await response.json();
      
      if (result.success) {
        console.log('Sync completed:', result.productsUpdated, 'products updated');
      } else {
        console.error('Sync failed:', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error syncing products:', error);
    }
  };

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.outOfStockProducts} out of stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products with stock less than 10
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.processingOrders} currently processing
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Synchronization</CardTitle>
            <CardDescription>
              Manually sync all products with the external API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={handleSyncAll}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All Products
            </button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
