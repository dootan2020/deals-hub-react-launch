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
          name: string
          user_token: string
          kiosk_token: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          image: string
          count: number
          parent_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      deposits: {
        Row: {
          id: string
          user_id: string
          amount: number
          net_amount: number
          payment_method: string
          status: string
          transaction_id?: string
          payer_id?: string
          payer_email?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          order_id: string
          amount: number
          status: string
          details: Json
          invoice_number: string
          created_at: string
        }
      }
      notifications: {
        Row: {
          id: string
          message: string
          type: string
          read: boolean
          admin_only: boolean
          created_at: string
        }
      }
      order_activities: {
        Row: {
          id: string
          order_id: string
          user_id?: string
          action: string
          old_status?: string
          new_status?: string
          metadata?: Json
          created_at: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id?: string
          product_id?: string
          external_product_id?: string
          price: number
          quantity: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          product_id?: string
          qty: number
          total_price: number
          status: string
          external_order_id?: string
          promotion_code?: string
          keys?: Json
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          description: string
          short_description?: string
          price: number
          original_price?: number
          category_id?: string
          in_stock?: boolean
          slug: string
          images?: string[]
          badges?: string[]
          features?: string[]
          specifications?: Json
          review_count?: number
          rating?: number
          stock_quantity?: number
          external_id?: string
          api_name?: string
          kiosk_token?: string
          api_price?: number
          api_stock?: number
          last_synced_at?: string
          stock: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          balance: number
          created_at?: string
          updated_at?: string
        }
      }
      proxy_settings: {
        Row: {
          id: string
          proxy_type: string
          custom_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      registration_attempts: {
        Row: {
          id: string
          email: string
          attempt_count?: number
          first_attempt_at?: string
          last_attempt_at?: string
          locked_until?: string
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
      }
      sync_logs: {
        Row: {
          id: string
          product_id?: string
          action: string
          status: string
          message?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          status: string
          payment_method?: string
          transaction_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_details: {
        Row: {
          id: string
          display_name: string
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string // This should be compatible with UserRole type
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_status: {
        Args: {
          email_param: string
        }
        Returns: {
          email_exists: boolean
          status: string | null
          last_verification_sent: string | null
        }[]
      }
      check_registration_rate_limit: {
        Args: {
          email_param: string
        }
        Returns: {
          is_limited: boolean
          remaining_attempts: number
          unlock_time: string | null
        }[]
      }
      get_user_roles: {
        Args: {
          user_id_param: string
        }
        Returns: string[]
      }
      update_user_balance: {
        Args: {
          user_id_param: string
          amount_param: number
        }
        Returns: boolean
      }
      // Add other functions as needed
    }
    Enums: {
      [_ in never]: never
    }
  }
}
