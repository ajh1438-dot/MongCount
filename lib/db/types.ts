export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue | undefined }
  | JsonValue[];

export type ResourceSlot =
  | "08:30"
  | "10:30"
  | "13:00"
  | "15:30"
  | "19:00"
  | "22:00"
  | "adhoc";

export type DurationPreset = 3 | 5 | 10;
export type ThemePreference = "system" | "light" | "dark";
export type AuthProvider = "google" | "kakao" | "local_only";
export type NotificationPlatform = "android_chrome" | "ios_safari" | "desktop";
export type SubscriptionTier = "free" | "premium";
export type SubscriptionStatus = "trial" | "active" | "cancelled" | "expired";
export type SubscriptionPlan = "monthly" | "annual";
export type SubscriptionProvider = "stripe" | "iap";

export interface UserRow {
  id: string;
  email: string | null;
  display_name: string | null;
  provider: AuthProvider;
  created_at: string;
}

export interface NotificationSlotConfig {
  id: string;
  time: string;
  label: string;
}

export interface UserPreferencesRow {
  user_id: string;
  notification_slots: Record<string, boolean>;
  notification_slot_config?: Record<string, NotificationSlotConfig>;
  theme: ThemePreference;
  onboarding_completed: boolean;
  timezone: string;
  updated_at: string;
}

export interface RestSessionRow {
  id: string;
  user_id: string | null;
  slot: ResourceSlot;
  duration_preset: DurationPreset;
  duration_actual_sec: number | null;
  started_at: string;
  ended_at: string | null;
  completed: boolean;
  clarity: number | null;
  note: string | null;
  created_at: string;
}

export interface NotificationSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  keys: JsonValue;
  platform: NotificationPlatform;
  created_at: string;
  snooze_log: JsonValue;
}

export interface WeeklyReportRow {
  id: string;
  user_id: string;
  week_start: string;
  completed_days: number;
  day_dots: JsonValue;
  avg_clarity: number | null;
  best_session_id: string | null;
  ai_comment: string;
  generated_at: string;
}

export interface MonthlyReportRow {
  id: string;
  user_id: string;
  month: string;
  daily_clarity: JsonValue;
  total_sessions: number;
  max_clarity_session_id: string | null;
  min_clarity_session_id: string | null;
  generated_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  plan: SubscriptionPlan | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  provider: SubscriptionProvider | null;
  updated_at: string;
}

export interface TodayProgressRow {
  user_id: string;
  date: string;
  completed_count: number;
  target_count: number;
  next_slot_time: string | null;
  next_slot_in_minutes: number | null;
  last_session: Pick<RestSessionRow, "id" | "slot" | "started_at" | "completed"> | null;
  soft_streak_days: number;
}
