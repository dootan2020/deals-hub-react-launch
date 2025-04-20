import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  ClipboardCopy, 
  AlertCircle, 
  Eye, 
  Loader2, 
  Download 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductKey } from '@/types';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  product_title?: string;
}

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [productKeys, setProductKeys] = useState<ProductKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      // Fetch orders with product title from first order item
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          order_items!inner (
            product:products (
              title
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format orders to include product title from first item
      const formattedOrders = data.map(order => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total_amount: order.total_amount,
        product_title: order.order_items[0]?.product?.title || 'Unknown Product'
      }));

      setOrders(formattedOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductKeys = async (orderId: string) => {
    setIsLoadingKeys(true);
    try {
      // Use rpc to call the database function
      const { data, error } = await supabase.rpc('get_product_keys_by_order', {
        order_id_param: orderId
      });

      if (error) throw error;
      
      // Cast the data to the correct type
      setProductKeys(data as ProductKey[]);
      setSelectedOrder(orderId);
      setDialogOpen(true);
    } catch (err: any) {
      console.error('Error fetching product keys:', err);
      toast.error('Failed to load product keys');
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const downloadKeys = () => {
    if (!productKeys.length) return;
    
    const content = productKeys
      .map((key, index) => `${index + 1}. ${key.key_content}`)
      .join('\n');
      
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keys-${selectedOrder}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Keys downloaded successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  const copyAllKeys = () => {
    const allKeys = productKeys.map(key => key.key_content).join('\n');
    navigator.clipboard.writeText(allKeys)
      .then(() => toast.success('All keys copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const renderOrderStatus = (status: string) => {
    switch (status) {
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
      <Layout>
        <div className="container my-8">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Loading your orders...</span>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container my-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container my-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>View your purchases and product keys</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.product_title}</TableCell>
                      <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>{renderOrderStatus(order.status)}</TableCell>
                      <TableCell className="text-right">
                        {order.status === 'completed' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => fetchProductKeys(order.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Keys
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                          >
                            {order.status === 'processing' ? 'Processing...' : 'No keys'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Order Keys</DialogTitle>
              <DialogDescription>
                Order ID: {selectedOrder?.substring(0, 8)}...
              </DialogDescription>
            </DialogHeader>
            
            {isLoadingKeys ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span>Loading keys...</span>
              </div>
            ) : productKeys.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No keys found for this order.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end gap-2 mb-2">
                  <Button size="sm" variant="outline" onClick={copyAllKeys}>
                    <ClipboardCopy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadKeys}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {productKeys.map((key) => (
                      <div key={key.id} className="flex justify-between items-center p-2 border rounded-md">
                        <span className="font-mono text-sm break-all mr-2">{key.key_content}</span>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => copyToClipboard(key.key_content)}
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
            
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default OrdersPage;
