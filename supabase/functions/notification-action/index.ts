// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

import { resolveNotificationAction } from "../../../lib/notifications/action-routing.ts";

serve(async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const result = resolveNotificationAction({
    action: body.action,
    baseUrl: body.baseUrl,
    slot: body.slot,
    snoozeCount: body.snoozeCount,
    now: body.now ? new Date(body.now) : new Date(),
  });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
