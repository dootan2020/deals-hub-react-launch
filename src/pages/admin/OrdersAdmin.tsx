
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOrderAdminActions } from '@/hooks/useOrderAdminActions';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import { Loader2 } from 'lucide-react';

export const OrdersAdmin = () => {
  const { orders, isLoading: isLoadingOrders, fetchOrders } = useOrders();
  const { isProcessing, updateOrderStatus, deleteOrder } = useOrderAdminActions();

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, userId: string, newStatus: string, oldStatus: string) => {
    const success = await updateOrderStatus(orderId, userId, newStatus, oldStatus);
    if (success) {
      fetchOrders();
    }
  };

  const handleDeleteOrder = async (orderId: string, userId: string) => {
    const success = await deleteOrder(orderId, userId);
    if (success) {
      fetchOrders();
    }
  };

  if (isLoadingOrders) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Order Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <p className="text-muted-foreground">{orders.length} orders found</p>
          <Button onClick={fetchOrders} variant="outline">
            Refresh
          </Button>
        </div>
        <OrdersTable
          orders={orders}
          isProcessing={isProcessing}
          onStatusChange={handleStatusChange}
          onDeleteOrder={handleDeleteOrder}
        />
      </CardContent>
    </Card>
  );
};

export default OrdersAdmin;
