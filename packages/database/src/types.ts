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
      alert_channels: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          type: Database["public"]["Enums"]["alert_channel_type"]
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          type: Database["public"]["Enums"]["alert_channel_type"]
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          type?: Database["public"]["Enums"]["alert_channel_type"]
        }
        Relationships: [
          {
            foreignKeyName: "alert_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          channel_id: string
          conditions: Json
          created_at: string
          escalation: boolean
          id: string
          monitor_id: string
          organization_id: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
        }
        Insert: {
          channel_id: string
          conditions?: Json
          created_at?: string
          escalation?: boolean
          id?: string
          monitor_id: string
          organization_id: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
        }
        Update: {
          channel_id?: string
          conditions?: Json
          created_at?: string
          escalation?: boolean
          id?: string
          monitor_id?: string
          organization_id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "alert_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rules_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      check_results: {
        Row: {
          checked_at: string
          error_message: string | null
          heartbeat_metrics: Json | null
          id: string
          is_up: boolean
          monitor_id: string
          region: string
          response_ms: number | null
          status_code: number | null
        }
        Insert: {
          checked_at?: string
          error_message?: string | null
          heartbeat_metrics?: Json | null
          id?: string
          is_up: boolean
          monitor_id: string
          region?: string
          response_ms?: number | null
          status_code?: number | null
        }
        Update: {
          checked_at?: string
          error_message?: string | null
          heartbeat_metrics?: Json | null
          id?: string
          is_up?: boolean
          monitor_id?: string
          region?: string
          response_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "check_results_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          monitor_id: string
          notes: string | null
          resolved_at: string | null
          root_cause: string | null
          started_at: string
          status: Database["public"]["Enums"]["incident_status"]
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          monitor_id: string
          notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["incident_status"]
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          monitor_id?: string
          notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["incident_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          id: string
          invited_by: string | null
          is_owner: boolean
          joined_at: string
          organization_id: string
          permissions_override: Json
          role: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          is_owner?: boolean
          joined_at?: string
          organization_id: string
          permissions_override?: Json
          role?: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          is_owner?: boolean
          joined_at?: string
          organization_id?: string
          permissions_override?: Json
          role?: Database["public"]["Enums"]["organization_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monitors: {
        Row: {
          config: Json
          created_at: string
          created_by: string
          enabled: boolean
          id: string
          interval_sec: number
          last_check: string | null
          name: string
          organization_id: string
          status: Database["public"]["Enums"]["monitor_status"]
          target: string
          timeout_sec: number
          type: Database["public"]["Enums"]["monitor_type"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by: string
          enabled?: boolean
          id?: string
          interval_sec?: number
          last_check?: string | null
          name: string
          organization_id: string
          status?: Database["public"]["Enums"]["monitor_status"]
          target: string
          timeout_sec?: number
          type: Database["public"]["Enums"]["monitor_type"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string
          enabled?: boolean
          id?: string
          interval_sec?: number
          last_check?: string | null
          name?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["monitor_status"]
          target?: string
          timeout_sec?: number
          type?: Database["public"]["Enums"]["monitor_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_limits: {
        Row: {
          id: string
          max_alert_channels: number
          max_monitors: number
          max_users: number
          min_check_interval_sec: number
          organization_id: string
          storage_limit_mb: number
        }
        Insert: {
          id?: string
          max_alert_channels?: number
          max_monitors?: number
          max_users?: number
          min_check_interval_sec?: number
          organization_id: string
          storage_limit_mb?: number
        }
        Update: {
          id?: string
          max_alert_channels?: number
          max_monitors?: number
          max_users?: number
          min_check_interval_sec?: number
          organization_id?: string
          storage_limit_mb?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_limits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          allow_public_dashboards: boolean
          billing_type: Database["public"]["Enums"]["usage_enforcement_type"]
          id: string
          notify_on_downtime: boolean
          organization_id: string
          require_2fa: boolean
        }
        Insert: {
          allow_public_dashboards?: boolean
          billing_type?: Database["public"]["Enums"]["usage_enforcement_type"]
          id?: string
          notify_on_downtime?: boolean
          organization_id: string
          require_2fa?: boolean
        }
        Update: {
          allow_public_dashboards?: boolean
          billing_type?: Database["public"]["Enums"]["usage_enforcement_type"]
          id?: string
          notify_on_downtime?: boolean
          organization_id?: string
          require_2fa?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          auto_renew: boolean
          created_at: string
          customer_id: string | null
          icon: string | null
          id: string
          is_personal: boolean
          name: string
          owner_id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          plan_expires_at: string | null
          slug: string
          status: Database["public"]["Enums"]["organization_status"]
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          customer_id?: string | null
          icon?: string | null
          id?: string
          is_personal?: boolean
          name: string
          owner_id: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_expires_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["organization_status"]
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          customer_id?: string | null
          icon?: string | null
          id?: string
          is_personal?: boolean
          name?: string
          owner_id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_expires_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["organization_status"]
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_type: Database["public"]["Enums"]["user_avatar_type"]
          avatar_url: string | null
          banned_at: string | null
          created_at: string
          deleted_at: string | null
          deletion_requested_at: string | null
          deletion_scheduled_at: string | null
          email: string
          email_verified: boolean
          first_name: string
          full_name: string | null
          global_role: Database["public"]["Enums"]["user_global_role"]
          gravatar_email: string | null
          id: string
          is_banned: boolean
          last_login_at: string | null
          last_name: string
          mfa_enabled: boolean
          status: Database["public"]["Enums"]["user_status"]
          timezone: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_type?: Database["public"]["Enums"]["user_avatar_type"]
          avatar_url?: string | null
          banned_at?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_requested_at?: string | null
          deletion_scheduled_at?: string | null
          email: string
          email_verified?: boolean
          first_name?: string
          full_name?: string | null
          global_role?: Database["public"]["Enums"]["user_global_role"]
          gravatar_email?: string | null
          id: string
          is_banned?: boolean
          last_login_at?: string | null
          last_name?: string
          mfa_enabled?: boolean
          status?: Database["public"]["Enums"]["user_status"]
          timezone?: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_type?: Database["public"]["Enums"]["user_avatar_type"]
          avatar_url?: string | null
          banned_at?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_requested_at?: string | null
          deletion_scheduled_at?: string | null
          email?: string
          email_verified?: boolean
          first_name?: string
          full_name?: string | null
          global_role?: Database["public"]["Enums"]["user_global_role"]
          gravatar_email?: string | null
          id?: string
          is_banned?: boolean
          last_login_at?: string | null
          last_name?: string
          mfa_enabled?: boolean
          status?: Database["public"]["Enums"]["user_status"]
          timezone?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_email_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_email_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mfa: {
        Row: {
          backup_codes: Json
          created_at: string
          enabled: boolean
          id: string
          secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mfa_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_oauth_accounts: {
        Row: {
          created_at: string
          id: string
          provider: Database["public"]["Enums"]["user_oauth_provider"]
          provider_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider: Database["public"]["Enums"]["user_oauth_provider"]
          provider_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider?: Database["public"]["Enums"]["user_oauth_provider"]
          provider_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_oauth_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_password_resets: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_password_resets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_username: {
        Args: { base_username: string; user_id: string }
        Returns: string
      }
      has_org_permission: {
        Args: { org_id: string; perm: string }
        Returns: boolean
      }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      role_permissions: {
        Args: { r: Database["public"]["Enums"]["organization_role"] }
        Returns: string[]
      }
    }
    Enums: {
      alert_channel_type: "email" | "sms" | "webhook" | "phone_call"
      incident_status: "open" | "acknowledged" | "resolved"
      monitor_status: "up" | "down" | "maintenance" | "unknown"
      monitor_type:
        | "http"
        | "websocket"
        | "heartbeat"
        | "tcp"
        | "ping"
        | "database"
        | "email"
      organization_role: "owner" | "admin" | "member" | "viewer"
      organization_status:
        | "active"
        | "suspended"
        | "trial_expired"
        | "pending_setup"
      subscription_plan: "free" | "pro" | "enterprise"
      usage_enforcement_type: "hard_limit" | "soft_limit"
      user_avatar_type: "gravatar" | "upload" | "none"
      user_global_role: "user" | "moderator" | "support" | "admin"
      user_oauth_provider: "google" | "github"
      user_status: "online" | "offline" | "away" | "do_not_disturb"
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
      alert_channel_type: ["email", "sms", "webhook", "phone_call"],
      incident_status: ["open", "acknowledged", "resolved"],
      monitor_status: ["up", "down", "maintenance", "unknown"],
      monitor_type: [
        "http",
        "websocket",
        "heartbeat",
        "tcp",
        "ping",
        "database",
        "email",
      ],
      organization_role: ["owner", "admin", "member", "viewer"],
      organization_status: [
        "active",
        "suspended",
        "trial_expired",
        "pending_setup",
      ],
      subscription_plan: ["free", "pro", "enterprise"],
      usage_enforcement_type: ["hard_limit", "soft_limit"],
      user_avatar_type: ["gravatar", "upload", "none"],
      user_global_role: ["user", "moderator", "support", "admin"],
      user_oauth_provider: ["google", "github"],
      user_status: ["online", "offline", "away", "do_not_disturb"],
    },
  },
} as const
