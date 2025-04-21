
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:user_id (email),
          product:product_id (title, images)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      return data;
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, isLoading, error, fetchOrders };
}
