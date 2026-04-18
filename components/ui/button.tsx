import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "primaryLarge" | "secondary" | "tertiary" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const baseClassName =
  "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-60";

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  primaryLarge:
    "min-h-[100px] rounded-xl bg-primary px-6 text-lg font-semibold text-primary-foreground shadow-sm hover:opacity-95",
  secondary:
    "border border-border bg-surface text-surface-foreground hover:bg-black/5 dark:hover:bg-white/10",
  tertiary: "bg-transparent px-2 text-muted underline underline-offset-4 hover:text-foreground",
  danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      data-variant={variant}
      type={type}
      className={cx(baseClassName, variantClassName[variant], fullWidth && "w-full", className)}
      {...props}
    />
  );
}
