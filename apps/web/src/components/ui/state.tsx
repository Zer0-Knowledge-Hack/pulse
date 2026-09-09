import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Inbox, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { Icon } from "./icon";

type Tone = "muted" | "danger";

export function PageState({
  tone = "muted",
  title,
  children,
  action,
  className,
  icon,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  const glyph =
    icon ??
    (tone === "danger" ? (
      <Icon icon={AlertCircle} className="size-5 text-danger" />
    ) : (
      <Icon icon={Inbox} className="size-5 text-muted" />
    ));

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex flex-col items-start gap-2.5 rounded-2xl border border-line bg-ink-2 px-4 py-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {glyph}
        <p className={cn("meta", tone === "danger" ? "text-danger" : undefined)}>
          {tone === "danger" ? "Something broke" : "Status"}
        </p>
      </div>
      <h2 className="section-title">{title}</h2>
      {children ? <div className="lede">{children}</div> : null}
      {action}
    </div>
  );
}

export function LoadingState({ title = "Loading…" }: { title?: string }) {
  return (
    <PageState
      title={title}
      icon={<Icon icon={Loader2} className="size-5 animate-spin text-accent" />}
    >
      <p>This should only take a moment.</p>
    </PageState>
  );
}

export function EmptyState({
  title,
  children,
  action,
  icon,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <PageState title={title} icon={icon ?? <Icon icon={Search} className="size-5 text-muted" />} action={action}>
      {children}
    </PageState>
  );
}

export function ErrorState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <PageState tone="danger" title={title} action={action}>
      {children}
    </PageState>
  );
}

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-line", className)} />;
}

export function AgentSkeleton() {
  return <CardSkeleton />;
}

export function CardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-3 rounded-2xl border border-line bg-ink-2 p-4">
      <div className="flex items-start gap-3">
        <Bone className="size-10 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Bone className="h-3 w-24" />
          <Bone className="h-4 w-36" />
          <Bone className="h-3 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Bone className="h-9" />
        <Bone className="h-9" />
      </div>
      <div className="flex gap-2">
        <Bone className="h-10 flex-1 rounded-full" />
        <Bone className="h-10 flex-1 rounded-full" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <Bone className="h-28 rounded-2xl" />
        <Bone className="h-36 rounded-2xl" />
      </div>
      <Bone className="h-64 rounded-2xl" />
      <span className="sr-only">Loading the agent</span>
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div aria-hidden className="space-y-3 rounded-2xl border border-line bg-ink-2 p-4">
      <Bone className="h-4 w-24" />
      <div className="grid gap-2 sm:grid-cols-2">
        <Bone className="h-14" />
        <Bone className="h-14" />
        <Bone className="h-14" />
        <Bone className="h-14" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div aria-hidden className="space-y-2">
      <Bone className="h-3 w-20" />
      <Bone className="h-6 w-28" />
      <div className="relative h-44 overflow-hidden rounded-xl border border-line bg-ink sm:h-52">
        <div className="absolute inset-x-10 top-4 space-y-8">
          <Bone className="h-px w-full" />
          <Bone className="h-px w-full" />
          <Bone className="h-px w-full" />
          <Bone className="h-px w-full" />
        </div>
        <Bone className="absolute right-6 bottom-8 left-10 h-16 rounded-t-full opacity-70" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div aria-hidden className="space-y-3">
      <Bone className="h-8 w-40" />
      <Bone className="h-10 w-full rounded-full" />
      <WalletSkeleton />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div aria-hidden className="space-y-2">
      <Bone className="h-10 w-full" />
      <Bone className="h-10 w-full" />
      <Bone className="h-10 w-full" />
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div aria-hidden className="space-y-2">
      <Bone className="h-16 w-full rounded-xl" />
      <Bone className="h-16 w-full rounded-xl" />
    </div>
  );
}

export function ActivitySkeleton() {
  return <NotificationSkeleton />;
}

export function RouteErrorState(_props?: { error?: unknown }) {
  return (
    <ErrorState
      title="This page could not load"
      action={
        <Link to="/">
          <Button variant="ghost">Back to the marketplace</Button>
        </Link>
      }
    >
      <p>Something went wrong while rendering this screen. Start again from the marketplace.</p>
    </ErrorState>
  );
}

export function RouteNotFoundState() {
  return (
    <EmptyState
      title="Nothing lives at this address"
      action={
        <Link to="/">
          <Button variant="ghost">Back to the marketplace</Button>
        </Link>
      }
    >
      <p>Check the link, or start from the four categories on the home page.</p>
    </EmptyState>
  );
}
