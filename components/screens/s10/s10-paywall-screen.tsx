import Link from "next/link";

import { InfoCard } from "@/components/ui/info-card";

const OUTCOMES = [
  "멍때림 기록을 7일 이상 보관하세요",
  "월간 패턴을 한 번에 보세요",
  "기기를 바꿔도 이어보세요",
  "음성·사진으로 더 풍부하게 남기세요",
  "CSV·Notion으로 아카이브를 꺼내세요",
] as const;

interface S10PaywallScreenProps {
  source?: string;
}

const SOURCE_COPY: Record<string, { headline: string; sub: string }> = {
  archive_boundary: {
    headline: "멍때림 기록을 더 오래 간직하세요",
    sub: "프리미엄에서 7일 이상의 아카이브를 자유롭게 돌아보세요",
  },
  weekly_monthly_tab: {
    headline: "월간 패턴을 한 번에 보세요",
    sub: "주간을 넘어 월간 단위로 멍때림의 흐름을 살펴보세요",
  },
  settings: {
    headline: "모든 기기를 이어 보세요",
    sub: "프리미엄에서 기기 간 동기화와 전체 기능을 사용하세요",
  },
};

const DEFAULT_COPY = {
  headline: "프리미엄 업그레이드",
  sub: "멍때리기 습관, 더 오래 기록하세요",
};

function getLaterHref(source?: string) {
  if (source === "weekly_monthly_tab") {
    return "/report";
  }

  if (source === "archive_boundary") {
    return "/archive";
  }

  if (source === "settings") {
    return "/settings";
  }

  return "/";
}

export function S10PaywallScreen({ source }: S10PaywallScreenProps) {
  const copy = (source && SOURCE_COPY[source]) || DEFAULT_COPY;

  return (
    <section className="mx-auto min-h-screen w-full max-w-md flex flex-col justify-between px-6 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">쉼일지</p>
          <Link
            href={getLaterHref(source)}
            aria-label="닫기"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </Link>
        </div>

        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{copy.headline}</h1>
          <p className="text-base text-foreground">{copy.sub}</p>
        </header>

        <InfoCard aria-label="프리미엄에서 가능한 일" title="프리미엄에서 가능한 일" className="rounded-[24px]">
          <ul className="space-y-3 text-sm text-foreground">
            {OUTCOMES.map((outcome) => (
              <li key={outcome} className="flex items-start gap-3">
                <span aria-hidden="true" className="pt-0.5 text-primary">
                  ✓
                </span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard title="가격" className="rounded-[24px]">
          <div className="space-y-3 text-sm text-foreground">
            <p className="font-medium text-sm">월 ₩2,900</p>
            <div className="flex items-baseline gap-2">
              <p className="font-semibold text-base">연 ₩28,900 (월 ₩2,408)</p>
              <span className="text-xs text-primary">(17% 할인)</span>
            </div>
            <p className="text-muted">언제든 해지 가능</p>
          </div>
        </InfoCard>
      </div>

      <div className="space-y-3 pt-8">
        <button
          type="button"
          disabled
          aria-label="곧 만나요 — 알림을 받으세요"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm opacity-60 cursor-not-allowed"
        >
          곧 만나요 — 알림을 받으세요
        </button>
        <Link
          href={getLaterHref(source)}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border bg-surface px-4 py-3 text-sm font-medium text-surface-foreground"
        >
          나중에
        </Link>
      </div>
    </section>
  );
}
