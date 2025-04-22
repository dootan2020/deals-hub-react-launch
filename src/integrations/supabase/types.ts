export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_configs: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          kiosk_token: string
          name: string
          updated_at: string | null
          user_token: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kiosk_token: string
          name: string
          updated_at?: string | null
          user_token: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kiosk_token?: string
          name?: string
          updated_at?: string | null
          user_token?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          count: number
          created_at: string | null
          description: string
          id: string
          image: string
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          count?: number
          created_at?: string | null
          description: string
          id?: string
          image: string
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          count?: number
          created_at?: string | null
          description?: string
          id?: string
          image?: string
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          net_amount: number
          payer_email: string | null
          payer_id: string | null
          payment_method: string
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          net_amount: number
          payer_email?: string | null
          payer_id?: string | null
          payment_method?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          net_amount?: number
          payer_email?: string | null
          payer_id?: string | null
          payment_method?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          details: Json
          id: string
          invoice_number: string
          order_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          details: Json
          id?: string
          invoice_number: string
          order_id: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          details?: Json
          id?: string
          invoice_number?: string
          order_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          admin_only: boolean
          created_at: string
          id: string
          message: string
          read: boolean
          type: string
        }
        Insert: {
          admin_only?: boolean
          created_at?: string
          id?: string
          message: string
          read?: boolean
          type?: string
        }
        Update: {
          admin_only?: boolean
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          type?: string
        }
        Relationships: []
      }
      order_activities: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          new_status: string | null
          old_status: string | null
          order_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          old_status?: string | null
          order_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          old_status?: string | null
          order_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_activities_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          external_product_id: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          external_product_id?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          external_product_id?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          external_order_id: string | null
          id: string
          keys: Json | null
          product_id: string | null
          promotion_code: string | null
          qty: number
          status: string
          total_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          external_order_id?: string | null
          id?: string
          keys?: Json | null
          product_id?: string | null
          promotion_code?: string | null
          qty?: number
          status: string
          total_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          external_order_id?: string | null
          id?: string
          keys?: Json | null
          product_id?: string | null
          promotion_code?: string | null
          qty?: number
          status?: string
          total_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          api_name: string | null
          api_price: number | null
          api_stock: number | null
          badges: string[] | null
          category_id: string | null
          created_at: string | null
          description: string
          external_id: string | null
          features: string[] | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          kiosk_token: string | null
          last_synced_at: string | null
          original_price: number | null
          price: number
          rating: number | null
          review_count: number | null
          short_description: string | null
          slug: string
          specifications: Json | null
          stock: number
          stock_quantity: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          api_name?: string | null
          api_price?: number | null
          api_stock?: number | null
          badges?: string[] | null
          category_id?: string | null
          created_at?: string | null
          description: string
          external_id?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          kiosk_token?: string | null
          last_synced_at?: string | null
          original_price?: number | null
          price: number
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug: string
          specifications?: Json | null
          stock?: number
          stock_quantity?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          api_name?: string | null
          api_price?: number | null
          api_stock?: number | null
          badges?: string[] | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          external_id?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          kiosk_token?: string | null
          last_synced_at?: string | null
          original_price?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug?: string
          specifications?: Json | null
          stock?: number
          stock_quantity?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_category_id"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      proxy_settings: {
        Row: {
          created_at: string | null
          custom_url: string | null
          id: string
          proxy_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_url?: string | null
          id?: string
          proxy_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_url?: string | null
          id?: string
          proxy_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      registration_attempts: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          email: string
          first_attempt_at: string | null
          id: string
          last_attempt_at: string | null
          locked_until: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          email: string
          first_attempt_at?: string | null
          id?: string
          last_attempt_at?: string | null
          locked_until?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          email?: string
          first_attempt_at?: string | null
          id?: string
          last_attempt_at?: string | null
          locked_until?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          message: string | null
          product_id: string | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          message?: string | null
          product_id?: string | null
          status: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          message?: string | null
          product_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_method: string | null
          status: string
          transaction_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_details: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      users_with_roles: {
        Row: {
          confirmation_sent_at: string | null
          confirmed_at: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          email_confirmed_at: string | null
          id: string | null
          is_active: boolean | null
          last_sign_in_at: string | null
          roles: Database["public"]["Enums"]["app_role"][] | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_role: {
        Args: {
          user_id_param: string
          role_param: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      ban_user: {
        Args: { user_id_param: string; days?: number }
        Returns: boolean
      }
      check_email_status: {
        Args: { email_param: string }
        Returns: {
          email_exists: boolean
          status: string
          last_verification_sent: string
        }[]
      }
      check_registration_rate_limit: {
        Args: { email_param: string }
        Returns: {
          is_limited: boolean
          remaining_attempts: number
          unlock_time: string
        }[]
      }
      get_user_roles: {
        Args: { user_id_param: string }
        Returns: Database["public"]["Enums"]["app_role"][]
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
      is_user_active: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      remove_role: {
        Args: {
          user_id_param: string
          role_param: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      unban_user: {
        Args: { user_id_param: string }
        Returns: boolean
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
      update_user_balance: {
        Args: { user_id_param: string; amount_param: number }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
