"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { setLastUsedDuration, type DurationPreset } from "@/stores/s1-home-store";

type NotificationLike = { permission: NotificationPermission };

const DURATION_OPTIONS: DurationPreset[] = [3, 5, 10];
const ALL_DURATIONS = [1, 2, 3, 5, 7, 10, 15, 20] as const;

export interface S1HomeScreenProps {
  displayName?: string | null;
  isGuest?: boolean;
  notificationOverride?: NotificationLike;
  completedCount: number;
  targetCount?: number;
  nextSlotTime: string | null;
  nextSlotInMinutes: number | null;
  softStreakDays: number;
  lastSession?: {
    relativeTime: string;
    clarityCount: number;
  } | null;
  startDuration?: DurationPreset;
}

function ProgressDots({ count, target }: { count: number; target: number }) {
  const capped = Math.max(0, Math.min(count, target));
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: target }, (_, i) => (
        <span
          key={i}
          className={`inline-block text-base leading-none ${i < capped ? "text-foreground" : "text-muted/40"}`}
        >
          ☀︎
        </span>
      ))}
    </span>
  );
}

const NOTIFICATION_DENIED_BANNER_DISMISSED_KEY = "mongcount.s1.notificationDeniedBannerDismissed";

function nextSlotLabel(nextSlotInMinutes: number | null) {
  if (nextSlotInMinutes === null) {
    return null;
  }

  if (nextSlotInMinutes < 60) {
    return `약 ${nextSlotInMinutes}분 뒤`;
  }

  const roundedHours = Math.round(nextSlotInMinutes / 60);
  return `약 ${roundedHours}시간 뒤`;
}

export function S1HomeScreen({
  displayName,
  isGuest = false,
  notificationOverride,
  completedCount,
  targetCount = 6,
  nextSlotTime,
  nextSlotInMinutes,
  softStreakDays,
  lastSession,
  startDuration,
}: S1HomeScreenProps) {
  const router = useRouter();
  const [guestBannerVisible, setGuestBannerVisible] = useState(isGuest);
  const [notificationBannerDismissed, setNotificationBannerDismissed] = useState(false);
  const [notificationGuideVisible, setNotificationGuideVisible] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<DurationPreset>(startDuration ?? 3);
  const effectiveName = displayName?.trim() ? displayName : "몽님";
  const effectiveCount = Math.max(0, Math.min(completedCount, targetCount));
  const firstLaunch = effectiveCount === 0 && softStreakDays === 0;

  const nextSlotText = nextSlotTime && nextSlotInMinutes !== null ? `다음 쉼 ${nextSlotTime} · ${nextSlotLabel(nextSlotInMinutes)}` : "오늘 쉼을 모두 완료했어요 ✨";
  const notification = notificationOverride ?? (typeof window !== "undefined" ? window.Notification : undefined);
  const isNotificationDenied = notification?.permission === "denied";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setNotificationBannerDismissed(window.sessionStorage.getItem(NOTIFICATION_DENIED_BANNER_DISMISSED_KEY) === "1");
  }, []);

  function dismissNotificationBanner() {
    setNotificationBannerDismissed(true);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(NOTIFICATION_DENIED_BANNER_DISMISSED_KEY, "1");
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-6 pb-4 pt-2">
      {isNotificationDenied && !notificationBannerDismissed ? (
        <Banner title="알림이 꺼져 있어요." onDismiss={dismissNotificationBanner}>
          <div className="space-y-2">
            <p>놓치지 않도록 설정에서 알림을 켜주세요.</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setNotificationGuideVisible((visible) => !visible)}
              aria-expanded={notificationGuideVisible}
            >
              설정에서 켜기
            </Button>
            {notificationGuideVisible ? (
              <p className="text-sm text-muted" data-testid="notification-denied-guide">
                브라우저 설정 → 사이트 권한 → 알림에서 쉼일지를 허용으로 바꿔주세요.
              </p>
            ) : null}
          </div>
        </Banner>
      ) : null}

      {guestBannerVisible ? (
        <Banner title="게스트 모드" onDismiss={() => setGuestBannerVisible(false)}>
          로그인 없이도 바로 시작할 수 있어요.
        </Banner>
      ) : null}

      <header className="space-y-3 mc-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">쉼일지</p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              안녕하세요, {effectiveName}
            </h1>
          </div>
          <Link
            href="/settings"
            aria-label="설정 열기"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border bg-surface text-surface-foreground shadow-sm transition-colors hover:bg-muted/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </Link>
        </div>

        <div className="space-y-1">
          {firstLaunch ? <p className="text-sm text-muted">오늘의 첫 쉼을 시작해보세요</p> : null}
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-5">
        <article
          aria-label={`오늘 ${effectiveCount}회 완료, ${targetCount}회 목표`}
          className="rounded-[28px] border bg-surface px-6 py-5 shadow-sm mc-fade-in-1"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-sm text-muted">오늘의 진행</p>
              <p className="text-2xl font-semibold tracking-tight">
                오늘 {effectiveCount}/{targetCount}
              </p>
            </div>
            <ProgressDots count={effectiveCount} target={targetCount} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{nextSlotText}</p>
        </article>

        <div className="mc-fade-in-2 flex items-stretch gap-3">
          <div
            className="flex flex-col gap-1 overflow-y-auto rounded-[24px] border bg-surface p-2 shadow-sm"
            role="radiogroup"
            aria-label="쉬는 시간 선택"
            style={{ maxHeight: "160px" }}
          >
            {ALL_DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={selectedDuration === d}
                onClick={() => setSelectedDuration(d as DurationPreset)}
                className={`shrink-0 rounded-xl px-3 py-2 text-sm font-medium tabular-nums transition-all duration-200 ${
                  selectedDuration === d
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted hover:bg-muted/10 hover:text-foreground"
                }`}
              >
                {d}분
              </button>
            ))}
          </div>

          <Button
            variant="primaryLarge"
            fullWidth
            aria-label="지금 쉼 시작하기"
            className="min-h-[160px] rounded-[28px] text-xl mc-float"
            onClick={() => {
              setLastUsedDuration(selectedDuration);
              router.push(`/rest?duration=${selectedDuration}`);
            }}
          >
            지금 {selectedDuration}분 쉬기
          </Button>
        </div>
      </div>

      {lastSession ? (
        <p className="pb-1 text-center text-sm text-muted mc-fade-in-3">
          마지막 쉼: {lastSession.relativeTime}
        </p>
      ) : null}
    </section>
  );
}
