import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  className,
  variant = "primary",
  loading = false,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        "inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium",
        "transition-colors duration-150 touch-manipulation",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-accent text-ink hover:bg-[#d4a40a] active:bg-[#c49609]",
        variant === "secondary" &&
          "border border-line bg-transparent text-paper hover:border-accent/60 hover:bg-ink-2",
        variant === "ghost" && "border border-line bg-transparent text-paper hover:bg-ink-2",
        variant === "danger" && "bg-danger text-paper hover:opacity-90",
        className,
      )}
      {...props}
    >
      {loading ? <Icon icon={Loader2} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
  ...props
}: {
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-line bg-ink-2 p-3.5 sm:p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "accent" | "ok" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide",
        tone === "muted" && "border-line text-muted",
        tone === "accent" && "border-accent/40 text-accent",
        tone === "ok" && "border-ok/40 text-ok",
        tone === "danger" && "border-danger/40 text-danger",
        className,
      )}
    >
      {children}
    </span>
  );
}
