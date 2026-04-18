"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { NotificationPlatform } from "@/lib/db/types";

const ONBOARDING_COMPLETED_STORAGE_KEY = "onboardingCompleted";
const NOTIFICATION_SLOTS = ["08:30", "10:30", "13:00", "15:30", "19:00", "22:00"] as const;

type OnboardingStep = 1 | 2 | 3;
type PermissionState = "idle" | "denied";
type ViewState = OnboardingStep | "ios_guide";

type LocationLike = Pick<Location, "assign">;
type PushManagerLike = {
  subscribe: (options?: PushSubscriptionOptionsInit) => Promise<PushSubscriptionLike>;
};
type ServiceWorkerRegistrationLike = {
  pushManager?: PushManagerLike;
};
type ServiceWorkerContainerLike = {
  ready: Promise<ServiceWorkerRegistrationLike>;
};
type PushSubscriptionLike = {
  endpoint: string;
  toJSON: () => {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
};
type NotificationSubscriptionApi = {
  save: (input: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    platform: NotificationPlatform;
  }) => Promise<void>;
};

type NotificationLike = {
  requestPermission?: () => Promise<NotificationPermission>;
};

export interface S7OnboardingScreenProps {
  initialStep?: OnboardingStep;
  locationOverride?: LocationLike;
  notificationOverride?: NotificationLike;
  serviceWorkerOverride?: ServiceWorkerContainerLike;
  subscriptionApiOverride?: NotificationSubscriptionApi;
  userAgentOverride?: string;
  standaloneOverride?: boolean;
}

function pageLabel(step: OnboardingStep) {
  return `3단계 중 ${step}단계`;
}

function assignTarget(locationLike: LocationLike, href: string) {
  locationLike.assign(href);
}

function detectPlatform(userAgent: string, standalone: boolean): NotificationPlatform {
  const normalized = userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(normalized);
  const isAndroid = /android/.test(normalized);

  if (isIos && !standalone) {
    return "ios_safari";
  }

  if (isAndroid) {
    return "android_chrome";
  }

  return "desktop";
}

async function saveNotificationSubscription(
  subscriptionApi: NotificationSubscriptionApi,
  subscription: PushSubscriptionLike,
  platform: NotificationPlatform,
) {
  const payload = subscription.toJSON();
  const endpoint = payload.endpoint ?? subscription.endpoint;
  const p256dh = payload.keys?.p256dh ?? "";
  const auth = payload.keys?.auth ?? "";

  if (!endpoint || !p256dh || !auth) {
    return;
  }

  await subscriptionApi.save({
    endpoint,
    keys: { p256dh, auth },
    platform,
  });
}

