
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ProductKey } from '@/types';

const OrdersPage = () => {
  const [orderKeys, setOrderKeys] = useState<ProductKey[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchProductKeys = async () => {
      setLoading(true);
      try {
        // Use direct SQL query instead of RPC
        const { data, error } = await supabase
          .from('product_keys')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching product keys:', error);
          return;
        }
        
        setOrderKeys(data as ProductKey[]);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductKeys();
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
