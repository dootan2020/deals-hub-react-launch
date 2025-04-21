
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
      deposits: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          net_amount: number;
          payment_method: string;
          status: string;
          transaction_id?: string | null;
          payer_email?: string | null;
          payer_id?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          net_amount: number;
          payment_method: string;
          status?: string;
          transaction_id?: string | null;
          payer_email?: string | null;
          payer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          net_amount?: number;
          payment_method?: string;
          status?: string;
          transaction_id?: string | null;
          payer_email?: string | null;
          payer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      proxy_settings: {
        Row: {
          id: string;
          proxy_type: string;
          custom_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          proxy_type: string;
          custom_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          proxy_type?: string;
          custom_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
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
