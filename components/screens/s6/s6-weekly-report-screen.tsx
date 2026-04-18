"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { InfoCard } from "@/components/ui/info-card";
import { readStoredRestSessions } from "@/lib/db/rest-session-history";
import type { RestSessionRow } from "@/lib/db/types";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;
const DAY_NAMES = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"] as const;
const DAY_STATE_LABELS = {
  "●": "완료",
  "◐": "부분",
  "◌": "미완",
  "─": "예정",
} as const;

type SubscriptionTier = "free" | "premium";
type DayDot = keyof typeof DAY_STATE_LABELS;

interface S6WeeklyReportScreenProps {
  tier?: SubscriptionTier;
  monthlyTabActive?: boolean;
  sessions?: RestSessionRow[];
  now?: Date;
}

interface WeeklyReportViewModel {
  weekRangeLabel: string;
  dayDots: DayDot[];
  dayDotsAriaLabel: string;
  completedDays: number;
  avgClarityLabel: string;
  bestSessionLabel: string | null;
  bestSessionClarityLabel: string | null;
  aiComment: string;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, offset));
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatWeekRangeLabel(weekStart: Date, weekEnd: Date) {
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}~${weekEnd.getDate()}일 (이번 주)`;
  }

  return `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일~${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일 (이번 주)`;
}

function formatAverageClarity(value: number | null) {
  if (value === null) {
    return "아직 기록 없음";
  }

  const rounded = Math.round(value * 10) / 10;
  const whole = Math.floor(rounded);
  const decimal = Math.round((rounded - whole) * 10);
  const suns = "☀︎".repeat(Math.max(whole, 1));

  return decimal === 0 ? suns : `${suns}.${decimal}`;
}

function formatSessionLabel(session: RestSessionRow) {
  const date = new Date(session.started_at);
  const weekdayIndex = (date.getDay() + 6) % 7;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${DAY_NAMES[weekdayIndex]} ${hours}:${minutes}`;
}

function formatBestSessionClarity(clarity: number | null) {
  if (!clarity) {
    return null;
  }

  return `${"☀︎".repeat(clarity)} 최고 기록`;
}

function buildAiComment(options: {
  totalSessions: number;
  completedDays: number;
  avgClarity: number | null;
}) {
  const { totalSessions, completedDays, avgClarity } = options;

  if (totalSessions === 0) {
    return "이번 주 기록이 아직 없어요. 첫 멍때림을 시작해보세요.";
  }

  if (completedDays >= 5) {
    return "이번 주는 꾸준히 멍때리고 있어요. 지금의 리듬을 이어가 보세요.";
  }

  if ((avgClarity ?? 0) >= 4) {
    return "맑았던 순간이 분명 있었어요. 그 시간대를 다음 멍때림의 기준으로 삼아보세요.";
  }

  if (completedDays >= 1) {
    return "멍때림의 흐름이 조금씩 쌓이고 있어요. 짧게라도 한 번 더 이어가 볼까요?";
  }

  return "이번 주 기록을 바탕으로 리포트가 차분히 채워지고 있어요.";
}

export function deriveWeeklyReportViewModel(sessions: RestSessionRow[], now: Date): WeeklyReportViewModel {
  const today = startOfDay(now);
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 6);
  const weekSessions = sessions.filter((session) => {
    const startedAt = new Date(session.started_at);
    return startedAt >= weekStart && startedAt < addDays(weekEnd, 1);
  });
  const completedSessions = weekSessions.filter((session) => session.completed);
  const claritySessions = weekSessions.filter((session): session is RestSessionRow & { clarity: number } => session.clarity !== null);
  const avgClarity =
    claritySessions.length > 0
      ? claritySessions.reduce((sum, session) => sum + session.clarity, 0) / claritySessions.length
      : null;
  const bestSession = [...claritySessions].sort((left, right) => {
    if (right.clarity !== left.clarity) {
      return right.clarity - left.clarity;
    }

    return new Date(right.started_at).getTime() - new Date(left.started_at).getTime();
  })[0] ?? null;

  const dayDots = DAY_LABELS.map((_, index) => {
    const dayDate = addDays(weekStart, index);

    if (dayDate > today) {
      return "─";
    }

    const completedCount = completedSessions.filter((session) => isSameDay(new Date(session.started_at), dayDate)).length;

    if (completedCount >= 3) {
      return "●";
    }

    if (completedCount >= 1) {
      return "◐";
    }

    return "◌";
  }) as DayDot[];

  const completedDays = dayDots.filter((dot) => dot === "●").length;
  const dayDotsAriaLabel = dayDots
    .map((dot, index) => `${DAY_NAMES[index]} ${DAY_STATE_LABELS[dot]}`)
    .join(", ");

  return {
    weekRangeLabel: formatWeekRangeLabel(weekStart, weekEnd),
    dayDots,
    dayDotsAriaLabel,
    completedDays,
    avgClarityLabel: formatAverageClarity(avgClarity),
    bestSessionLabel: bestSession ? formatSessionLabel(bestSession) : null,
    bestSessionClarityLabel: bestSession ? formatBestSessionClarity(bestSession.clarity) : null,
    aiComment: buildAiComment({
      totalSessions: weekSessions.length,
      completedDays,
      avgClarity,
    }),
  };
}

