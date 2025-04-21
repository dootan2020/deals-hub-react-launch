
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      api_configs: {
        Row: {
          id: string
          created_at: string | null
          is_active: boolean | null
          updated_at: string | null
          kiosk_token: string
          user_token: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          kiosk_token: string
          user_token: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          kiosk_token?: string
          user_token?: string
          name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          slug: string
          image: string
          count: number
          parent_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          slug: string
          image: string
          count?: number
          parent_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          slug?: string
          image?: string
          count?: number
          parent_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deposits: {
        Row: {
          id: string
          amount: number
          payer_email: string | null
          status: string
          payment_method: string
          transaction_id: string | null
          payer_id: string | null
          user_id: string
          net_amount: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          amount: number
          payer_email?: string | null
          status?: string
          payment_method?: string
          transaction_id?: string | null
          payer_id?: string | null
          user_id: string
          net_amount: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          amount?: number
          payer_email?: string | null
          status?: string
          payment_method?: string
          transaction_id?: string | null
          payer_id?: string | null
          user_id?: string
          net_amount?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          created_at: string
          amount: number
          order_id: string
          user_id: string
          status: string
          details: Json
          invoice_number: string
        }
        Insert: {
          id?: string
          created_at?: string
          amount: number
          order_id: string
          user_id: string
          status?: string
          details: Json
          invoice_number: string
        }
        Update: {
          id?: string
          created_at?: string
          amount?: number
          order_id?: string
          user_id?: string
          status?: string
          details?: Json
          invoice_number?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          admin_only: boolean
          read: boolean
          created_at: string
          type: string
          message: string
        }
        Insert: {
          id?: string
          admin_only?: boolean
          read?: boolean
          created_at?: string
          type?: string
          message: string
        }
        Update: {
          id?: string
          admin_only?: boolean
          read?: boolean
          created_at?: string
          type?: string
          message?: string
        }
        Relationships: []
      }
      order_activities: {
        Row: {
          id: string
          created_at: string
          order_id: string
          user_id: string | null
          metadata: Json | null
          old_status: string | null
          new_status: string | null
          action: string
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          user_id?: string | null
          metadata?: Json | null
          old_status?: string | null
          new_status?: string | null
          action: string
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          user_id?: string | null
          metadata?: Json | null
          old_status?: string | null
          new_status?: string | null
          action?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          quantity: number
          price: number
          created_at: string | null
          product_id: string | null
          external_product_id: string | null
          order_id: string | null
        }
        Insert: {
          id?: string
          quantity: number
          price: number
          created_at?: string | null
          product_id?: string | null
          external_product_id?: string | null
          order_id?: string | null
        }
        Update: {
          id?: string
          quantity?: number
          price?: number
          created_at?: string | null
          product_id?: string | null
          external_product_id?: string | null
          order_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          total_price: number
          created_at: string | null
          updated_at: string | null
          user_id: string
          product_id: string | null
          qty: number
          keys: Json | null
          promotion_code: string | null
          external_order_id: string | null
          status: string
        }
        Insert: {
          id?: string
          total_price: number
          created_at?: string | null
          updated_at?: string | null
          user_id: string
          product_id?: string | null
          qty?: number
          keys?: Json | null
          promotion_code?: string | null
          external_order_id?: string | null
          status: string
        }
        Update: {
          id?: string
          total_price?: number
          created_at?: string | null
          updated_at?: string | null
          user_id?: string
          product_id?: string | null
          qty?: number
          keys?: Json | null
          promotion_code?: string | null
          external_order_id?: string | null
          status?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          original_price: number | null
          in_stock: boolean
          slug: string
          external_id: string | null
          category_id: string
          images: string[] | null
          kiosk_token: string | null
          stock: number
          api_price: number | null
          api_stock: number | null
          api_name: string | null
          short_description: string | null
          stock_quantity: number | null
          rating: number | null
          review_count: number | null
          badges: string[] | null
          features: string[] | null
          specifications: Json | null
          created_at: string | null
          updated_at: string | null
          last_synced_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          original_price?: number | null
          in_stock?: boolean
          slug: string
          external_id?: string | null
          category_id: string
          images?: string[] | null
          kiosk_token?: string | null
          stock?: number
          api_price?: number | null
          api_stock?: number | null
          api_name?: string | null
          short_description?: string | null
          stock_quantity?: number | null
          rating?: number | null
          review_count?: number | null
          badges?: string[] | null
          features?: string[] | null
          specifications?: Json | null
          created_at?: string | null
          updated_at?: string | null
          last_synced_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          original_price?: number | null
          in_stock?: boolean
          slug?: string
          external_id?: string | null
          category_id?: string
          images?: string[] | null
          kiosk_token?: string | null
          stock?: number
          api_price?: number | null
          api_stock?: number | null
          api_name?: string | null
          short_description?: string | null
          stock_quantity?: number | null
          rating?: number | null
          review_count?: number | null
          badges?: string[] | null
          features?: string[] | null
          specifications?: Json | null
          created_at?: string | null
          updated_at?: string | null
          last_synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          balance: number
        }
        Insert: {
          id: string
          created_at?: string | null
          updated_at?: string | null
          balance?: number
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      proxy_settings: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          custom_url: string | null
          proxy_type: string
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          custom_url?: string | null
          proxy_type?: string
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          custom_url?: string | null
          proxy_type?: string
        }
        Relationships: []
      }
      registration_attempts: {
        Row: {
          id: string
          email: string
          created_at: string | null
          locked_until: string | null
          first_attempt_at: string | null
          last_attempt_at: string | null
          attempt_count: number | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string | null
          locked_until?: string | null
          first_attempt_at?: string | null
          last_attempt_at?: string | null
          attempt_count?: number | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string | null
          locked_until?: string | null
          first_attempt_at?: string | null
          last_attempt_at?: string | null
          attempt_count?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          value: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          key: string
          value: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          key?: string
          value?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          id: string
          created_at: string | null
          message: string | null
          status: string
          action: string
          product_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          message?: string | null
          status: string
          action: string
          product_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          message?: string | null
          status?: string
          action?: string
          product_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          type: string
          updated_at: string | null
          payment_method: string | null
          transaction_id: string | null
          created_at: string | null
          status: string
          amount: number
          user_id: string
        }
        Insert: {
          id?: string
          type?: string
          updated_at?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          created_at?: string | null
          status?: string
          amount: number
          user_id: string
        }
        Update: {
          id?: string
          type?: string
          updated_at?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          created_at?: string | null
          status?: string
          amount?: number
          user_id?: string
        }
        Relationships: []
      }
      user_details: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          display_name: string
        }
        Insert: {
          id: string
          created_at?: string | null
          updated_at?: string | null
          display_name: string
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          display_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          role: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {
      assign_role: {
        Args: {
          user_id_param: string
          role_param: string
        }
        Returns: undefined
      }
      check_email_status: {
        Args: {
          email_param: string
        }
        Returns: {
          email_exists: boolean
          status: string
          last_verification_sent: string
        }[]
      }
      check_registration_rate_limit: {
        Args: {
          email_param: string
        }
        Returns: {
          is_limited: boolean
          remaining_attempts: number
          unlock_time: string
        }[]
      }
      get_user_roles: {
        Args: {
          user_id_param: string
        }
        Returns: string[]
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      insert_category: {
        Args: {
          name_param: string
          description_param: string
          slug_param: string
          image_param: string
          parent_id_param: string
        }
        Returns: undefined
      }
      remove_role: {
        Args: {
          user_id_param: string
          role_param: string
        }
        Returns: undefined
      }
      update_category: {
        Args: {
          id_param: string
          name_param: string
          description_param: string
          slug_param: string
          image_param: string
          parent_id_param: string
        }
        Returns: undefined
      }
      update_deposits_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_profiles_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_site_settings_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_transactions_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_user_balance: {
        Args: {
          user_id_param: string
          amount_param: number
        }
        Returns: boolean
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
