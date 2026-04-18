export type NotificationAction = "now_rest" | "snooze_15" | "dismiss";

export interface NotificationActionPayload {
  action: NotificationAction;
  baseUrl: string;
  slot?: string | null;
  now?: Date;
  snoozeCount?: number;
}

export interface NotificationActionResult {
  type: "open" | "schedule" | "close";
  url?: string;
  delayMinutes?: number;
  ignored?: boolean;
}

const MAX_SNOOZE_PER_SLOT = 3;

function minutesSinceMidnight(now: Date) {
  return now.getHours() * 60 + now.getMinutes();
}

export function resolveNotificationAction({
  action,
  baseUrl,
  slot,
  now = new Date(),
  snoozeCount = 0,
}: NotificationActionPayload): NotificationActionResult {
  if (action === "now_rest") {
    return {
      type: "open",
      url: `${baseUrl.replace(/\/$/, "")}/rest?source=notification${slot ? `&slot=${encodeURIComponent(slot)}` : ""}`,
    };
  }

  if (action === "dismiss") {
    return { type: "close" };
  }

  if (snoozeCount >= MAX_SNOOZE_PER_SLOT || minutesSinceMidnight(now) >= 23 * 60) {
    return { type: "close", ignored: true };
  }

  return {
    type: "schedule",
    delayMinutes: 15,
  };
}
