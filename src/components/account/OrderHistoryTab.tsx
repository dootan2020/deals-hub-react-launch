
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Define clear interfaces for data types
interface OrderItem {
  product_id: string;
}

interface Product {
  title: string;
}

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
    const fetchOrderData = async () => {
      setIsLoading(true);
      try {
        await fetchAndEnhanceOrders();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load order history';
        console.error("Error fetching orders:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [userId]);

  // Separated function to fetch and enhance orders
  const fetchAndEnhanceOrders = async () => {
    // Fetch basic order information
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, created_at, status, total_amount')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (orderError) {
      throw new Error(orderError.message);
    }

    // Create a new array of orders, ensuring it's not undefined
    const fetchedOrders: Order[] = orderData || [];
    
    // Enhanced orders with product information
    const enhancedOrders = await enhanceOrdersWithProducts(fetchedOrders);
    
    setOrders(enhancedOrders);
  };

  // Function to add product information to orders
  const enhanceOrdersWithProducts = async (fetchedOrders: Order[]): Promise<Order[]> => {
    const result: Order[] = [];
    
    for (const order of fetchedOrders) {
      // Make a copy of the order to modify
      const enhancedOrder = { ...order };
      
      // Fetch the first product for this order
      const { data: orderItemData, error: itemError } = await supabase
        .from('order_items')
        .select('product_id')
        .eq('order_id', order.id)
        .limit(1)
        .single();
      
      if (!itemError && orderItemData) {
        // Get product title
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('title')
          .eq('id', orderItemData.product_id)
          .single();
          
        if (!productError && productData) {
          enhancedOrder.product_title = productData.title;
        }
      }
      
      result.push(enhancedOrder);
    }
    
    return result;
  };

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
