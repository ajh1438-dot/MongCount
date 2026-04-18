/* eslint-disable no-restricted-globals */

/// <reference lib="webworker" />
// eslint-disable-next-line no-constant-binary-expression
export {};

const swScope = globalThis as unknown as ServiceWorkerGlobalScope;
const ACTION_ENDPOINT = "/api/notification-action";

function getNotificationData(data: NotificationOptions["data"]) {
  return data && typeof data === "object" ? data : {};
}

function getSnoozeCount(data: Record<string, unknown>) {
  return typeof data.snoozeCount === "number" && Number.isFinite(data.snoozeCount) ? data.snoozeCount : 0;
}

swScope.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = (event.action || "dismiss") as "now_rest" | "snooze_15" | "dismiss";
  const data = getNotificationData(event.notification.data) as Record<string, unknown>;
  const slot = typeof data.slot === "string" ? data.slot : null;
  const snoozeCount = getSnoozeCount(data);
  const baseUrl = swScope.location.origin;

  event.waitUntil(
    fetch(ACTION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        baseUrl,
        slot,
        snoozeCount,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return response.json();
      })
      .then(async (result) => {
        if (!result) {
          return;
        }

        if (result.type === "open" && result.url) {
          const windowClients = await swScope.clients.matchAll({ type: "window", includeUncontrolled: true });
          const existing = windowClients.find((client) => "focus" in client);

          if (existing) {
            await existing.navigate(result.url);
            await existing.focus();
            return;
          }

          await swScope.clients.openWindow(result.url);
          return;
        }

        if (result.type === "schedule" && result.delayMinutes === 15) {
          await new Promise((resolve) => setTimeout(resolve, result.delayMinutes * 60 * 1000));
          await swScope.registration.showNotification(event.notification.title, {
            body: event.notification.body,
            data: {
              ...data,
              snoozeCount: snoozeCount + 1,
            },
            tag: slot ? `slot-${slot}` : undefined,
          });
        }
      })
      .catch(() => undefined),
  );
});
