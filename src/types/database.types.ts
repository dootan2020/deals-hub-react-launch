export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      transaction_logs: {
        Row: {
          id: string;
          transaction_id?: string | null;
          deposit_id?: string | null;
          status: string;
          error_message?: string | null;
          request_payload: Json | null;
          response_payload: Json | null;
          processing_time?: string | null;
          idempotency_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id?: string | null;
          deposit_id?: string | null;
          status: string;
          error_message?: string | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          processing_time?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string | null;
          deposit_id?: string | null;
          status?: string;
          error_message?: string | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          processing_time?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      // Other tables would be defined here, but we'll omit them for brevity
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
