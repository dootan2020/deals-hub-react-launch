
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

// Use the UserWithRolesRow interface from types-extension.ts to ensure consistency
export type UserWithRolesData = UserWithRolesRow;

export async function getUserWithRoles(userId?: string): Promise<UserWithRolesData | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_with_roles', { 
      user_id_param: userId
    });
    
    if (error) throw error;
    return data as UserWithRolesData;
  } catch (error) {
    console.error('Failed to get user with roles:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<SimplifiedUser[] | null> {
  try {
    // Use the get_all_users function we defined in the Database interface
    const { data, error } = await supabase.rpc('get_all_users');
    
    if (error) throw error;
    return data as SimplifiedUser[];
  } catch (error) {
    console.error('Failed to get all users:', error);
    return null;
  }
}
