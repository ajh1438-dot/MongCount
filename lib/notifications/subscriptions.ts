import type { NotificationPlatform, NotificationSubscriptionRow } from "@/lib/db/types";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { SUPABASE_TABLES } from "@/lib/supabase/tables";

interface PushSubscriptionKeys {
  p256dh?: string;
  auth?: string;
}

export interface NotificationSubscriptionInput {
  endpoint: string;
  keys: PushSubscriptionKeys;
  platform: NotificationPlatform;
}

function normalizeInput(input: NotificationSubscriptionInput) {
  const endpoint = input.endpoint.trim();
  const p256dh = input.keys.p256dh?.trim();
  const auth = input.keys.auth?.trim();

  if (!endpoint || !p256dh || !auth) {
    return null;
  }

  return {
    endpoint,
    keys: {
      p256dh,
      auth,
    },
    platform: input.platform,
  } satisfies Pick<NotificationSubscriptionRow, "endpoint" | "keys" | "platform">;
}

export async function saveNotificationSubscription(input: NotificationSubscriptionInput) {
  const normalized = normalizeInput(input);

  if (!normalized) {
    return { error: "invalid_subscription" as const };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "unauthorized" as const };
  }

  const payload = {
    user_id: user.id,
    endpoint: normalized.endpoint,
    keys: normalized.keys,
    platform: normalized.platform,
    snooze_log: {},
  };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.notificationSubscriptions)
    .upsert(payload, { onConflict: "user_id,endpoint" })
    .select("id, user_id, endpoint, keys, platform, created_at, snooze_log")
    .maybeSingle();

  if (error) {
    return { error: "subscription_save_failed" as const };
  }

  return { data } as const;
}
