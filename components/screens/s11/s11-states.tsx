import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InfoCard } from "@/components/ui/info-card";

interface EmptyArchiveStateProps {
  startHref?: string;
}

interface NetworkErrorStateProps {
  lastSyncedRelativeTime?: string;
  onRetry?: () => void;
}

export function EmptyArchiveState({ startHref = "/rest?duration=3" }: EmptyArchiveStateProps) {
  return (
    <InfoCard
      title="아직 기록이 없어요."
      description="첫 멍때림을 시작해보세요."
      className="rounded-[24px] text-center"
      data-testid="empty-archive-state"
    >
      <div className="space-y-4">
        <div aria-hidden="true" className="text-4xl leading-none text-muted/70">
          🌱
        </div>
        <Link
          href={startHref}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          지금 멍때리기 →
        </Link>
      </div>
    </InfoCard>
  );
}

export function NetworkErrorState({
  lastSyncedRelativeTime = "방금 전",
  onRetry,
}: NetworkErrorStateProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="rounded-[24px] border bg-surface px-5 py-6 shadow-sm"
      data-testid="network-error-state"
    >
      <div className="space-y-4 text-center">
        <div aria-hidden="true" className="text-3xl leading-none">
          🌤️
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">인터넷 연결이 불안정해요</h2>
          <p className="text-sm text-muted">잠시 후 다시 시도해 주세요.</p>
          <p className="text-xs text-muted">
            마지막 동기화: {lastSyncedRelativeTime}
          </p>
        </div>
        <Button onClick={onRetry}>다시 시도</Button>
      </div>
    </section>
  );
}
