
import { Database as OriginalDatabase } from './types';
import { UserRole } from '@/types/auth.types';
import { Deposit, PendingDepositsStatus } from '@/types/deposits';
import { Json } from '@/types/database.types';

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
}

// Define the TransactionLog interface
export interface TransactionLog {
  id: string;
  transaction_id: string | null;
  deposit_id: string | null;
  status: string;
  error_message: string | null;
  request_payload: Json | null;
  response_payload: Json | null;
  processing_time: string | null;
  idempotency_key: string | null;
  created_at: string;
}

// Add transaction_logs to the types to make the type checker happy
// This will be merged with the original Database type
export interface Database extends OriginalDatabase {
  public: {
    Tables: {
      transaction_logs: {
        Row: TransactionLog;
        Insert: Omit<TransactionLog, 'id' | 'created_at'>;
        Update: Partial<Omit<TransactionLog, 'id' | 'created_at'>>;
      };
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
      get_pending_deposits_status: {
        Args: Record<string, never>;
        Returns: PendingDepositsStatus;
      };
    };
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
}
