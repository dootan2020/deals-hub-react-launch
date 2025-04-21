
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
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          slug: string;
          image: string;
          count: number;
          parent_id?: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          slug: string;
          image: string;
          count?: number;
          parent_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          slug?: string;
          image?: string;
          count?: number;
          parent_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          original_price?: number | null;
          in_stock: boolean;
          slug: string;
          external_id?: string | null;
          category_id?: string | null;
          images?: string[] | null;
          kiosk_token?: string | null;
          stock: number;
          api_price?: number | null;
          api_stock?: number | null;
          api_name?: string | null;
          short_description?: string | null;
          stock_quantity?: number | null;
          rating?: number | null;
          review_count?: number | null;
          badges?: string[] | null;
          features?: string[] | null;
          specifications?: Json | null;
          created_at: string | null;
          updated_at: string | null;
          last_synced_at?: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          original_price?: number | null;
          in_stock?: boolean;
          slug: string;
          external_id?: string | null;
          category_id?: string | null;
          images?: string[] | null;
          kiosk_token?: string | null;
          stock?: number;
          api_price?: number | null;
          api_stock?: number | null;
          api_name?: string | null;
          short_description?: string | null;
          stock_quantity?: number | null;
          rating?: number | null;
          review_count?: number | null;
          badges?: string[] | null;
          features?: string[] | null;
          specifications?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_synced_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          original_price?: number | null;
          in_stock?: boolean;
          slug?: string;
          external_id?: string | null;
          category_id?: string | null;
          images?: string[] | null;
          kiosk_token?: string | null;
          stock?: number;
          api_price?: number | null;
          api_stock?: number | null;
          api_name?: string | null;
          short_description?: string | null;
          stock_quantity?: number | null;
          rating?: number | null;
          review_count?: number | null;
          badges?: string[] | null;
          features?: string[] | null;
          specifications?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_synced_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          balance: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          balance?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          balance?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      api_configs: {
        Row: {
          id: string;
          name: string;
          user_token: string;
          kiosk_token: string;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          user_token: string;
          kiosk_token: string;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          user_token?: string;
          kiosk_token?: string;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_roles: {
        Args: { user_id_param: string };
        Returns: string[];
      };
      assign_role: {
        Args: { user_id_param: string; role_param: string };
        Returns: undefined;
      };
      remove_role: {
        Args: { user_id_param: string; role_param: string };
        Returns: undefined;
      };
      check_email_status: {
        Args: { email_param: string };
        Returns: {
          email_exists: boolean;
          status: string | null;
          last_verification_sent: string | null;
        }[];
      };
      check_registration_rate_limit: {
        Args: { email_param: string };
        Returns: {
          is_limited: boolean;
          remaining_attempts: number | null;
          unlock_time: string | null;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
