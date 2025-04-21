
/**
 * Shared types for fraud detection
 */
export interface LoginAttempt {
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  success: boolean;
  user_id?: string;
  email?: string;
}

export interface PurchaseActivity {
  user_id: string;
  amount: number;
  product_id: string;
  timestamp: Date;
  ip_address: string;
  device_info: string;
}
