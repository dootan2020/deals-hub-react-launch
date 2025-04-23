
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types';
import OrdersTable from '@/components/admin/orders/OrdersTable';

const OrdersAdmin = () => {
  const { orders: fetchedOrders, loading, fetchOrders, updateOrderStatus, processRefund } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // Convert fetched orders to the expected Order type
  const orders: Order[] = fetchedOrders.map(order => ({
    ...order,
    total_price: order.total_price ?? order.total_amount,
  }));

  useEffect(() => {
    filterOrders(activeTab);
  }, [orders, activeTab]);

  const filterOrders = (status: string) => {
    if (status === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === status));
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (newStatus === 'refunded') {
      await processRefund(orderId);
    } else {
      await updateOrderStatus(orderId, newStatus);
    }
  };

  const handleViewDetails = (orderId: string) => {
    console.log('Viewing order details:', orderId);
  };

  const getPendingCount = () => {
    return orders.filter(order => order.status === 'processing').length;
  };

  const getRefundCount = () => {
    return orders.filter(order => order.status === 'refunded').length;
  };

  return (
    <AdminLayout title="Quản lý đơn hàng">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Xem và quản lý các đơn hàng trong hệ thống</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchOrders()} 
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{orders.length}</CardTitle>
            <CardDescription>Tổng đơn hàng</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{getPendingCount()}</CardTitle>
            <CardDescription>Đơn đang xử lý</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {orders.filter(order => order.status === 'completed').length}
            </CardTitle>
            <CardDescription>Đơn hoàn thành</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{getRefundCount()}</CardTitle>
            <CardDescription>Đơn hoàn tiền</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {getPendingCount() > 0 && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-5 w-5 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Có {getPendingCount()} đơn hàng đang chờ xử lý. Vui lòng kiểm tra và xác nhận.
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" /> Danh sách đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tất cả ({orders.length})</TabsTrigger>
              <TabsTrigger value="processing">
                Đang xử lý ({orders.filter(order => order.status === 'processing').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Hoàn thành ({orders.filter(order => order.status === 'completed').length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Đã hủy ({orders.filter(order => order.status === 'cancelled').length})
              </TabsTrigger>
              <TabsTrigger value="refunded">
                Hoàn tiền ({getRefundCount()})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <OrdersTable 
                orders={filteredOrders}
                isLoading={loading}
                onViewDetails={handleViewDetails}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>
            <TabsContent value="processing">
              <OrdersTable 
                orders={filteredOrders}
                isLoading={loading}
                onViewDetails={handleViewDetails}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>
            <TabsContent value="completed">
              <OrdersTable 
                orders={filteredOrders}
                isLoading={loading}
                onViewDetails={handleViewDetails}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>
            <TabsContent value="cancelled">
              <OrdersTable 
                orders={filteredOrders}
                isLoading={loading}
                onViewDetails={handleViewDetails}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>
            <TabsContent value="refunded">
              <OrdersTable 
                orders={filteredOrders}
                isLoading={loading}
                onViewDetails={handleViewDetails}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default OrdersAdmin;
