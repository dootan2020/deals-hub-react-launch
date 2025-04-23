
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

export interface UserWithRolesData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  display_name: string | null;
  roles: string[];
  is_active: boolean;
}

export async function getUserWithRoles(userId?: string): Promise<UserWithRolesData | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_with_roles', { 
      user_id_param: userId
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get user with roles:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<UserWithRolesData[] | null> {
  try {
    // Use the new function created in the SQL migration
    const { data, error } = await supabase.rpc('get_all_users');
    
    if (error) throw error;
    return data as UserWithRolesData[];
  } catch (error) {
    console.error('Failed to get all users:', error);
    return null;
  }
}
