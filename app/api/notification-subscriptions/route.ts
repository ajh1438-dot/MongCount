import { NextResponse } from "next/server";

import { saveNotificationSubscription } from "@/lib/notifications/subscriptions";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
    platform?: unknown;
  };

  const result = await saveNotificationSubscription({
    endpoint: typeof body.endpoint === "string" ? body.endpoint : "",
    keys: {
      p256dh: typeof body.keys?.p256dh === "string" ? body.keys.p256dh : undefined,
      auth: typeof body.keys?.auth === "string" ? body.keys.auth : undefined,
    },
    platform:
      body.platform === "android_chrome" || body.platform === "ios_safari" || body.platform === "desktop"
        ? body.platform
        : "desktop",
  });

  if (result.error === "invalid_subscription") {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (result.error === "unauthorized") {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data, { status: 200 });
}
