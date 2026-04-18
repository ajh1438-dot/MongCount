"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface S2RestTimerScreenProps {
  durationMinutes: number;
  mode: "running" | "readonly";
}

interface PersistedRestSession {
  durationMinutes: number;
  startedAtMs: number;
}

const ACTIVE_SESSION_STORAGE_KEY = "mongcount.s2.activeSession";

function formatTimer(totalSeconds: number) {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function readPersistedRestSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedRestSession>;

    if (
      typeof parsed.durationMinutes !== "number" ||
      !Number.isFinite(parsed.durationMinutes) ||
      typeof parsed.startedAtMs !== "number" ||
      !Number.isFinite(parsed.startedAtMs)
    ) {
      return null;
    }

    return {
      durationMinutes: Math.max(0, Math.floor(parsed.durationMinutes)),
      startedAtMs: Math.max(0, Math.floor(parsed.startedAtMs)),
    } satisfies PersistedRestSession;
  } catch {
    return null;
  }
}

function writePersistedRestSession(session: PersistedRestSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearPersistedRestSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
}

function calculateRemainingSeconds(session: PersistedRestSession) {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - session.startedAtMs) / 1000));
  return Math.max(0, session.durationMinutes * 60 - elapsedSeconds);
}

function buildRestReviewHref({
  durationMinutes,
  fromAbort = false,
  startedAtMs,
}: {
  durationMinutes: number;
  fromAbort?: boolean;
  startedAtMs?: number;
}) {
  const params = new URLSearchParams();
  params.set("duration", String(durationMinutes));

  if (fromAbort) {
    params.set("from_abort", "true");
  }

  if (typeof startedAtMs === "number" && Number.isFinite(startedAtMs)) {
    params.set("started_at", new Date(startedAtMs).toISOString());
    params.set("session_id", `session-${Math.floor(startedAtMs)}`);
  }

  return `/rest/review?${params.toString()}`;
}

export function S2RestTimerScreen({ durationMinutes, mode }: S2RestTimerScreenProps) {
  const totalSeconds = Math.max(0, Math.floor(durationMinutes) * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [activeSession, setActiveSession] = useState<PersistedRestSession | null>(null);
  const [isAbortConfirmVisible, setIsAbortConfirmVisible] = useState(false);
  const completionHandledRef = useRef(false);

  useEffect(() => {
    if (mode !== "running") {
      setActiveSession(null);
      setRemainingSeconds(totalSeconds);
      completionHandledRef.current = false;
      return;
    }

    const persistedSession = readPersistedRestSession();
    const nextSession =
      persistedSession && persistedSession.durationMinutes === durationMinutes
        ? persistedSession
        : {
            durationMinutes,
            startedAtMs: Date.now(),
          };

    writePersistedRestSession(nextSession);
    setActiveSession(nextSession);
    setRemainingSeconds(calculateRemainingSeconds(nextSession));
    completionHandledRef.current = false;
  }, [durationMinutes, mode, totalSeconds]);

  useEffect(() => {
    if (mode !== "running" || !activeSession) {
      return;
    }

    const syncRemainingSeconds = () => {
      const nextRemainingSeconds = calculateRemainingSeconds(activeSession);
      setRemainingSeconds((current) => (current === nextRemainingSeconds ? current : nextRemainingSeconds));
    };

    const handleVisibilityChange = () => {
      syncRemainingSeconds();
    };

    const intervalId = window.setInterval(syncRemainingSeconds, 250);

    syncRemainingSeconds();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [activeSession, mode]);

  useEffect(() => {
    if (mode !== "running" || remainingSeconds > 0 || completionHandledRef.current) {
      return;
    }

    completionHandledRef.current = true;
    const startedAtMs = activeSession?.startedAtMs;
    clearPersistedRestSession();
    window.location.assign(buildRestReviewHref({ durationMinutes, startedAtMs }));
  }, [activeSession, durationMinutes, mode, remainingSeconds]);

  const progressRatio = useMemo(() => {
    if (totalSeconds <= 0) {
      return 1;
    }

    return mode === "readonly" ? 0.66 : (totalSeconds - remainingSeconds) / totalSeconds;
  }, [mode, remainingSeconds, totalSeconds]);

  function handleAbortRequest() {
    setIsAbortConfirmVisible(true);
  }

  function handleContinueRest() {
    setIsAbortConfirmVisible(false);
  }

  function handleAbortConfirm() {
    const startedAtMs = activeSession?.startedAtMs;
    clearPersistedRestSession();
    setIsAbortConfirmVisible(false);
    window.location.assign(buildRestReviewHref({ durationMinutes, fromAbort: true, startedAtMs }));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-10">
      <section className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">멍때리는 중</p>
        <p className="text-8xl font-light tracking-wider tabular-nums" aria-live="polite" data-testid="timer-display">
          {formatTimer(mode === "readonly" ? totalSeconds : remainingSeconds)}
        </p>
        <div className="w-full space-y-3 pt-2">
          <p className="text-sm text-muted">생각이 떠오르면 흘려보내세요. 끝나고 적으면 돼요.</p>
          <div className="h-1 w-full rounded-full bg-muted/20" aria-hidden="true">
            <div
              className="h-full rounded-full bg-foreground/70 transition-[width] duration-300"
              data-testid="timer-progress"
              style={{ width: `${Math.max(0, Math.min(100, Math.round(progressRatio * 100)))}%` }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-center text-sm text-muted" data-testid="rest-duration">
          {durationMinutes}분 멍때림
        </p>

        {mode === "readonly" ? (
          <>
            <p className="text-center text-sm text-muted" data-testid="readonly-mode">
              읽기 전용 모드예요
            </p>
            <Link
              href="/archive"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg px-2 text-sm text-muted underline underline-offset-4 transition-colors hover:text-foreground"
            >
              뒤로 가기
            </Link>
          </>
        ) : (
          <div className="space-y-3">
            {isAbortConfirmVisible ? (
              <section
                className="space-y-3 rounded-[24px] border bg-surface p-5 text-center shadow-sm"
                data-testid="abort-confirm-card"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">멍 그만때릴까요?</p>
                  <p className="text-sm text-muted">조금 더 있어도 돼요. 그만하면 여기까지 기록돼요.</p>
                </div>
                <div className="space-y-2">
                  <Button fullWidth variant="secondary" onClick={handleContinueRest}>
                    계속 멍때리기
                  </Button>
                  <Button fullWidth onClick={handleAbortConfirm}>
                    여기까지 하고 기록
                  </Button>
                </div>
              </section>
            ) : null}
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg px-2 text-sm text-muted underline underline-offset-4 transition-colors hover:text-foreground"
              onClick={handleAbortRequest}
            >
              멍때림 중단
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
