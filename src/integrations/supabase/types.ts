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
      community_join_rate: {
        Row: {
          count: number
          ip_hash: string
          window_start: string
        }
        Insert: {
          count?: number
          ip_hash: string
          window_start?: string
        }
        Update: {
          count?: number
          ip_hash?: string
          window_start?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          bsp_last_error: string | null
          bsp_status: string
          consent_marketing: boolean
          created_at: string
          id: string
          interest: string
          ip_hash: string | null
          joined_group_at: string | null
          name: string
          phone_country: string | null
          phone_e164: string
          source: string
          updated_at: string
        }
        Insert: {
          bsp_last_error?: string | null
          bsp_status?: string
          consent_marketing?: boolean
          created_at?: string
          id?: string
          interest: string
          ip_hash?: string | null
          joined_group_at?: string | null
          name: string
          phone_country?: string | null
          phone_e164: string
          source?: string
          updated_at?: string
        }
        Update: {
          bsp_last_error?: string | null
          bsp_status?: string
          consent_marketing?: boolean
          created_at?: string
          id?: string
          interest?: string
          ip_hash?: string | null
          joined_group_at?: string | null
          name?: string
          phone_country?: string | null
          phone_e164?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          acquisition_source: string | null
          birth_year: number | null
          created_at: string
          first_order_at: string | null
          goals: string[]
          gp_consult_status: string | null
          last_order_at: string | null
          lifetime_value_zar: number
          marketing_optin: boolean
          notes: string | null
          order_count: number
          phone_e164: string | null
          preferred_protocol: string | null
          province: string | null
          updated_at: string
          user_id: string
          whatsapp_optin: boolean
        }
        Insert: {
          acquisition_source?: string | null
          birth_year?: number | null
          created_at?: string
          first_order_at?: string | null
          goals?: string[]
          gp_consult_status?: string | null
          last_order_at?: string | null
          lifetime_value_zar?: number
          marketing_optin?: boolean
          notes?: string | null
          order_count?: number
          phone_e164?: string | null
          preferred_protocol?: string | null
          province?: string | null
          updated_at?: string
          user_id: string
          whatsapp_optin?: boolean
        }
        Update: {
          acquisition_source?: string | null
          birth_year?: number | null
          created_at?: string
          first_order_at?: string | null
          goals?: string[]
          gp_consult_status?: string | null
          last_order_at?: string | null
          lifetime_value_zar?: number
          marketing_optin?: boolean
          notes?: string | null
          order_count?: number
          phone_e164?: string | null
          preferred_protocol?: string | null
          province?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_optin?: boolean
        }
        Relationships: []
      }
      customer_tags: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: []
      }
      email_outbox: {
        Row: {
          attempt_count: number
          created_at: string
          error: string | null
          id: string
          idempotency_key: string | null
          payload: Json
          recipient_email: string
          send_at: string
          sent_at: string | null
          status: string
          template: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string | null
          payload?: Json
          recipient_email: string
          send_at?: string
          sent_at?: string | null
          status?: string
          template: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attempt_count?: number
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string | null
          payload?: Json
          recipient_email?: string
          send_at?: string
          sent_at?: string | null
          status?: string
          template?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
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
      loyalty_credits: {
        Row: {
          created_at: string
          delta_zar: number
          id: string
          reason: string
          related_order_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta_zar: number
          id?: string
          reason: string
          related_order_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta_zar?: number
          id?: string
          reason?: string
          related_order_id?: string | null
          user_id?: string
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
          order_description: string | null
          paid_at: string | null
          payfast_pf_payment_id: string | null
          payfast_token: string | null
          payment_provider: string
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
          order_description?: string | null
          paid_at?: string | null
          payfast_pf_payment_id?: string | null
          payfast_token?: string | null
          payment_provider?: string
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
          order_description?: string | null
          paid_at?: string | null
          payfast_pf_payment_id?: string | null
          payfast_token?: string | null
          payment_provider?: string
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
      payment_attempts: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          order_id: string
          provider: string
          raw: Json
          status: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          order_id: string
          provider: string
          raw?: Json
          status: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          order_id?: string
          provider?: string
          raw?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_batches: {
        Row: {
          coa_pdf_url: string | null
          created_at: string
          endotoxin_eu_mg: number | null
          expires_at: string | null
          hplc_purity: number | null
          id: string
          is_published: boolean
          lab_name: string
          lot_number: string
          manufactured_at: string | null
          mass_spec_passed: boolean | null
          notes: string | null
          product_slug: string
          test_date: string
          updated_at: string
          variant_label: string | null
        }
        Insert: {
          coa_pdf_url?: string | null
          created_at?: string
          endotoxin_eu_mg?: number | null
          expires_at?: string | null
          hplc_purity?: number | null
          id?: string
          is_published?: boolean
          lab_name?: string
          lot_number: string
          manufactured_at?: string | null
          mass_spec_passed?: boolean | null
          notes?: string | null
          product_slug: string
          test_date: string
          updated_at?: string
          variant_label?: string | null
        }
        Update: {
          coa_pdf_url?: string | null
          created_at?: string
          endotoxin_eu_mg?: number | null
          expires_at?: string | null
          hplc_purity?: number | null
          id?: string
          is_published?: boolean
          lab_name?: string
          lot_number?: string
          manufactured_at?: string | null
          mass_spec_passed?: boolean | null
          notes?: string | null
          product_slug?: string
          test_date?: string
          updated_at?: string
          variant_label?: string | null
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          owner_user_id: string
          redemptions: number
          reward_zar: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          owner_user_id: string
          redemptions?: number
          reward_zar?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          owner_user_id?: string
          redemptions?: number
          reward_zar?: number
        }
        Relationships: []
      }
      referral_redemptions: {
        Row: {
          code_id: string
          created_at: string
          id: string
          order_id: string | null
          redeemer_user_id: string
          reward_zar: number
        }
        Insert: {
          code_id: string
          created_at?: string
          id?: string
          order_id?: string | null
          redeemer_user_id: string
          reward_zar: number
        }
        Update: {
          code_id?: string
          created_at?: string
          id?: string
          order_id?: string | null
          redeemer_user_id?: string
          reward_zar?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      reorder_reminders: {
        Row: {
          attempt_count: number
          channel: string
          created_at: string
          due_at: string
          id: string
          product_slug: string
          sent_at: string | null
          source_order_id: string | null
          template: string
          user_id: string
          variant_label: string | null
        }
        Insert: {
          attempt_count?: number
          channel?: string
          created_at?: string
          due_at: string
          id?: string
          product_slug: string
          sent_at?: string | null
          source_order_id?: string | null
          template?: string
          user_id: string
          variant_label?: string | null
        }
        Update: {
          attempt_count?: number
          channel?: string
          created_at?: string
          due_at?: string
          id?: string
          product_slug?: string
          sent_at?: string | null
          source_order_id?: string | null
          template?: string
          user_id?: string
          variant_label?: string | null
        }
        Relationships: []
      }
      retention_events: {
        Row: {
          event: string
          id: string
          meta: Json
          occurred_at: string
          user_id: string
        }
        Insert: {
          event: string
          id?: string
          meta?: Json
          occurred_at?: string
          user_id: string
        }
        Update: {
          event?: string
          id?: string
          meta?: Json
          occurred_at?: string
          user_id?: string
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
      subscribe_save_offers: {
        Row: {
          active: boolean
          created_at: string
          discount_pct: number
          id: string
          interval_weeks: number
          product_slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          discount_pct?: number
          id?: string
          interval_weeks?: number
          product_slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          discount_pct?: number
          id?: string
          interval_weeks?: number
          product_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          discount_pct: number
          id: string
          interval_weeks: number
          next_charge_at: string | null
          payfast_subscription_id: string | null
          payfast_token: string | null
          product_slug: string
          status: string
          unit_price_zar: number | null
          updated_at: string
          user_id: string
          variant_label: string | null
        }
        Insert: {
          created_at?: string
          discount_pct?: number
          id?: string
          interval_weeks?: number
          next_charge_at?: string | null
          payfast_subscription_id?: string | null
          payfast_token?: string | null
          product_slug: string
          status?: string
          unit_price_zar?: number | null
          updated_at?: string
          user_id: string
          variant_label?: string | null
        }
        Update: {
          created_at?: string
          discount_pct?: number
          id?: string
          interval_weeks?: number
          next_charge_at?: string | null
          payfast_subscription_id?: string | null
          payfast_token?: string | null
          product_slug?: string
          status?: string
          unit_price_zar?: number | null
          updated_at?: string
          user_id?: string
          variant_label?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      bump_community_rate: {
        Args: { _ip_hash: string; _limit?: number; _window_minutes?: number }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_loyalty_balance: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_referral_code: {
        Args: { _code: string }
        Returns: {
          id: string
          reward_zar: number
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
