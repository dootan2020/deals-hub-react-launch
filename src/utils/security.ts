
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  type: 'login' | 'purchase';
  user_id?: string;
  email?: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  metadata?: Record<string, any>;
}

export async function logSecurityEvent(event: SecurityEvent) {
  try {
    const { data, error } = await supabase.functions.invoke('security-events', {
      body: { event }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw the error as this is a non-critical operation
    return null;
  }
}
