export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliate_applications: {
        Row: {
          audience_size: string | null
          channel: string
          created_at: string
          email: string
          id: string
          link: string | null
          message: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          audience_size?: string | null
          channel: string
          created_at?: string
          email: string
          id?: string
          link?: string | null
          message?: string | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          audience_size?: string | null
          channel?: string
          created_at?: string
          email?: string
          id?: string
          link?: string | null
          message?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_snapshots: {
        Row: {
          cart_signature: string | null
          created_at: string
          discount_pct: number
          id: string
          items: Json
          notified_at: string | null
          subtotal: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cart_signature?: string | null
          created_at?: string
          discount_pct?: number
          id?: string
          items?: Json
          notified_at?: string | null
          subtotal?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cart_signature?: string | null
          created_at?: string
          discount_pct?: number
          id?: string
          items?: Json
          notified_at?: string | null
          subtotal?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          action: string
          created_at: string
          error: string | null
          id: string
          integration: string
          payload: Json | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          error?: string | null
          id?: string
          integration: string
          payload?: Json | null
          status: string
        }
        Update: {
          action?: string
          created_at?: string
          error?: string | null
          id?: string
          integration?: string
          payload?: Json | null
          status?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          discount_code: string | null
          free_shipping_applied: boolean
          id: string
          nowpayments_payment_id: string | null
          order_description: string | null
          paid_at: string | null
          shipping_cost: number
          shipping_country: string | null
          shipping_currency: string | null
          shipping_method: string | null
          status: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          discount_code?: string | null
          free_shipping_applied?: boolean
          id?: string
          nowpayments_payment_id?: string | null
          order_description?: string | null
          paid_at?: string | null
          shipping_cost?: number
          shipping_country?: string | null
          shipping_currency?: string | null
          shipping_method?: string | null
          status?: string
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          discount_code?: string | null
          free_shipping_applied?: boolean
          id?: string
          nowpayments_payment_id?: string | null
          order_description?: string | null
          paid_at?: string | null
          shipping_cost?: number
          shipping_country?: string | null
          shipping_currency?: string | null
          shipping_method?: string | null
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      product_faqs: {
        Row: {
          answer: string
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          product_slug: string | null
          question: string
          scope: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          product_slug?: string | null
          question: string
          scope?: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          product_slug?: string | null
          question?: string
          scope?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_reindex_log: {
        Row: {
          created_at: string
          cycle_started_at: string
          id: string
          last_requested_at: string | null
          notes: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          cycle_started_at?: string
          id?: string
          last_requested_at?: string | null
          notes?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          cycle_started_at?: string
          id?: string
          last_requested_at?: string | null
          notes?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          location: string | null
          name: string
          photo_url: string | null
          quote: string
          rating: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          location?: string | null
          name: string
          photo_url?: string | null
          quote: string
          rating?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          location?: string | null
          name?: string
          photo_url?: string | null
          quote?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
