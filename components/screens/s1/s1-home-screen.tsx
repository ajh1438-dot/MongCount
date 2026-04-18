"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { setLastUsedDuration, type DurationPreset } from "@/stores/s1-home-store";

type NotificationLike = { permission: NotificationPermission };

const MIN_DURATION = 1;
const MAX_DURATION = 20;

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

  const nextSlotText = nextSlotTime && nextSlotInMinutes !== null ? `다음 멍때림 ${nextSlotTime} · ${nextSlotLabel(nextSlotInMinutes)}` : "오늘 멍때리기 완료 ✨";
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
          {firstLaunch ? <p className="text-sm text-muted">오늘 아직 안 멍때렸어요</p> : null}
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-5">
        <article
          aria-label={`오늘 ${effectiveCount}회 완료, ${targetCount}회 목표`}
          className="rounded-[28px] border bg-surface px-6 py-5 shadow-sm mc-fade-in-1"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-sm text-muted">오늘의 멍때림</p>
              <p className="text-2xl font-semibold tracking-tight">
                오늘 {effectiveCount}/{targetCount}
              </p>
            </div>
            <ProgressDots count={effectiveCount} target={targetCount} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{nextSlotText}</p>
        </article>

        <div className="mc-fade-in-2 flex items-stretch gap-3">
          <div className="flex flex-col items-center justify-center gap-1 rounded-[24px] border bg-surface px-3 py-3 shadow-sm">
            <button
              type="button"
              aria-label="시간 늘리기"
              disabled={selectedDuration >= MAX_DURATION}
              onClick={() => setSelectedDuration(Math.min(MAX_DURATION, selectedDuration + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-muted/10 hover:text-foreground disabled:opacity-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </button>
            <span className="text-2xl font-semibold tabular-nums" aria-live="polite">{selectedDuration}<span className="text-base font-normal text-muted">분</span></span>
            <button
              type="button"
              aria-label="시간 줄이기"
              disabled={selectedDuration <= MIN_DURATION}
              onClick={() => setSelectedDuration(Math.max(MIN_DURATION, selectedDuration - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-muted/10 hover:text-foreground disabled:opacity-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>

          <Button
            variant="primaryLarge"
            fullWidth
            aria-label="지금 멍때리기"
            className="min-h-[140px] rounded-[28px] text-xl mc-float"
            onClick={() => {
              setLastUsedDuration(selectedDuration);
              router.push(`/rest?duration=${selectedDuration}`);
            }}
          >
            지금 {selectedDuration}분 멍때리기
          </Button>
        </div>
      </div>

      {lastSession ? (
        <p className="pb-1 text-center text-sm text-muted mc-fade-in-3">
          마지막 멍때림: {lastSession.relativeTime}
        </p>
      ) : null}
    </section>
  );
}
