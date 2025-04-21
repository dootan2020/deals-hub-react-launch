
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowDownUp, FileText, Trash2, Banknote } from 'lucide-react';
import { useAdminActions } from '@/hooks/admin/useAdminActions';
import { normalizeUserField } from '@/hooks/orderUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OrdersAdmin = () => {
  const { orders, isLoading, fetchOrders } = useOrders();
  const { updateOrderStatus, deleteOrder, isProcessing } = useAdminActions();
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleStatusChange = async (orderId: string, userId: string, newStatus: string, oldStatus: string) => {
    await updateOrderStatus(orderId, userId, newStatus, oldStatus);
    fetchOrders();
  };

  const handleDeleteOrder = async (orderId: string, userId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(orderId, userId);
      fetchOrders();
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      <div className="bg-white rounded-md shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">All Orders</h2>
          <Button 
            size="sm"
            variant="outline" 
            onClick={() => fetchOrders()}
            disabled={isLoading}
          >
            <ArrowDownUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{normalizeUserField(order.user).email}</TableCell>
                  <TableCell>{order.product?.title || 'Unknown Product'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center space-x-2">
                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, order.user_id, value, order.status)}
                        disabled={isProcessing}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Set Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        asChild
                      >
                        <a href={`/admin/orders/${order.id}`}>
                          <FileText className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteOrder(order.id, order.user_id)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OrdersAdmin;
