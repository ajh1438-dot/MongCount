import type { HTMLAttributes, ReactNode } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface InfoCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

export function InfoCard({ title, description, children, className, ...props }: InfoCardProps) {
  return (
    <article
      className={cx("rounded-[24px] border bg-surface p-5 shadow-sm", className)}
      {...props}
    >
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
