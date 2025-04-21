
import { supabase } from '@/integrations/supabase/client';

export const checkIdempotency = async (
  table: 'deposits' | 'orders' | 'transactions',
  idempotencyKey: string
): Promise<{ exists: boolean; data?: any }> => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (error) {
      console.error(`Error checking idempotency in table ${table}:`, error);
      return { exists: false };
    }

    return {
      exists: !!data,
      data: data || undefined
    };
  } catch (error) {
    console.error(`Exception checking idempotency in table ${table}:`, error);
    return { exists: false };
  }
};