export function S6WeeklyReportScreen({
  tier = "free",
  monthlyTabActive = false,
  sessions,
  now,
}: S6WeeklyReportScreenProps) {
  const [storedSessions, setStoredSessions] = useState<RestSessionRow[]>(sessions ?? []);

  useEffect(() => {
    if (sessions) {
      return;
    }

    if (typeof window === "undefined" || typeof window.localStorage?.getItem !== "function") {
      return;
    }

    setStoredSessions(readStoredRestSessions());
  }, [sessions]);

  const model = useMemo(
    () => deriveWeeklyReportViewModel(sessions ?? storedSessions, now ?? new Date()),
    [now, sessions, storedSessions],
  );

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">쉼일지</p>
          <h1 className="text-3xl font-semibold tracking-tight">주간 리포트</h1>
        </div>
        <Link
          href={tier === "premium" ? "/report?view=monthly" : "/paywall?source=weekly_monthly_tab"}
          className="inline-flex min-h-11 items-center justify-center rounded-full border bg-surface px-5 text-sm font-medium text-surface-foreground shadow-sm transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
        >
          월간
        </Link>
      </header>

      {tier === "premium" && monthlyTabActive ? (
        <InfoCard title="월간 리포트" description="프리미엄 전용 월간 그래프 자리입니다.">
          <div className="space-y-3 text-sm text-muted">
            <p>월간 그래프와 4주 비교가 이 영역에 표시됩니다.</p>
            <p>현재는 premium 분기 자리만 먼저 연결했습니다.</p>
          </div>
        </InfoCard>
      ) : null}

      <InfoCard title={model.weekRangeLabel} description="이번 주 멍때린 흐름을 돌아봐요.">
        <div className="space-y-5">
          <div className="space-y-3" aria-label="주간 도트 요약">
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted" aria-hidden="true">
              {DAY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center" aria-label={model.dayDotsAriaLabel}>
              {model.dayDots.map((dot, index) => (
                <div key={`${DAY_LABELS[index]}-${dot}`} className="flex flex-col items-center gap-1">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                      dot === "●"
                        ? "bg-foreground text-background"
                        : dot === "◐"
                        ? "bg-foreground/50 text-background"
                        : dot === "◌"
                        ? "bg-muted/30 border text-muted"
                        : "bg-transparent border border-dashed border-muted/40 text-muted"
                    }`}
                    title={`${DAY_LABELS[index]}요일`}
                  >
                    {""}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-foreground" /> 완료</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-foreground/50" /> 부분</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-muted/30 border" /> 미완</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full border border-dashed border-muted/40" /> 예정</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-background p-5">
              <p className="text-sm text-muted">완료한 날</p>
              <p className="mt-2 text-lg font-semibold tracking-tight">{model.completedDays}일</p>
            </div>

            <div className="rounded-xl bg-background p-5">
              <p className="text-sm text-muted">평균 맑기</p>
              <p className="mt-2 text-lg font-semibold tracking-tight">{model.avgClarityLabel}</p>
            </div>
          </div>

          {model.bestSessionLabel ? (
            <article className="rounded-xl bg-background p-5">
              <p className="text-sm text-muted">가장 맑았을 때</p>
              <p className="mt-2 text-lg font-semibold tracking-tight">{model.bestSessionLabel}</p>
              {model.bestSessionClarityLabel ? (
                <p className="mt-1 text-sm text-muted">{model.bestSessionClarityLabel}</p>
              ) : null}
            </article>
          ) : (
            <article className="rounded-xl bg-background p-5">
              <p className="text-sm text-muted">가장 맑았을 때</p>
              <p className="mt-2 text-sm text-muted">이번 주 기록이 쌓이면 가장 맑았던 순간을 보여드릴게요.</p>
            </article>
          )}
        </div>
      </InfoCard>

      <InfoCard title="AI 코멘트" aria-label={`AI 코멘트: ${model.aiComment}`}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-base" aria-hidden="true">💬</span>
          <p className="text-sm leading-6 text-muted">{model.aiComment}</p>
        </div>
      </InfoCard>
    </section>
  );
}
