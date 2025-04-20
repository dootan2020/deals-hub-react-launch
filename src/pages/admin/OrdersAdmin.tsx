
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrderApi } from '@/hooks/use-order-api';
import { toast } from 'sonner';
import { AdminOrder } from '@/types';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { OrderDetailsPanel } from '@/components/admin/orders/OrderDetailsPanel';

interface OrderDetails {
  id: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product?: {
      title: string;
    };
  }[];
  details: {
    status: string;
    external_order_id: string | null;
    created_at: string;
    total_price: number;
    promotion_code?: string | null;
    updated_at: string;
  };
}

const OrdersAdmin = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const { checkOrder } = useOrderApi();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          product_id,
          qty,
          total_price,
          status,
          keys,
          external_order_id,
          promotion_code,
          updated_at,
          user_id,
          product:products(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as AdminOrder[] || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = async (orderId: string) => {
    setIsDetailsLoading(true);
    setSelectedOrder(null);
    
    try {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*, product:products(title)')
        .eq('order_id', orderId);
        
      if (itemsError) throw itemsError;

      const { data: orderDetails, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) throw orderError;

      setSelectedOrder({
        id: orderId,
        items: items || [],
        details: orderDetails
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCheckOrderStatus = async (externalOrderId: string) => {
    if (!externalOrderId) {
      toast.error('Order has no external ID');
      return;
    }
    
    try {
      checkOrder({ orderId: externalOrderId });
      toast.success('Order check initiated');
      setTimeout(fetchOrders, 2000);
    } catch (error) {
      console.error('Error checking order:', error);
      toast.error('Failed to check order status');
    }
  };

  return (
    <AdminLayout title="Orders Management">
      <div className="flex justify-end mb-6">
        <Button variant="outline" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="col-span-2">
          <OrdersTable
            orders={orders}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onCheckStatus={handleCheckOrderStatus}
          />
        </div>

        <div>
          <OrderDetailsPanel
            selectedOrder={selectedOrder}
            isDetailsLoading={isDetailsLoading}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrdersAdmin;
