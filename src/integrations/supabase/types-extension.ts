
// File này bổ sung thêm các type cho Supabase mà không có trong file types.ts được tạo tự động
import { Database } from './types';
import { UserRole } from '@/types/auth.types';

// Bổ sung types cho các view
export interface UserWithRolesRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  avatar_url: string | null;
  roles: UserRole[];
}

// Mở rộng Database type
declare module './types' {
  interface Database {
    public: {
      Tables: Database['public']['Tables'];
      Views: {
        users_with_roles: {
          Row: UserWithRolesRow;
        };
      };
      Functions: {
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
        insert_category: Database['public']['Functions']['insert_category'];
        update_category: Database['public']['Functions']['update_category'];
      };
    };
  }
}
