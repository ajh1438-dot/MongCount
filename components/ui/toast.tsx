import type { HTMLAttributes, ReactNode } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  message: ReactNode;
}

export function Toast({ title, message, className, ...props }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        "rounded-xl border bg-surface px-4 py-3 text-sm text-surface-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {title ? <p className="font-medium tracking-tight">{title}</p> : null}
      <p className={cx("text-sm text-muted", title ? "mt-1" : undefined)}>{message}</p>
    </div>
  );
}
