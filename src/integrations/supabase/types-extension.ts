
import { Database as OriginalDatabase } from './types';
import { UserRole } from '@/types/auth.types';
import { Deposit } from '@/types/deposits';
import { Json } from './types';
import { SupabaseClient } from '@supabase/supabase-js';

// Define the Invoice interface
export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  order_id: string;
  amount: number;
  details: {
    products: Array<{
      title: string;
      price: number;
      quantity: number;
    }>;
    recipient?: {
      name?: string;
      email?: string;
    };
  };
  status: string;
  created_at: string;
}

export interface UserWithRolesRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  avatar_url: string | null;
  roles: UserRole[];
  is_active: boolean;
  email_confirmed_at: string | null;
  confirmation_sent_at: string | null;
  confirmed_at: string | null;
}

// Create a simplified user type for get_all_users
export interface SimplifiedUser {
  id: string;
  email: string;
  roles: UserRole[];
  display_name: string | null;
}

// Extend the original Database type
export interface Database extends OriginalDatabase {
  public: {
    Tables: {
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at'>;
        Update: Partial<Omit<Invoice, 'id' | 'created_at'>>;
      };
    } & OriginalDatabase['public']['Tables'];
    Views: OriginalDatabase['public']['Views'] & {
      users_with_roles: {
        Row: UserWithRolesRow;
      };
    };
    Functions: OriginalDatabase['public']['Functions'] & {
      get_user_roles: {
        Args: { user_id_param: string };
        Returns: UserRole[];
      };
      assign_role: {
        Args: { user_id_param: string; role_param: UserRole };
        Returns: undefined;
      };
      remove_role: {
        Args: { user_id_param: string; role_param: UserRole };
        Returns: undefined;
      };
      get_user_with_roles: {
        Args: { user_id_param: string | null };
        Returns: UserWithRolesRow[];
      };
      get_all_users: {
        Args: Record<string, never>;
        Returns: SimplifiedUser[];
      };
    };
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
}

// Extend the SupabaseClient type to include get_all_users as a valid RPC function
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(
      fn: 'assign_role' | 'ban_user' | 'check_email_status' | 'check_registration_rate_limit' | 
          'get_user_avg_purchase' | 'get_user_roles' | 'get_user_with_roles' | 
          'insert_category' | 'update_user_balance' | 'get_all_users',
      params?: any
    ): Promise<{ data: T; error: null } | { data: null; error: Error }>;
  }
}
