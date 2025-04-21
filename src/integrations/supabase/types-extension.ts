
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

// Note: We don't need to extend the Database type here anymore since it's all defined in database.types.ts
