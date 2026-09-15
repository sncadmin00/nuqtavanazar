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
      achievements: {
        Row: {
          awarded_at: string
          created_at: string
          event_name: string | null
          id: string
          kind: string
          note: string | null
          place: number | null
          team_id: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          awarded_at?: string
          created_at?: string
          event_name?: string | null
          id?: string
          kind?: string
          note?: string | null
          place?: number | null
          team_id?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          awarded_at?: string
          created_at?: string
          event_name?: string | null
          id?: string
          kind?: string
          note?: string | null
          place?: number | null
          team_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_bookings: {
        Row: {
          challenger_id: string | null
          created_at: string
          format: string
          id: string
          opponent_id: string | null
          status: string
          week_id: string
        }
        Insert: {
          challenger_id?: string | null
          created_at?: string
          format: string
          id?: string
          opponent_id?: string | null
          status?: string
          week_id: string
        }
        Update: {
          challenger_id?: string | null
          created_at?: string
          format?: string
          id?: string
          opponent_id?: string | null
          status?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_bookings_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "debate_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_cadence: {
        Row: {
          day_of_week: number
          event_duration_hours: number
          event_time: string
          id: boolean
          interval_days: number
          reveal_lead_hours: number
          timezone: string
          updated_at: string
        }
        Insert: {
          day_of_week?: number
          event_duration_hours?: number
          event_time?: string
          id?: boolean
          interval_days?: number
          reveal_lead_hours?: number
          timezone?: string
          updated_at?: string
        }
        Update: {
          day_of_week?: number
          event_duration_hours?: number
          event_time?: string
          id?: boolean
          interval_days?: number
          reveal_lead_hours?: number
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      debate_weeks: {
        Row: {
          ai_summary: string | null
          con_percent: number
          created_at: string
          event_at: string
          event_ends_at: string | null
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
          event_ends_at?: string | null
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
          event_ends_at?: string | null
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
      duel_challenges: {
        Row: {
          created_at: string
          duel_id: string | null
          expires_at: string | null
          from_name: string
          from_team_id: string | null
          from_user_id: string
          id: string
          kind: string
          responded_at: string | null
          status: string
          to_name: string
          to_team_id: string | null
          to_user_id: string
          updated_at: string
          week_id: string
        }
        Insert: {
          created_at?: string
          duel_id?: string | null
          expires_at?: string | null
          from_name?: string
          from_team_id?: string | null
          from_user_id: string
          id?: string
          kind?: string
          responded_at?: string | null
          status?: string
          to_name?: string
          to_team_id?: string | null
          to_user_id: string
          updated_at?: string
          week_id: string
        }
        Update: {
          created_at?: string
          duel_id?: string | null
          expires_at?: string | null
          from_name?: string
          from_team_id?: string | null
          from_user_id?: string
          id?: string
          kind?: string
          responded_at?: string | null
          status?: string
          to_name?: string
          to_team_id?: string | null
          to_user_id?: string
          updated_at?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "duel_challenges_duel_id_fkey"
            columns: ["duel_id"]
            isOneToOne: false
            referencedRelation: "duels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_challenges_from_team_id_fkey"
            columns: ["from_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_challenges_to_team_id_fkey"
            columns: ["to_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_challenges_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "debate_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      duel_turns: {
        Row: {
          audio_path: string | null
          created_at: string
          duel_id: string
          duration_sec: number
          id: string
          idx: number
          kind: string
          side: string
          text: string
          user_id: string
        }
        Insert: {
          audio_path?: string | null
          created_at?: string
          duel_id: string
          duration_sec?: number
          id?: string
          idx: number
          kind?: string
          side: string
          text?: string
          user_id: string
        }
        Update: {
          audio_path?: string | null
          created_at?: string
          duel_id?: string
          duration_sec?: number
          id?: string
          idx?: number
          kind?: string
          side?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "duel_turns_duel_id_fkey"
            columns: ["duel_id"]
            isOneToOne: false
            referencedRelation: "duels"
            referencedColumns: ["id"]
          },
        ]
      }
      duels: {
        Row: {
          con_name: string | null
          con_name2: string | null
          con_team_id: string | null
          con_user_id: string | null
          con_user2_id: string | null
          created_at: string
          format: string
          id: string
          motion: string
          prep_ends_at: string | null
          pro_name: string
          pro_name2: string | null
          pro_team_id: string | null
          pro_user_id: string
          pro_user2_id: string | null
          recording_url: string | null
          room_name: string | null
          status: string
          tournament_match_id: string | null
          turn_ends_at: string | null
          turn_index: number
          turn_user_id: string | null
          updated_at: string
          verdict: Json | null
          week_id: string | null
          winner_user_id: string | null
        }
        Insert: {
          con_name?: string | null
          con_name2?: string | null
          con_team_id?: string | null
          con_user_id?: string | null
          con_user2_id?: string | null
          created_at?: string
          format?: string
          id?: string
          motion: string
          prep_ends_at?: string | null
          pro_name?: string
          pro_name2?: string | null
          pro_team_id?: string | null
          pro_user_id: string
          pro_user2_id?: string | null
          recording_url?: string | null
          room_name?: string | null
          status?: string
          tournament_match_id?: string | null
          turn_ends_at?: string | null
          turn_index?: number
          turn_user_id?: string | null
          updated_at?: string
          verdict?: Json | null
          week_id?: string | null
          winner_user_id?: string | null
        }
        Update: {
          con_name?: string | null
          con_name2?: string | null
          con_team_id?: string | null
          con_user_id?: string | null
          con_user2_id?: string | null
          created_at?: string
          format?: string
          id?: string
          motion?: string
          prep_ends_at?: string | null
          pro_name?: string
          pro_name2?: string | null
          pro_team_id?: string | null
          pro_user_id?: string
          pro_user2_id?: string | null
          recording_url?: string | null
          room_name?: string | null
          status?: string
          tournament_match_id?: string | null
          turn_ends_at?: string | null
          turn_index?: number
          turn_user_id?: string | null
          updated_at?: string
          verdict?: Json | null
          week_id?: string | null
          winner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duels_con_team_id_fkey"
            columns: ["con_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_pro_team_id_fkey"
            columns: ["pro_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_tournament_match_id_fkey"
            columns: ["tournament_match_id"]
            isOneToOne: false
            referencedRelation: "tournament_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "debate_weeks"
            referencedColumns: ["id"]
          },
        ]
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
      roundtable_applications: {
        Row: {
          created_at: string
          full_name: string
          id: string
          pitch: string
          roundtable_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          pitch: string
          roundtable_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          pitch?: string
          roundtable_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roundtable_applications_roundtable_id_fkey"
            columns: ["roundtable_id"]
            isOneToOne: false
            referencedRelation: "roundtables"
            referencedColumns: ["id"]
          },
        ]
      }
      roundtables: {
        Row: {
          best_speaker_name: string | null
          capacity: number
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
          recording_url: string | null
          starts_at: string
          topic: string
        }
        Insert: {
          best_speaker_name?: string | null
          capacity?: number
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
          recording_url?: string | null
          starts_at?: string
          topic: string
        }
        Update: {
          best_speaker_name?: string | null
          capacity?: number
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
          recording_url?: string | null
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
      team_invites: {
        Row: {
          created_at: string
          from_name: string
          from_user_id: string
          id: string
          responded_at: string | null
          status: string
          team_id: string
          team_name: string
          to_name: string
          to_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_name: string
          from_user_id: string
          id?: string
          responded_at?: string | null
          status?: string
          team_id: string
          team_name: string
          to_name: string
          to_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_name?: string
          from_user_id?: string
          id?: string
          responded_at?: string | null
          status?: string
          team_id?: string
          team_name?: string
          to_name?: string
          to_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          created_at: string
          id: string
          joined_at: string
          left_at: string | null
          role: string
          team_id: string
          team_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string
          team_id: string
          team_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string
          team_id?: string
          team_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_ratings: {
        Row: {
          elo: number
          matches_played: number
          team_id: string
          updated_at: string
          wins: number
        }
        Insert: {
          elo?: number
          matches_played?: number
          team_id: string
          updated_at?: string
          wins?: number
        }
        Update: {
          elo?: number
          matches_played?: number
          team_id?: string
          updated_at?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_ratings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          looking_for_partner: boolean
          name: string
          owner_id: string
          owner_name: string | null
          partner_id: string | null
          partner_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          looking_for_partner?: boolean
          name: string
          owner_id: string
          owner_name?: string | null
          partner_id?: string | null
          partner_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          looking_for_partner?: boolean
          name?: string
          owner_id?: string
          owner_name?: string | null
          partner_id?: string | null
          partner_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tournament_entrants: {
        Row: {
          created_at: string
          display_name: string
          id: string
          kind: string
          seed: number | null
          status: string
          team_id: string | null
          tournament_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          kind: string
          seed?: number | null
          status?: string
          team_id?: string | null
          tournament_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          kind?: string
          seed?: number | null
          status?: string
          team_id?: string | null
          tournament_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_entrants_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_entrants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_matches: {
        Row: {
          a_entrant_id: string | null
          a_points: number
          b_entrant_id: string | null
          b_points: number
          created_at: string
          duel_id: string | null
          id: string
          round_no: number
          scheduled_at: string | null
          slot: number
          stage: string
          status: string
          tournament_id: string
          updated_at: string
          winner_entrant_id: string | null
        }
        Insert: {
          a_entrant_id?: string | null
          a_points?: number
          b_entrant_id?: string | null
          b_points?: number
          created_at?: string
          duel_id?: string | null
          id?: string
          round_no?: number
          scheduled_at?: string | null
          slot?: number
          stage: string
          status?: string
          tournament_id: string
          updated_at?: string
          winner_entrant_id?: string | null
        }
        Update: {
          a_entrant_id?: string | null
          a_points?: number
          b_entrant_id?: string | null
          b_points?: number
          created_at?: string
          duel_id?: string | null
          id?: string
          round_no?: number
          scheduled_at?: string | null
          slot?: number
          stage?: string
          status?: string
          tournament_id?: string
          updated_at?: string
          winner_entrant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_a_entrant_id_fkey"
            columns: ["a_entrant_id"]
            isOneToOne: false
            referencedRelation: "tournament_entrants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_b_entrant_id_fkey"
            columns: ["b_entrant_id"]
            isOneToOne: false
            referencedRelation: "tournament_entrants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_duel_id_fkey"
            columns: ["duel_id"]
            isOneToOne: false
            referencedRelation: "duels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_entrant_id_fkey"
            columns: ["winner_entrant_id"]
            isOneToOne: false
            referencedRelation: "tournament_entrants"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string | null
          day1_at: string
          day1_topic: string | null
          day2_at: string
          day2_topic: string | null
          description: string | null
          format: string
          id: string
          max_entrants: number
          slot_minutes: number
          status: string
          title: string
          updated_at: string
          week_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day1_at: string
          day1_topic?: string | null
          day2_at: string
          day2_topic?: string | null
          description?: string | null
          format?: string
          id?: string
          max_entrants?: number
          slot_minutes?: number
          status?: string
          title: string
          updated_at?: string
          week_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day1_at?: string
          day1_topic?: string | null
          day2_at?: string
          day2_topic?: string | null
          description?: string | null
          format?: string
          id?: string
          max_entrants?: number
          slot_minutes?: number
          status?: string
          title?: string
          updated_at?: string
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "debate_weeks"
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
      week_arguments: {
        Row: {
          author_name: string | null
          created_at: string
          id: string
          knock_count: number
          side: string
          text: string
          week_id: string
        }
        Insert: {
          author_name?: string | null
          created_at?: string
          id?: string
          knock_count?: number
          side: string
          text: string
          week_id: string
        }
        Update: {
          author_name?: string | null
          created_at?: string
          id?: string
          knock_count?: number
          side?: string
          text?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "week_arguments_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "debate_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      week_featured_speakers: {
        Row: {
          avatar_url: string | null
          badge_note: string | null
          created_at: string
          display_name: string
          id: string
          kind: string
          week_id: string
        }
        Insert: {
          avatar_url?: string | null
          badge_note?: string | null
          created_at?: string
          display_name: string
          id?: string
          kind: string
          week_id: string
        }
        Update: {
          avatar_url?: string | null
          badge_note?: string | null
          created_at?: string
          display_name?: string
          id?: string
          kind?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "week_featured_speakers_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "debate_weeks"
            referencedColumns: ["id"]
          },
        ]
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
      week_public_votes: {
        Row: {
          created_at: string
          id: string
          side: string
          visitor_id: string
          week_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          side: string
          visitor_id: string
          week_id: string
        }
        Update: {
          created_at?: string
          id?: string
          side?: string
          visitor_id?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "week_public_votes_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "debate_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      week_quotes: {
        Row: {
          author_name: string
          created_at: string
          id: string
          knock_count: number
          order_index: number
          text: string
          week_id: string
        }
        Insert: {
          author_name: string
          created_at?: string
          id?: string
          knock_count?: number
          order_index?: number
          text: string
          week_id: string
        }
        Update: {
          author_name?: string
          created_at?: string
          id?: string
          knock_count?: number
          order_index?: number
          text?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "week_quotes_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "debate_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      week_voice_knocks: {
        Row: {
          created_at: string
          id: string
          visitor_id: string
          voice_note_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          visitor_id: string
          voice_note_id: string
        }
        Update: {
          created_at?: string
          id?: string
          visitor_id?: string
          voice_note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "week_voice_knocks_voice_note_id_fkey"
            columns: ["voice_note_id"]
            isOneToOne: false
            referencedRelation: "week_voice_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      week_voice_notes: {
        Row: {
          audio_path: string
          author_name: string
          created_at: string
          duration_sec: number
          id: string
          knock_count: number
          status: string
          transcript_preview: string | null
          user_id: string
          visibility: string
          week_id: string
        }
        Insert: {
          audio_path: string
          author_name: string
          created_at?: string
          duration_sec: number
          id?: string
          knock_count?: number
          status?: string
          transcript_preview?: string | null
          user_id: string
          visibility?: string
          week_id: string
        }
        Update: {
          audio_path?: string
          author_name?: string
          created_at?: string
          duration_sec?: number
          id?: string
          knock_count?: number
          status?: string
          transcript_preview?: string | null
          user_id?: string
          visibility?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "week_voice_notes_week_id_fkey"
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
      accept_team_invite: { Args: { _invite_id: string }; Returns: string }
      cast_retro_vote: {
        Args: { _side: string; _visitor_id: string; _week_id: string }
        Returns: {
          con: number
          pro: number
          total: number
        }[]
      }
      get_week_vote_stats: {
        Args: { _week_id: string }
        Returns: {
          con: number
          pro: number
          total: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      knock_week_voice_note: {
        Args: { _visitor_id: string; _voice_note_id: string }
        Returns: number
      }
      leave_team: { Args: { _team_id: string }; Returns: boolean }
      start_challenge_duel: { Args: { _challenge_id: string }; Returns: string }
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
      app_role: ["admin", "user"],
    },
  },
} as const
