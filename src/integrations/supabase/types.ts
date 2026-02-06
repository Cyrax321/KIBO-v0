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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number | null
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          applied_at: string | null
          company: string
          created_at: string
          id: string
          is_remote: boolean | null
          job_url: string | null
          location: string | null
          notes: string | null
          role: string
          salary: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          company: string
          created_at?: string
          id?: string
          is_remote?: boolean | null
          job_url?: string | null
          location?: string | null
          notes?: string | null
          role: string
          salary?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          company?: string
          created_at?: string
          id?: string
          is_remote?: boolean | null
          job_url?: string | null
          location?: string | null
          notes?: string | null
          role?: string
          salary?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assessment_attempts: {
        Row: {
          answers: Json | null
          assessment_id: string
          assessment_title: string | null
          completed_at: string | null
          created_at: string
          id: string
          max_score: number | null
          passed: boolean | null
          score: number | null
          started_at: string
          time_taken_seconds: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          answers?: Json | null
          assessment_id: string
          assessment_title?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          max_score?: number | null
          passed?: boolean | null
          score?: number | null
          started_at?: string
          time_taken_seconds?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          answers?: Json | null
          assessment_id?: string
          assessment_title?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          max_score?: number | null
          passed?: boolean | null
          score?: number | null
          started_at?: string
          time_taken_seconds?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          company: string
          created_at: string
          description: string | null
          difficulty: string
          duration_minutes: number
          id: string
          problem_ids: string[] | null
          success_rate: number | null
          title: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          difficulty: string
          duration_minutes?: number
          id?: string
          problem_ids?: string[] | null
          success_rate?: number | null
          title: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          id?: string
          problem_ids?: string[] | null
          success_rate?: number | null
          title?: string
        }
        Relationships: []
      }
      coding_problems: {
        Row: {
          company_tags: string[] | null
          constraints: string | null
          created_at: string
          description: string
          difficulty: string
          editorial_content: string | null
          id: string
          sample_cases: Json | null
          starter_code: Json | null
          test_cases: Json | null
          title: string
          topic_tags: string[] | null
        }
        Insert: {
          company_tags?: string[] | null
          constraints?: string | null
          created_at?: string
          description: string
          difficulty: string
          editorial_content?: string | null
          id?: string
          sample_cases?: Json | null
          starter_code?: Json | null
          test_cases?: Json | null
          title: string
          topic_tags?: string[] | null
        }
        Update: {
          company_tags?: string[] | null
          constraints?: string | null
          created_at?: string
          description?: string
          difficulty?: string
          editorial_content?: string | null
          id?: string
          sample_cases?: Json | null
          starter_code?: Json | null
          test_cases?: Json | null
          title?: string
          topic_tags?: string[] | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          note: string | null
          receiver_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          receiver_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          receiver_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      contest_registrations: {
        Row: {
          contest_id: string
          finish_time: string | null
          id: string
          registered_at: string
          score: number | null
          user_id: string
        }
        Insert: {
          contest_id: string
          finish_time?: string | null
          id?: string
          registered_at?: string
          score?: number | null
          user_id: string
        }
        Update: {
          contest_id?: string
          finish_time?: string | null
          id?: string
          registered_at?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_registrations_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          id: string
          is_active: boolean | null
          problem_ids: string[] | null
          start_time: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          problem_ids?: string[] | null
          start_time: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          problem_ids?: string[] | null
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      daily_activities: {
        Row: {
          activity_date: string
          applications_sent: number
          assessments_completed: number
          created_at: string
          id: string
          problems_solved: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          activity_date?: string
          applications_sent?: number
          assessments_completed?: number
          created_at?: string
          id?: string
          problems_solved?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          activity_date?: string
          applications_sent?: number
          assessments_completed?: number
          created_at?: string
          id?: string
          problems_solved?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          task_date: string
          task_type: string | null
          title: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          task_date?: string
          task_type?: string | null
          title: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          task_date?: string
          task_type?: string | null
          title?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      level_thresholds: {
        Row: {
          level: number
          title: string | null
          xp_required: number
        }
        Insert: {
          level: number
          title?: string | null
          xp_required: number
        }
        Update: {
          level?: number
          title?: string | null
          xp_required?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          from_user_id: string | null
          id: string
          is_read: boolean
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          from_user_id?: string | null
          id?: string
          is_read?: boolean
          reference_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          from_user_id?: string | null
          id?: string
          is_read?: boolean
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      post_upvotes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          post_type: string
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          post_type?: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          post_type?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          applications_count: number
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          full_name: string | null
          github_url: string | null
          headline: string | null
          id: string
          last_active: string | null
          level: number
          linkedin_url: string | null
          problems_solved: number
          role: string | null
          skills: string[] | null
          streak: number
          target: string | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          applications_count?: number
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          last_active?: string | null
          level?: number
          linkedin_url?: string | null
          problems_solved?: number
          role?: string | null
          skills?: string[] | null
          streak?: number
          target?: string | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          applications_count?: number
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          last_active?: string | null
          level?: number
          linkedin_url?: string | null
          problems_solved?: number
          role?: string | null
          skills?: string[] | null
          streak?: number
          target?: string | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          correct_answers: number
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          quiz_title: string
          quiz_topic: string
          score: number
          started_at: string
          time_taken_seconds: number | null
          total_questions: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id: string
          quiz_title: string
          quiz_topic: string
          score?: number
          started_at?: string
          time_taken_seconds?: number | null
          total_questions: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          quiz_title?: string
          quiz_topic?: string
          score?: number
          started_at?: string
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      schedule_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          related_application_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          related_application_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          related_application_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_events_related_application_id_fkey"
            columns: ["related_application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          code: string
          created_at: string
          id: string
          language: string
          memory_kb: number | null
          problem_id: string
          runtime_ms: number | null
          status: string
          test_results: Json | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          language: string
          memory_kb?: number | null
          problem_id: string
          runtime_ms?: number | null
          status: string
          test_results?: Json | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          language?: string
          memory_kb?: number | null
          problem_id?: string
          runtime_ms?: number | null
          status?: string
          test_results?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "coding_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_config: {
        Row: {
          description: string | null
          id: string
          xp_value: number
        }
        Insert: {
          description?: string | null
          id: string
          xp_value: number
        }
        Update: {
          description?: string | null
          id?: string
          xp_value?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: { p_action: string; p_custom_xp?: number; p_user_id: string }
        Returns: {
          leveled_up: boolean
          new_level: number
          new_xp: number
          xp_gained: number
        }[]
      }
      calculate_level: { Args: { xp_amount: number }; Returns: number }
      check_achievements: {
        Args: { p_user_id: string }
        Returns: {
          achievement_id: string
          achievement_name: string
          xp_reward: number
        }[]
      }
      get_xp_value: { Args: { action_id: string }; Returns: number }
      init_daily_activity: {
        Args: { p_user_id: string }
        Returns: {
          daily_xp: number
          is_new_day: boolean
          streak: number
        }[]
      }
      record_application_update: {
        Args: { p_new_status: string; p_old_status: string; p_user_id: string }
        Returns: {
          new_xp: number
          xp_gained: number
        }[]
      }
      record_assessment_completed: {
        Args: {
          p_assessment_id: string
          p_passed: boolean
          p_score: number
          p_time_taken: number
          p_user_id: string
        }
        Returns: {
          leveled_up: boolean
          new_level: number
          new_xp: number
          xp_gained: number
        }[]
      }
      record_problem_solved: {
        Args: { p_difficulty: string; p_user_id: string }
        Returns: {
          leveled_up: boolean
          new_level: number
          new_problems_solved: number
          new_xp: number
          xp_gained: number
        }[]
      }
      update_streak: {
        Args: { p_user_id: string }
        Returns: {
          new_streak: number
          streak_bonus: number
        }[]
      }
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