export function S7OnboardingScreen({
  initialStep = 1,
  locationOverride,
  notificationOverride,
  serviceWorkerOverride,
  subscriptionApiOverride,
  userAgentOverride,
  standaloneOverride,
}: S7OnboardingScreenProps) {
  const [viewState, setViewState] = useState<ViewState>(initialStep);
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const step = viewState === "ios_guide" ? 2 : viewState;

  useEffect(() => {
    headingRef.current?.focus();
  }, [viewState]);

  const slotText = NOTIFICATION_SLOTS.join(" · ");

  async function handleAllowNotifications() {
    const notificationLike = notificationOverride ?? (typeof window !== "undefined" ? window.Notification : undefined);
    const serviceWorkerLike =
      serviceWorkerOverride ?? (typeof navigator !== "undefined" ? navigator.serviceWorker : undefined);
    const standalone =
      standaloneOverride ??
      (typeof navigator !== "undefined" && "standalone" in navigator
        ? Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
        : false);
    const platform = detectPlatform(
      userAgentOverride ?? (typeof navigator !== "undefined" ? navigator.userAgent : ""),
      standalone,
    );

    try {
      const permission = (await notificationLike?.requestPermission?.()) ?? "default";

      if (permission !== "granted") {
        setPermissionState("denied");
        setViewState(3);
        return;
      }

      if (subscriptionApiOverride && serviceWorkerLike?.ready) {
        const registration = await serviceWorkerLike.ready;
        const subscription = await registration.pushManager?.subscribe({ userVisibleOnly: true });

        if (subscription) {
          await saveNotificationSubscription(subscriptionApiOverride, subscription, platform);
        }
      }

      setPermissionState("idle");
      setViewState(platform === "ios_safari" ? "ios_guide" : 3);
    } catch {
      setPermissionState("denied");
      setViewState(3);
    }
  }

  function completeOnboarding() {
    window.localStorage.setItem(ONBOARDING_COMPLETED_STORAGE_KEY, "true");

    if (locationOverride) {
      assignTarget(locationOverride, "/login");
      return;
    }

    window.location.assign("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-6">
      <a className="sr-only focus:not-sr-only focus:mb-4 focus:inline-flex focus:min-h-11 focus:items-center" href="#onboarding-content">
        본문으로 건너뛰기
      </a>

      <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted">
        <p>쉼일지</p>
        <p aria-label={pageLabel(step)} data-testid="onboarding-page-indicator">
          {pageLabel(step)}
        </p>
      </div>

      <section
        id="onboarding-content"
        className="flex flex-1 flex-col justify-between rounded-[28px] border bg-surface px-6 py-8 shadow-sm"
      >
        <div className="space-y-7 text-center">
          <p className="text-6xl leading-none" aria-hidden="true" data-testid="onboarding-icon">
            {viewState === 1 ? "🧠" : viewState === 2 || viewState === "ios_guide" ? "🔔" : "⏱️"}
          </p>

          <div className="space-y-4">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-3xl font-semibold tracking-tight outline-none"
            >
              {viewState === 1
                ? "멍때리면 뇌가 정리돼요. 운동이 몸을 풀듯, 멍이 머리를 풀어줘요."
                : viewState === 2
                  ? "하루 6번, 멍때릴 시간을 알려드릴게요."
                  : viewState === "ios_guide"
                    ? "iPhone에서 알림을 받으려면..."
                    : "언제든 '지금 3분 멍때리기' 버튼이 있어요."}
            </h1>

            {viewState === 1 ? (
              <>
                <p className="text-sm leading-6 text-muted">
                  아무 생각 안 해도 뇌는 일하고 있어요. 나뭇잎을 보든, 벽을 보든, 그냥 멍하니 있기만 해도요.
                </p>
                <div className="rounded-xl bg-background p-5 text-left">
                  <p className="text-sm font-medium text-foreground">디폴트 모드 네트워크 — 멍때릴 때 활성화되는 뇌 영역이 창의성과 문제 해결을 담당해요.</p>
                  <p className="mt-1 text-sm text-muted">자주 멍때리는 사람이 더 잘 풀어요. 진짜로요.</p>
                </div>
              </>
            ) : null}

            {viewState === 2 ? (
              <>
                <div className="rounded-xl bg-background p-5 text-sm font-medium tracking-tight">
                  {slotText}
                </div>
                <p className="text-sm leading-6 text-muted">
                  알림을 켜면 멍때릴 시간을 놓치지 않아요. 건너뛰어도 괜찮아요.
                </p>
              </>
            ) : null}

            {viewState === "ios_guide" ? (
              <div className="rounded-xl bg-background px-5 py-5 text-left text-sm text-muted" data-testid="ios-pwa-guide">
                <ol className="space-y-3">
                  <li>1. 아래 공유 버튼을 눌러 주세요.</li>
                  <li>2. "홈화면에 추가"를 선택해 주세요.</li>
                  <li>3. 완료 후 홈화면 앱에서 알림을 받을 수 있어요.</li>
                </ol>
              </div>
            ) : null}

            {viewState === 3 ? (
              <>
                <p className="text-sm leading-6 text-muted">
                  시간 정하고, 멍때리고, 어땠는지 남겨보세요. 그게 다예요.
                </p>
                <div className="rounded-xl bg-background px-5 py-5 text-left">
                  <p className="text-sm font-medium">멍때리기는:</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted">
                    <li>· 뇌를 위한 스트레칭</li>
                    <li>· 아무것도 안 해도 되는 시간</li>
                    <li>· 기록하면 습관이 되는 것</li>
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 pt-8">
          {viewState === 1 ? (
            <Button fullWidth onClick={() => setViewState(2)}>
              다음 →
            </Button>
          ) : null}

          {viewState === 2 ? (
            <>
              <Button fullWidth onClick={() => void handleAllowNotifications()}>
                알림 허용
              </Button>
              <Button fullWidth variant="secondary" onClick={() => setViewState(3)}>
                건너뛰기
              </Button>
            </>
          ) : null}

          {viewState === "ios_guide" ? (
            <Button fullWidth onClick={() => setViewState(3)}>
              이해했어요
            </Button>
          ) : null}

          {viewState === 3 ? (
            <>
              {permissionState === "denied" ? (
                <p className="text-center text-sm text-muted" data-testid="notification-denied-message">
                  지금은 건너뛰고, 설정에서 나중에 다시 켤 수 있어요.
                </p>
              ) : null}
              <Button fullWidth onClick={completeOnboarding}>
                시작하기 →
              </Button>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
