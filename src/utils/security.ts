
import { supabase } from '@/integrations/supabase/client';
import { UserWithRolesRow, SimplifiedUser } from '@/integrations/supabase/types-extension';

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
      body: { event },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Failed to log security event:', error);
    return null;
  }
}

export async function getUserWithRoles(userId?: string): Promise<UserWithRolesRow | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_with_roles', {
      user_id_param: userId,
    });

    if (error) throw error;
    return Array.isArray(data) && data.length > 0 ? data[0] as UserWithRolesRow : null;
  } catch (error) {
    console.error('❌ Failed to get user with roles:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<SimplifiedUser[] | null> {
  try {
    const { data, error } = await supabase.rpc('get_all_users');

    if (error) throw error;
    return Array.isArray(data) ? data as SimplifiedUser[] : null;
  } catch (error) {
    console.error('❌ Failed to get all users:', error);
    return null;
  }
}
