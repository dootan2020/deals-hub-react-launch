
/**
 * Security event log entry
 */
export interface SecurityLog {
  id: string;
  created_at: string;
  event_type: 'rate_limit' | 'failed_login' | 'failed_register' | 'suspicious_activity';
  ip_address: string;
  endpoint?: string;
  identifier?: string;
  user_id?: string;
  allowed: boolean;
  remaining_attempts?: number;
  metadata?: Record<string, any>;
  request_info?: Record<string, any>;
}

/**
 * Rate limit information returned from the API
 */
export interface RateLimitInfo {
  remaining: number;
  reset: number;
  allowed: boolean;
  retryAfter?: number;
}

/**
 * Rate limit error
 */
export interface RateLimitError extends Error {
  status: 429;
  retryAfter: number;
}
