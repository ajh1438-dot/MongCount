export const SUPABASE_TABLES = {
  userPreferences: "user_preferences",
  restSessions: "rest_sessions",
  notificationSubscriptions: "notification_subscriptions",
  weeklyReports: "weekly_reports",
  monthlyReports: "monthly_reports",
  subscriptions: "subscriptions",
} as const;

export const SUPABASE_VIEWS = {
  todayProgress: "today_progress",
} as const;
