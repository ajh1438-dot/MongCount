import type { HTMLAttributes, ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface CardCtaProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  actionLabel: ReactNode;
  actionVariant?: ButtonProps["variant"];
  onAction?: ButtonProps["onClick"];
  actionType?: ButtonProps["type"];
}

export function CardCta({
  title,
  description,
  actionLabel,
  actionVariant = "primary",
  onAction,
  actionType = "button",
  className,
  ...props
}: CardCtaProps) {
  return (
    <article
      className={cx("rounded-xl border bg-surface p-5 shadow-sm", className)}
      {...props}
    >
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      <div className="mt-4">
        <Button type={actionType} variant={actionVariant} fullWidth onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}
