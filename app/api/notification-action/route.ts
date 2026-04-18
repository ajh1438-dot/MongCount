import { NextResponse } from "next/server";

import {
  resolveNotificationAction,
  type NotificationAction,
} from "@/lib/notifications/action-routing";

interface NotificationActionBody {
  action?: unknown;
  baseUrl?: unknown;
  slot?: unknown;
  now?: unknown;
  snoozeCount?: unknown;
}

function normalizeAction(action: unknown): NotificationAction | null {
  if (action === "now_rest" || action === "snooze_15" || action === "dismiss") {
    return action;
  }

  return null;
}

function normalizeNow(now: unknown) {
  if (typeof now !== "string") {
    return undefined;
  }

  const parsed = new Date(now);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function POST(request: Request) {
  const body = (await request.json()) as NotificationActionBody;
  const action = normalizeAction(body.action);

  if (!action) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  const baseUrl = typeof body.baseUrl === "string" && body.baseUrl ? body.baseUrl : new URL(request.url).origin;
  const slot = typeof body.slot === "string" ? body.slot : null;
  const snoozeCount =
    typeof body.snoozeCount === "number" && Number.isFinite(body.snoozeCount) ? body.snoozeCount : 0;

  const result = resolveNotificationAction({
    action,
    baseUrl,
    slot,
    snoozeCount,
    now: normalizeNow(body.now),
  });

  return NextResponse.json(result, { status: 200 });
}
