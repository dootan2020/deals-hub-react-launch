
import { UserRole } from '@/types/auth.types';

export interface UserWithRolesRow {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  roles?: UserRole[];
  is_active?: boolean;
  confirmed_at?: string;
}

export interface UserStatsData {
  total_users: number;
  new_users_week: number;
  new_users_month: number;
  inactive_users: number;
}
