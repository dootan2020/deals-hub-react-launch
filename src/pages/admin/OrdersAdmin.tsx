
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useOrderApi } from '@/hooks/use-order-api';
import { toast } from 'sonner';

interface Order {
  id: string;
  external_order_id: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    title: string;
  };
}

interface OrderDetails {
  id: string;
  items: OrderItem[];
  details: {
    status: string;
    external_order_id: string | null;
    created_at: string;
    total_amount: number;
    promotion_code?: string | null;
    updated_at: string;
  };
}

const OrdersAdmin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const { checkOrder } = useOrderApi();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match the Order interface (total_price to total_amount)
      const mappedOrders = (data || []).map(order => ({
        ...order,
        total_amount: order.total_price
      }));
      
      setOrders(mappedOrders);
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
      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*, product:products(title)')
        .eq('order_id', orderId);
        
      if (itemsError) throw itemsError;

      // Get the order details
      const { data: orderDetails, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) throw orderError;

      setSelectedOrder({
        id: orderId,
        items: items || [],
        details: {
          ...orderDetails,
          total_amount: orderDetails.total_price // Map total_price to total_amount
        }
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
      setTimeout(fetchOrders, 2000); // Refresh after a delay
    } catch (error) {
      console.error('Error checking order:', error);
      toast.error('Failed to check order status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>External ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.id.slice(0, 8)}...</div>
                      </TableCell>
                      <TableCell>{order.external_order_id || '—'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleViewDetails(order.id)}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          {order.external_order_id && order.status === 'processing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckOrderStatus(order.external_order_id!)}
                            >
                              Check Status
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          {selectedOrder ? (
            <div className="p-4 border rounded-md">
              <h3 className="mb-4 text-lg font-medium">Order Details</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">{selectedOrder.id}</p>
              </div>
              
              {selectedOrder.details && (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{selectedOrder.details.status}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">External Order ID</p>
                    <p className="font-medium">{selectedOrder.details.external_order_id || '—'}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">{formatDate(selectedOrder.details.created_at)}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium">${selectedOrder.details.total_amount.toFixed(2)}</p>
                  </div>
                </>
              )}
              
              <h4 className="mt-6 mb-2 font-medium">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-2 border rounded">
                    <p className="font-medium">{item.product?.title || 'Unknown Product'}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Quantity: {item.quantity}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isDetailsLoading ? (
            <div className="p-4 text-center border rounded-md">
              Loading order details...
            </div>
          ) : (
            <div className="p-4 text-center border rounded-md">
              Select an order to view details
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrdersAdmin;
