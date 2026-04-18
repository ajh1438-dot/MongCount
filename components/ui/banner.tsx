import type { HTMLAttributes, ReactNode } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  children: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export function Banner({
  title,
  children,
  onDismiss,
  dismissLabel = "배너 닫기",
  className,
  ...props
}: BannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        "flex items-start gap-3 rounded-[24px] border bg-surface p-4 text-sm text-surface-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="text-sm font-semibold tracking-tight">{title}</p> : null}
        <div className="text-sm text-muted">{children}</div>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border bg-surface text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          닫기
        </button>
      ) : null}
    </div>
  );
}
