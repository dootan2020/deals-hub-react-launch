
import { useState } from 'react';
import { formatDate } from '@/lib/utils';

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
    total_price: number;
    promotion_code?: string | null;
    updated_at: string;
  };
}

interface OrderDetailsPanelProps {
  selectedOrder: OrderDetails | null;
  isDetailsLoading: boolean;
}

export const OrderDetailsPanel = ({ selectedOrder, isDetailsLoading }: OrderDetailsPanelProps) => {
  if (isDetailsLoading) {
    return (
      <div className="p-4 text-center border rounded-md">
        Loading order details...
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="p-4 text-center border rounded-md">
        Select an order to view details
      </div>
    );
  }

  return (
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
            <p className="font-medium">${selectedOrder.details.total_price.toFixed(2)}</p>
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
  );
};
