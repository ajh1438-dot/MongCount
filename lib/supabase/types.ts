export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          user_id: string;
          notification_slots: Json;
          theme: "forest" | "light" | "dark";
          onboarding_completed: boolean;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          notification_slots?: Json;
          theme?: "forest" | "light" | "dark";
          onboarding_completed?: boolean;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          notification_slots?: Json;
          theme?: "forest" | "light" | "dark";
          onboarding_completed?: boolean;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rest_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          slot:
            | "08:30"
            | "10:30"
            | "13:00"
            | "15:30"
            | "19:00"
            | "22:00"
            | "adhoc";
          duration_preset: 3 | 5 | 10;
          duration_actual_sec: number | null;
          started_at: string;
          ended_at: string | null;
          completed: boolean;
          clarity: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          slot:
            | "08:30"
            | "10:30"
            | "13:00"
            | "15:30"
            | "19:00"
            | "22:00"
            | "adhoc";
          duration_preset?: 3 | 5 | 10;
          duration_actual_sec?: number | null;
          started_at: string;
          ended_at?: string | null;
          completed?: boolean;
          clarity?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          slot?:
            | "08:30"
            | "10:30"
            | "13:00"
            | "15:30"
            | "19:00"
            | "22:00"
            | "adhoc";
          duration_preset?: 3 | 5 | 10;
          duration_actual_sec?: number | null;
          started_at?: string;
          ended_at?: string | null;
          completed?: boolean;
          clarity?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notification_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          keys: Json;
          platform: "android_chrome" | "ios_safari" | "desktop";
          created_at: string;
          snooze_log: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          keys: Json;
          platform: "android_chrome" | "ios_safari" | "desktop";
          created_at?: string;
          snooze_log?: Json;
        };
        Update: {
          endpoint?: string;
          keys?: Json;
          platform?: "android_chrome" | "ios_safari" | "desktop";
          snooze_log?: Json;
        };
        Relationships: [];
      };
      weekly_reports: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          completed_days: number;
          day_dots: Json;
          avg_clarity: number | null;
          best_session_id: string | null;
          ai_comment: string;
          generated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          completed_days?: number;
          day_dots?: Json;
          avg_clarity?: number | null;
          best_session_id?: string | null;
          ai_comment?: string;
          generated_at?: string;
        };
        Update: {
          completed_days?: number;
          day_dots?: Json;
          avg_clarity?: number | null;
          best_session_id?: string | null;
          ai_comment?: string;
          generated_at?: string;
        };
        Relationships: [];
      };
      monthly_reports: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          daily_clarity: Json;
          total_sessions: number;
          max_clarity_session_id: string | null;
          min_clarity_session_id: string | null;
          generated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          daily_clarity?: Json;
          total_sessions?: number;
          max_clarity_session_id?: string | null;
          min_clarity_session_id?: string | null;
          generated_at?: string;
        };
        Update: {
          daily_clarity?: Json;
          total_sessions?: number;
          max_clarity_session_id?: string | null;
          min_clarity_session_id?: string | null;
          generated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: "free" | "premium";
          status: "trial" | "active" | "cancelled" | "expired";
          plan: "monthly" | "annual" | null;
          trial_ends_at: string | null;
          current_period_end: string | null;
          provider: "stripe" | "iap" | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: "free" | "premium";
          status?: "trial" | "active" | "cancelled" | "expired";
          plan?: "monthly" | "annual" | null;
          trial_ends_at?: string | null;
          current_period_end?: string | null;
          provider?: "stripe" | "iap" | null;
          updated_at?: string;
        };
        Update: {
          tier?: "free" | "premium";
          status?: "trial" | "active" | "cancelled" | "expired";
          plan?: "monthly" | "annual" | null;
          trial_ends_at?: string | null;
          current_period_end?: string | null;
          provider?: "stripe" | "iap" | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      today_progress: {
        Row: {
          user_id: string;
          date: string;
          completed_count: number;
          target_count: number;
          next_slot_time: string | null;
          next_slot_in_minutes: number | null;
          last_session: Json | null;
          soft_streak_days: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
