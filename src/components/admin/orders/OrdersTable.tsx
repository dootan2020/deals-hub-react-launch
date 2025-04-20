
import { AdminOrder } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface OrdersTableProps {
  orders: AdminOrder[];
  isLoading: boolean;
  onViewDetails: (orderId: string) => void;
  onCheckStatus: (externalOrderId: string) => void;
}

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

export const OrdersTable = ({ orders, isLoading, onViewDetails, onCheckStatus }: OrdersTableProps) => {
  return (
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
                <TableCell>${order.total_price.toFixed(2)}</TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onViewDetails(order.id)}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    {order.external_order_id && order.status === 'processing' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCheckStatus(order.external_order_id!)}
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
  );
};
