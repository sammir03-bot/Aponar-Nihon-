export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          metadata: Json
          page: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: never
          metadata?: Json
          page?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: never
          metadata?: Json
          page?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          daily_study_minutes: number
          email: string | null
          full_name: string | null
          id: string
          jlpt_target: string | null
          last_active_at: string | null
          nationality: string | null
          phone: string | null
          preferred_language: string
          role: string
          school: string | null
          study_goal: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          daily_study_minutes?: number
          email?: string | null
          full_name?: string | null
          id: string
          jlpt_target?: string | null
          last_active_at?: string | null
          nationality?: string | null
          phone?: string | null
          preferred_language?: string
          role?: string
          school?: string | null
          study_goal?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          daily_study_minutes?: number
          email?: string | null
          full_name?: string | null
          id?: string
          jlpt_target?: string | null
          last_active_at?: string | null
          nationality?: string | null
          phone?: string | null
          preferred_language?: string
          role?: string
          school?: string | null
          study_goal?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_progress: {
        Row: {
          id: number
          item_key: string
          metadata: Json
          module: string
          progress: number
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: number
          item_key: string
          metadata?: Json
          module: string
          progress?: number
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: number
          item_key?: string
          metadata?: Json
          module?: string
          progress?: number
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_student_activity: {
        Args: { target_user: string }
        Returns: {
          created_at: string
          event_type: string
          item_key: string
          metadata: Json
          module: string
        }[]
      }
      admin_student_overview: {
        Args: never
        Returns: {
          activity_count: number
          email: string
          full_name: string
          id: string
          jlpt_level: string
          last_active_at: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      touch_profile_activity: { Args: never; Returns: undefined }
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
