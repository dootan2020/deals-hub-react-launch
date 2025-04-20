
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ProductKey, OrderHistoryItem } from '@/types';
import { Json } from '@/integrations/supabase/types';

const OrdersPage = () => {
  const [orderKeys, setOrderKeys] = useState<ProductKey[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      setLoading(true);
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
            product:products(title)
          `)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching orders:', error);
          return;
        }
        
        // Transform the keys JSONB array to ProductKey[]
        const allKeys = data?.flatMap(order => {
          const keys = (order.keys as any[] | null) || [];
          return keys.map(key => ({
            id: key.id,
            key_content: key.key_content,
            status: key.status,
            created_at: order.created_at,
            product_id: order.product_id
          }));
        }) || [];
        
        setOrderKeys(allKeys);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : orderKeys.length > 0 ? (
        <div className="space-y-4">
          {orderKeys.map((key) => (
            <div key={key.id} className="border p-4 rounded-lg shadow-sm">
              <p><strong>Product ID:</strong> {key.product_id}</p>
              <p><strong>Key:</strong> {key.key_content}</p>
              <p><strong>Status:</strong> {key.status}</p>
              <p><strong>Created:</strong> {new Date(key.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};

export default OrdersPage;
