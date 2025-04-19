
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  product_title?: string;
}

interface OrderHistoryTabProps {
  userId: string;
}

const OrderHistoryTab = ({ userId }: OrderHistoryTabProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Fetch orders with basic information
        const { data, error } = await supabase
          .from('orders')
          .select('id, created_at, status, total_amount')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Enhance orders with product information if needed
        let enhancedOrders = [...data];

        // For each order, get the first product name
        for (let i = 0; i < enhancedOrders.length; i++) {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('product_id')
            .eq('order_id', enhancedOrders[i].id)
            .limit(1)
            .single();
            
          if (orderItems?.product_id) {
            const { data: product } = await supabase
              .from('products')
              .select('title')
              .eq('id', orderItems.product_id)
              .single();
              
            if (product) {
              enhancedOrders[i].product_title = product.title;
            }
          }
        }

        setOrders(enhancedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError('Failed to load order history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const renderOrderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Processing</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading order history...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64 text-red-500">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 p-6">
          <ShoppingBag className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-500">No Orders Yet</h3>
          <p className="text-gray-400 text-center mt-2">
            You haven't made any purchases yet. When you buy something, your order history will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View your past and pending purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{order.product_title || 'N/A'}</TableCell>
                <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                <TableCell>{renderOrderStatus(order.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OrderHistoryTab;
