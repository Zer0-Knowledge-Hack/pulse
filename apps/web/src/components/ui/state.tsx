import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { Button } from "./button";

type Tone = "muted" | "danger";

/**
 * One shared shape for the three moments a page has nothing to render:
 * loading, empty, and failed. Keeping them in one component is what stops
 * a route from silently rendering a heading over blank space.
 */
export function PageState({
  tone = "muted",
  title,
  children,
  action,
  className,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex flex-col items-start gap-3 rounded-md border border-line bg-ink-2 px-5 py-6",
        className,
      )}
    >
      <p
        className={cn(
          "font-mono text-[11px] uppercase tracking-wide",
          tone === "danger" ? "text-danger" : "text-muted",
        )}
      >
        {tone === "danger" ? "Something broke" : "Status"}
      </p>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children ? <div className="text-sm text-muted">{children}</div> : null}
      {action}
    </div>
  );
}

/** Placeholder that keeps the grid from collapsing while agents load. */
export function CardSkeleton() {
  return (
    <div
      aria-hidden
      className="h-40 animate-pulse rounded-md border border-line bg-ink-2"
    />
  );
}

/**
 * Router-level catch-all. Without this a thrown render error leaves the
 * viewer on a blank page with no way back to the demo.
 */
export function RouteErrorState({ error }: { error: unknown }) {
  const message =
    error instanceof Error ? error.message : "The page failed to render.";
  return (
    <PageState
      tone="danger"
      title="This page could not load"
      action={
        <Link to="/">
          <Button variant="ghost" type="button">
            Back to the marketplace
          </Button>
        </Link>
      }
    >
      <p className="font-mono text-xs break-all">{message}</p>
    </PageState>
  );
}

/** Router-level 404, including a mistyped category or agent id. */
export function RouteNotFoundState() {
  return (
    <PageState
      title="Nothing lives at this address"
      action={
        <Link to="/">
          <Button variant="ghost" type="button">
            Back to the marketplace
          </Button>
        </Link>
      }
    >
      <p>Check the link, or start from the four categories on the home page.</p>
    </PageState>
  );
}
