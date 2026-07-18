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
      debate_weeks: {
        Row: {
          ai_summary: string | null
          con_percent: number
          created_at: string
          event_at: string
          id: string
          listeners_total: number
          pro_percent: number
          rounds_count: number
          topic: string | null
          topic_reveal_at: string
          week_start: string
        }
        Insert: {
          ai_summary?: string | null
          con_percent?: number
          created_at?: string
          event_at: string
          id?: string
          listeners_total?: number
          pro_percent?: number
          rounds_count?: number
          topic?: string | null
          topic_reveal_at: string
          week_start: string
        }
        Update: {
          ai_summary?: string | null
          con_percent?: number
          created_at?: string
          event_at?: string
          id?: string
          listeners_total?: number
          pro_percent?: number
          rounds_count?: number
          topic?: string | null
          topic_reveal_at?: string
          week_start?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          format: string | null
          id: string
          location: string | null
          starts_at: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          format?: string | null
          id?: string
          location?: string | null
          starts_at: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          format?: string | null
          id?: string
          location?: string | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      judge_evaluations: {
        Row: {
          created_at: string
          feedback: string
          format: string
          id: string
          improvements: string[]
          motion: string
          overall_score: number
          scores: Json
          side: string | null
          speech: string
          strengths: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback: string
          format: string
          id?: string
          improvements?: string[]
          motion: string
          overall_score: number
          scores: Json
          side?: string | null
          speech: string
          strengths?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string
          format?: string
          id?: string
          improvements?: string[]
          motion?: string
          overall_score?: number
          scores?: Json
          side?: string | null
          speech?: string
          strengths?: string[]
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: []
      }
      live_rooms: {
        Row: {
          format: string
          id: string
          is_live: boolean
          listeners: number
          started_at: string
          topic: string | null
          visibility: string
        }
        Insert: {
          format: string
          id?: string
          is_live?: boolean
          listeners?: number
          started_at?: string
          topic?: string | null
          visibility?: string
        }
        Update: {
          format?: string
          id?: string
          is_live?: boolean
          listeners?: number
          started_at?: string
          topic?: string | null
          visibility?: string
        }
        Relationships: []
      }
      motions: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          format: string
          id: string
          language: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          format: string
          id?: string
          language?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          format?: string
          id?: string
          language?: string
          title?: string
        }
        Relationships: []
      }
      player_ratings: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          knock: number
          league: string
          mastery: number
          mastery_trend_week: number
          matches_played: number
          moderator: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          knock?: number
          league?: string
          mastery?: number
          mastery_trend_week?: number
          matches_played?: number
          moderator?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          knock?: number
          league?: string
          mastery?: number
          mastery_trend_week?: number
          matches_played?: number
          moderator?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthdate: string | null
          city: string | null
          created_at: string
          display_name: string | null
          id: string
          languages: Json
          parent_confirmed_at: string | null
          parent_email: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          birthdate?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          languages?: Json
          parent_confirmed_at?: string | null
          parent_email?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          birthdate?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          languages?: Json
          parent_confirmed_at?: string | null
          parent_email?: string | null
          role?: string | null
        }
        Relationships: []
      }
      roundtables: {
        Row: {
          best_speaker_name: string | null
          created_at: string
          id: string
          is_live: boolean
          knock_count: number
          listeners: number
          moderator_id: string | null
          moderator_name: string | null
          opinion_after: number | null
          opinion_before: number | null
          participants: Json
          starts_at: string
          topic: string
        }
        Insert: {
          best_speaker_name?: string | null
          created_at?: string
          id?: string
          is_live?: boolean
          knock_count?: number
          listeners?: number
          moderator_id?: string | null
          moderator_name?: string | null
          opinion_after?: number | null
          opinion_before?: number | null
          participants?: Json
          starts_at?: string
          topic: string
        }
        Update: {
          best_speaker_name?: string | null
          created_at?: string
          id?: string
          is_live?: boolean
          knock_count?: number
          listeners?: number
          moderator_id?: string | null
          moderator_name?: string | null
          opinion_after?: number | null
          opinion_before?: number | null
          participants?: Json
          starts_at?: string
          topic?: string
        }
        Relationships: []
      }
      saved_cases: {
        Row: {
          arguments: Json | null
          conclusion: string | null
          created_at: string
          id: string
          motion_text: string
          side: string | null
          thesis: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arguments?: Json | null
          conclusion?: string | null
          created_at?: string
          id?: string
          motion_text: string
          side?: string | null
          thesis?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arguments?: Json | null
          conclusion?: string | null
          created_at?: string
          id?: string
          motion_text?: string
          side?: string | null
          thesis?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      week_highlights: {
        Row: {
          created_at: string
          format: string | null
          id: string
          knock_count: number
          participants: string | null
          recording_url: string | null
          title: string
          week_id: string
        }
        Insert: {
          created_at?: string
          format?: string | null
          id?: string
          knock_count?: number
          participants?: string | null
          recording_url?: string | null
          title: string
          week_id: string
        }
        Update: {
          created_at?: string
          format?: string | null
          id?: string
          knock_count?: number
          participants?: string | null
          recording_url?: string | null
          title?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "week_highlights_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "debate_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
