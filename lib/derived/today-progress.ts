import type { RestSessionRow, ResourceSlot, TodayProgressRow, UserPreferencesRow } from "@/lib/db/types";

const TARGET_COUNT = 6;
const DEFAULT_TIMEZONE = "Asia/Seoul";
const SCHEDULED_SLOTS = ["08:30", "10:30", "13:00", "15:30", "19:00", "22:00"] as const satisfies readonly Exclude<
  ResourceSlot,
  "adhoc"
>[];

export interface DeriveTodayProgressOptions {
  userId: string;
  sessions: RestSessionRow[];
  preferences?: Pick<UserPreferencesRow, "notification_slots" | "timezone"> | null;
  now?: Date;
}

function createDatePartsFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function createTimePartsFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatLocalDateKey(date: Date, timeZone: string) {
  const parts = createDatePartsFormatter(timeZone).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to derive local date parts for timezone ${timeZone}`);
  }

  return `${year}-${month}-${day}`;
}

function formatLocalMinutes(date: Date, timeZone: string) {
  const parts = createTimePartsFormatter(timeZone).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return hour * 60 + minute;
}

function parseSlotMinutes(slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  return hours * 60 + minutes;
}

function shiftDateKey(dateKey: string, daysDelta: number) {
  const shifted = new Date(`${dateKey}T00:00:00.000Z`);
  shifted.setUTCDate(shifted.getUTCDate() + daysDelta);
  return shifted.toISOString().slice(0, 10);
}

function buildCompletedCountsByDay(
  sessions: RestSessionRow[],
  timeZone: string,
  userId: string,
) {
  return sessions.reduce<Map<string, number>>((counts, session) => {
    if (session.user_id !== userId || !session.completed) {
      return counts;
    }

    const dateKey = formatLocalDateKey(new Date(session.started_at), timeZone);
    counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

function deriveNextSlot(
  notificationSlots: Record<string, boolean> | undefined,
  nowMinutes: number,
): Pick<TodayProgressRow, "next_slot_time" | "next_slot_in_minutes"> {
  const nextSlot = SCHEDULED_SLOTS.find((slot) => (notificationSlots?.[slot] ?? false) && parseSlotMinutes(slot) >= nowMinutes);

  if (!nextSlot) {
    return {
      next_slot_time: null,
      next_slot_in_minutes: null,
    };
  }

  return {
    next_slot_time: nextSlot,
    next_slot_in_minutes: parseSlotMinutes(nextSlot) - nowMinutes,
  };
}

function deriveLastSession(sessions: RestSessionRow[], userId: string): TodayProgressRow["last_session"] {
  const latestCompleted = sessions
    .filter((session) => session.user_id === userId && session.completed)
    .sort((left, right) => Date.parse(right.started_at) - Date.parse(left.started_at))[0];

  if (!latestCompleted) {
    return null;
  }

  return {
    id: latestCompleted.id,
    slot: latestCompleted.slot,
    started_at: latestCompleted.started_at,
    completed: latestCompleted.completed,
  };
}

function deriveSoftStreakDays(completedCountsByDay: Map<string, number>, todayDateKey: string) {
  let streakDays = 0;
  let cursor = todayDateKey;

  while ((completedCountsByDay.get(cursor) ?? 0) >= 3) {
    streakDays += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return streakDays;
}

export function deriveTodayProgress({
  userId,
  sessions,
  preferences,
  now = new Date(),
}: DeriveTodayProgressOptions): TodayProgressRow {
  const timeZone = preferences?.timezone ?? DEFAULT_TIMEZONE;
  const todayDateKey = formatLocalDateKey(now, timeZone);
  const completedCountsByDay = buildCompletedCountsByDay(sessions, timeZone, userId);
  const completedCount = completedCountsByDay.get(todayDateKey) ?? 0;
  const nextSlot = deriveNextSlot(preferences?.notification_slots, formatLocalMinutes(now, timeZone));

  return {
    user_id: userId,
    date: todayDateKey,
    completed_count: completedCount,
    target_count: TARGET_COUNT,
    next_slot_time: nextSlot.next_slot_time,
    next_slot_in_minutes: nextSlot.next_slot_in_minutes,
    last_session: deriveLastSession(sessions, userId),
    soft_streak_days: deriveSoftStreakDays(completedCountsByDay, todayDateKey),
  };
}
