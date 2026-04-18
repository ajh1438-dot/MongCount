"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyArchiveState, NetworkErrorState } from "@/components/screens/s11/s11-states";
import { readStoredRestSessions } from "@/lib/db/rest-session-history";
import type { RestSessionRow } from "@/lib/db/types";

const FILTER_CHIPS = ["아침", "오후", "저녁", "☀︎3 이상"] as const;

type TimeFilter = "all" | "morning" | "afternoon" | "evening";

interface ArchiveGroup {
  label: string;
  date: string;
  sessions: RestSessionRow[];
}

function getDaysAgo(value: string) {
  const startedAt = new Date(value);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfDate = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate()).getTime();
  return Math.max(0, Math.floor((startOfToday - startOfDate) / 86400000));
}

function formatGroupLabel(daysAgo: number) {
  if (daysAgo === 0) {
    return "오늘";
  }

  if (daysAgo === 1) {
    return "어제";
  }

  return `${daysAgo}일 전`;
}

function formatGroupDate(value: string) {
  const date = new Date(value);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function resolveTimeFilter(value: string): Exclude<TimeFilter, "all"> {
  const hour = new Date(value).getHours();

  if (hour < 12) {
    return "morning";
  }

  if (hour < 18) {
    return "afternoon";
  }

  return "evening";
}

function clarityDots(clarity: number | null) {
  if (!clarity || clarity <= 0) {
    return "기록 없음";
  }

  return "☀︎".repeat(Math.max(1, Math.min(5, Math.floor(clarity))));
}

function previewNote(note: string | null) {
  const text = note?.trim() || "한 줄 기록 없음";
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}

function groupSessions(sessions: RestSessionRow[]): ArchiveGroup[] {
  const grouped = new Map<string, ArchiveGroup>();

  for (const session of sessions) {
    const daysAgo = getDaysAgo(session.started_at);
    const key = `${daysAgo}-${formatGroupDate(session.started_at)}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        label: formatGroupLabel(daysAgo),
        date: formatGroupDate(session.started_at),
        sessions: [],
      });
    }

    grouped.get(key)?.sessions.push(session);
  }

  return [...grouped.values()];
}

export default function ArchivePage() {
  const [sessions, setSessions] = useState<RestSessionRow[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [minimumClarity, setMinimumClarity] = useState<number | null>(null);

  function resetFilters() {
    setSearchOpen(false);
    setSearchQuery("");
    setTimeFilter("all");
    setMinimumClarity(null);
  }

  useEffect(() => {
    setSessions(readStoredRestSessions());
    setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "mongcount.rest-sessions") {
        setSessions(readStoredRestSessions());
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const recentSessions = useMemo(
    () => sessions.filter((session) => getDaysAgo(session.started_at) <= 6),
    [sessions],
  );
  const olderSessionCount = useMemo(
    () => sessions.filter((session) => getDaysAgo(session.started_at) > 6).length,
    [sessions],
  );

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim();

    return recentSessions.filter((session) => {
      if (timeFilter !== "all" && resolveTimeFilter(session.started_at) !== timeFilter) {
        return false;
      }

      if (minimumClarity !== null && (session.clarity ?? 0) < minimumClarity) {
        return false;
      }

      if (query.length > 0 && !previewNote(session.note).includes(query)) {
        return false;
      }

      return true;
    });
  }, [minimumClarity, recentSessions, searchQuery, timeFilter]);

  const groups = useMemo(() => groupSessions(filteredSessions), [filteredSessions]);
  const hasActiveFilters = searchQuery.trim().length > 0 || timeFilter !== "all" || minimumClarity !== null;
  const hasRecentSessions = recentSessions.length > 0;
  const showNoResultsState = hasRecentSessions && groups.length === 0;
  const showEmptyState = !hasRecentSessions;
  const lastSyncedRelativeTime = sessions.length > 0 ? `${formatGroupLabel(getDaysAgo(sessions[0].started_at))} ${formatTime(sessions[0].started_at)}` : "방금 전";

  return (
    <section className="flex flex-1 flex-col gap-5 pb-4 pt-1">
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">쉼일지</p>
            <h1 className="text-3xl font-semibold tracking-tight">아카이브</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="검색 열기"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border bg-surface text-surface-foreground shadow-sm"
              onClick={() => setSearchOpen((current) => !current)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </button>
          </div>
        </div>

        <p className="text-sm text-muted">최근 7일 쉼 기록을 날짜별로 조용히 돌아보세요.</p>

        {searchOpen ? (
          <label className="block rounded-xl border bg-surface px-4 py-3 text-sm text-muted">
            <span className="sr-only">기록 검색</span>
            <input
              aria-label="기록 검색"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              placeholder="한 줄 기록에서 키워드 찾기"
              value={searchQuery}
            />
          </label>
        ) : null}

        <div className="flex flex-wrap items-center gap-2" aria-label="빠른 필터">
          {FILTER_CHIPS.map((chip) => {
            const active =
              (chip === "아침" && timeFilter === "morning") ||
              (chip === "오후" && timeFilter === "afternoon") ||
              (chip === "저녁" && timeFilter === "evening") ||
              (chip === "☀︎3 이상" && minimumClarity === 3);

            return (
              <button
                key={chip}
                type="button"
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-xs transition-all duration-200 ${active ? "bg-foreground text-background" : "bg-surface text-muted"}`}
                onClick={() => {
                  if (chip === "☀︎3 이상") {
                    setMinimumClarity((current) => (current === 3 ? null : 3));
                    return;
                  }

                  const next = chip === "아침" ? "morning" : chip === "오후" ? "afternoon" : "evening";
                  setTimeFilter((current) => (current === next ? "all" : next));
                }}
              >
                {chip}
              </button>
            );
          })}

          {hasActiveFilters ? (
            <button
              type="button"
              className="rounded-full px-2 py-1.5 text-xs font-medium text-muted underline underline-offset-4"
              onClick={resetFilters}
            >
              필터 초기화
            </button>
          ) : null}
        </div>
      </header>

      {!isOnline ? <NetworkErrorState lastSyncedRelativeTime={lastSyncedRelativeTime} onRetry={() => window.location.reload()} /> : null}

      {showEmptyState ? (
        <section className="space-y-3">
          <EmptyArchiveState />
          <Link
            href="/paywall?source=archive_boundary"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border bg-surface px-4 py-3 text-sm font-medium text-surface-foreground shadow-sm"
          >
            프리미엄으로 무제한 저장
          </Link>
        </section>
      ) : showNoResultsState ? (
        <section
          className="space-y-4 rounded-[24px] border bg-surface px-5 py-6 text-center shadow-sm"
          data-testid="archive-no-results-state"
        >
          <div aria-hidden="true" className="text-4xl leading-none text-muted">
            ◌
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">조건에 맞는 기록이 없어요.</h2>
            <p className="text-sm text-muted">기록은 있지만 현재 조건에 맞는 결과가 없어요.</p>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border bg-surface px-4 py-3 text-sm font-medium text-surface-foreground shadow-sm"
            onClick={resetFilters}
          >
            필터 초기화
          </button>
        </section>
      ) : (
        <section className="flex flex-1 flex-col gap-4">
          {groups.map((group) => (
            <div key={`${group.label}-${group.date}`} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  {group.label} <span className="font-normal text-muted">({group.date})</span>
                </h2>
              </div>

              <div className="space-y-3">
                {group.sessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/rest?duration=${session.duration_preset}&mode=readonly&session_id=${session.id}`}
                    aria-label={`${group.date} ${formatTime(session.started_at)}, 맑음 레벨 ${session.clarity ?? 0}, 내용: ${previewNote(session.note)}`}
                    className="block rounded-[24px] border bg-surface px-4 py-4 shadow-sm transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-foreground">
                          {formatTime(session.started_at)}
                        </p>
                        <p className="text-sm text-foreground/80">{previewNote(session.note)}</p>
                        <p className="text-xs text-muted">{clarityDots(session.clarity)} · 타이머 {session.duration_preset}분</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-3 rounded-[24px] border bg-surface p-5 shadow-sm">
            {olderSessionCount > 0 ? (
              <p className="text-sm text-muted">8일 이전 기록 {olderSessionCount}건은 프리미엄에서 이어서 볼 수 있어요.</p>
            ) : (
              <p className="text-sm text-muted">모든 쉼 기록을 더 오래 간직하고 싶다면, 프리미엄을 열어보세요.</p>
            )}
            <Link
              href="/paywall?source=archive_boundary"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border bg-surface px-4 py-3 text-sm font-medium text-surface-foreground shadow-sm"
            >
              프리미엄 둘러보기
            </Link>
          </div>
        </section>
      )}
    </section>
  );
}
