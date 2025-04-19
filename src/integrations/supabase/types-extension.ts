
import { Database as OriginalDatabase } from './types';
import { UserRole } from '@/types/auth.types';
import { Deposit } from '@/types/deposits';

export interface UserWithRolesRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  avatar_url: string | null;
  roles: UserRole[];
}

// Extend the original Database type
export interface Database extends OriginalDatabase {
  public: OriginalDatabase['public'] & {
    Tables: OriginalDatabase['public']['Tables'] & {
      deposits: {
        Row: Deposit;
        Insert: Omit<Deposit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Deposit, 'id' | 'created_at' | 'updated_at'>>;
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
    };
  };
}
