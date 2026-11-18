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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      city_geocodes: {
        Row: {
          latitude: number
          location_key: string
          longitude: number
        }
        Insert: {
          latitude: number
          location_key: string
          longitude: number
        }
        Update: {
          latitude?: number
          location_key?: string
          longitude?: number
        }
        Relationships: []
      }
      conversation_reads: {
        Row: {
          conversation_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_reads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_reports: {
        Row: {
          conversation_id: string
          created_at: string
          details: string
          id: string
          message_id: string | null
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          details?: string
          id?: string
          message_id?: string | null
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          details?: string
          id?: string
          message_id?: string | null
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_reports_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          declined_at: string | null
          id: string
          initiator_id: string
          recipient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          declined_at?: string | null
          id?: string
          initiator_id: string
          recipient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          declined_at?: string | null
          id?: string
          initiator_id?: string
          recipient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          aliases: string[]
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          aliases?: string[]
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          aliases?: string[]
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      family_histories: {
        Row: {
          body: string
          created_at: string
          family_id: string
          id: string
          published: boolean
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          family_id: string
          id?: string
          published?: boolean
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          family_id?: string
          id?: string
          published?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_histories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_history_sources: {
        Row: {
          history_id: string
          id: string
          pages: string | null
          source_id: string
        }
        Insert: {
          history_id: string
          id?: string
          pages?: string | null
          source_id: string
        }
        Update: {
          history_id?: string
          id?: string
          pages?: string | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_history_sources_history_id_fkey"
            columns: ["history_id"]
            isOneToOne: false
            referencedRelation: "family_histories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_history_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "history_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      history_sources: {
        Row: {
          author_or_organization: string | null
          created_at: string
          id: string
          publication_year: number | null
          published: boolean
          title: string
          url: string | null
        }
        Insert: {
          author_or_organization?: string | null
          created_at?: string
          id?: string
          publication_year?: number | null
          published?: boolean
          title: string
          url?: string | null
        }
        Update: {
          author_or_organization?: string | null
          created_at?: string
          id?: string
          publication_year?: number | null
          published?: boolean
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      map_points: {
        Row: {
          city: string | null
          consent_to_publish: boolean
          country: string
          created_at: string
          family_id: string
          guest_delete_token: string
          id: string
          latitude: number | null
          longitude: number | null
          moderation_note: string | null
          processing_consent_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          consent_to_publish?: boolean
          country: string
          created_at?: string
          family_id: string
          guest_delete_token?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          moderation_note?: string | null
          processing_consent_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          consent_to_publish?: boolean
          country?: string
          created_at?: string
          family_id?: string
          guest_delete_token?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          moderation_note?: string | null
          processing_consent_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "map_points_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_send_events: {
        Row: {
          id: number
          kind: string
          sent_at: string
          user_id: string
        }
        Insert: {
          id?: never
          kind: string
          sent_at?: string
          user_id: string
        }
        Update: {
          id?: never
          kind?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_send_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_activity: {
        Row: {
          last_seen_at: string
          user_id: string
        }
        Insert: {
          last_seen_at?: string
          user_id: string
        }
        Update: {
          last_seen_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_marks: {
        Row: {
          city: string | null
          consent_to_publish: boolean
          country: string
          created_at: string
          family_id: string
          id: string
          latitude: number | null
          longitude: number | null
          moderation_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          consent_to_publish?: boolean
          country: string
          created_at?: string
          family_id: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          moderation_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          consent_to_publish?: boolean
          country?: string
          created_at?: string
          family_id?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          moderation_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_marks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      point_submission_limits: {
        Row: {
          bucket: string
          last_submission: string
        }
        Insert: {
          bucket: string
          last_submission: string
        }
        Update: {
          bucket?: string
          last_submission?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string
          allow_messages: boolean
          avatar_path: string | null
          city: string
          country: string
          created_at: string
          display_name: string
          email_notifications: boolean
          family_name: string
          id: string
          processing_consent_at: string | null
          show_on_map: boolean
        }
        Insert: {
          about?: string
          allow_messages?: boolean
          avatar_path?: string | null
          city?: string
          country?: string
          created_at?: string
          display_name?: string
          email_notifications?: boolean
          family_name?: string
          id: string
          processing_consent_at?: string | null
          show_on_map?: boolean
        }
        Update: {
          about?: string
          allow_messages?: boolean
          avatar_path?: string | null
          city?: string
          country?: string
          created_at?: string
          display_name?: string
          email_notifications?: boolean
          family_name?: string
          id?: string
          processing_consent_at?: string | null
          show_on_map?: boolean
        }
        Relationships: []
      }
      registration_consents: {
        Row: {
          accepted_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_bans: {
        Row: {
          admin_id: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      blocked_participants: {
        Args: never
        Returns: {
          display_name: string
          family_name: string
          user_id: string
        }[]
      }
      can_contact_participant: { Args: { _target: string }; Returns: boolean }
      can_read_conversation: { Args: { _id: string }; Returns: boolean }
      claim_point_slot: { Args: { _bucket: string }; Returns: boolean }
      decide_conversation: {
        Args: { _conversation: string; _decision: string }
        Returns: undefined
      }
      enforce_messaging_frequency: {
        Args: { _kind: string; _user: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_auto_admin_email: {
        Args: { _confirmed: boolean; _email: string }
        Returns: boolean
      }
      mark_conversation_read: {
        Args: { _conversation: string }
        Returns: undefined
      }
      message_contacts: {
        Args: { _points: string[] }
        Returns: {
          avatar_path: string
          city: string
          display_name: string
          family_name: string
          point_id: string
          user_id: string
        }[]
      }
      messaging_inbox: { Args: never; Returns: Json }
      public_map_points: {
        Args: never
        Returns: {
          city: string
          consent_to_publish: boolean
          country: string
          created_at: string
          family_id: string
          id: string
          latitude: number
          longitude: number
          status: string
        }[]
      }
      report_conversation: {
        Args: {
          _conversation: string
          _details: string
          _message: string
          _reason: string
        }
        Returns: string
      }
      report_dialog: {
        Args: { _conversation: string; _details: string; _reason: string }
        Returns: string
      }
      review_conversation_report: {
        Args: { _ban: boolean; _report: string }
        Returns: undefined
      }
      send_chat_message: {
        Args: { _body: string; _conversation: string }
        Returns: string
      }
      set_participant_block: {
        Args: { _blocked: boolean; _target: string }
        Returns: undefined
      }
      start_conversation: {
        Args: { _body: string; _target: string }
        Returns: string
      }
      touch_participant_activity: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
