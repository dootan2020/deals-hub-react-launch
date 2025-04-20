
import { Database as OriginalDatabase } from './types';
import { UserRole } from '@/types/auth.types';
import { Deposit } from '@/types/deposits';
import { ProductKey } from '@/types';

// Extend the original Database type
export interface Database extends OriginalDatabase {
  public: OriginalDatabase['public'] & {
    Tables: OriginalDatabase['public']['Tables'] & {
      deposits: {
        Row: Deposit;
        Insert: Omit<Deposit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Deposit, 'id' | 'created_at' | 'updated_at'>>;
      },
      product_keys: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          key_content: string;
          status: string;
          created_at: string;
          updated_at: string;
          used_at: string | null;
        };
        Insert: Omit<{
          id: string;
          order_id: string;
          product_id: string;
          key_content: string;
          status: string;
          created_at: string;
          updated_at: string;
          used_at: string | null;
        }, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<{
          id: string;
          order_id: string;
          product_id: string;
          key_content: string;
          status: string;
          created_at: string;
          updated_at: string;
          used_at: string | null;
        }, 'id' | 'created_at' | 'updated_at'>>;
      }
    };
    Views: {
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
      get_product_keys_by_order: {
        Args: { order_id_param: string };
        Returns: ProductKey[];
      };
      create_order_and_deduct_balance: {
        Args: { 
          p_user_id: string;
          p_product_id: string;
          p_quantity: number;
          p_price_per_unit: number;
          p_promotion_code?: string | null;
          p_kiosk_token?: string | null;
        };
        Returns: string;
      };
    };
  };
}

export interface UserWithRolesRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  avatar_url: string | null;
  roles: UserRole[];
}
