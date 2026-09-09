import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CircleAlert, Info, Wallet, TriangleAlert, Zap } from "lucide-react";
import { Badge, Button, EmptyState } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useInbox } from "@/features/account/inbox";
import { formatDateTime } from "@/lib/format";
import type { Notice, NoticeKind } from "@/lib/inbox";

function noticeIcon(kind: NoticeKind) {
  if (kind === "hire_success") return Zap;
  if (kind === "hire_failed" || kind === "error") return CircleAlert;
  if (kind === "warning" || kind === "tx_pending") return TriangleAlert;
  if (kind === "wallet_connected" || kind === "wallet_disconnected") return Wallet;
  if (kind === "agent_update") return Info;
  return Bell;
}

export function NoticeList({ compact = false }: { compact?: boolean }) {
  const { notices, markRead, markAllRead } = useInbox();
  const unread = notices.filter((item) => !item.read);
  const read = notices.filter((item) => item.read);
  const rows = compact ? notices.slice(0, 5) : notices;

  if (notices.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        icon={
          <span className="icon-well">
            <Icon icon={Bell} />
          </span>
        }
      >
        <p>Hires, wallet changes, and system events will show up here.</p>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      {!compact && unread.length > 0 ? (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={markAllRead}>
            Mark all as read
          </Button>
        </div>
      ) : null}
      {compact ? (
        <ul className="space-y-2">
          {rows.map((item) => (
            <NoticeRow key={item.id} item={item} onRead={() => markRead(item.id)} />
          ))}
        </ul>
      ) : (
        <>
          {unread.length > 0 ? (
            <section className="space-y-2">
              <p className="meta">Unread</p>
              {unread.map((item) => (
                <NoticeRow key={item.id} item={item} onRead={() => markRead(item.id)} />
              ))}
            </section>
          ) : null}
          {read.length > 0 ? (
            <section className="space-y-2">
              <p className="meta">Read</p>
              {read.map((item) => (
                <NoticeRow key={item.id} item={item} onRead={() => markRead(item.id)} />
              ))}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function NoticeRow({ item, onRead }: { item: Notice; onRead: () => void }) {
  const body = (
    <article className="flex gap-3 rounded-xl border border-line bg-ink-2 p-3">
      <span className="icon-well">
        <Icon icon={noticeIcon(item.kind)} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{item.title}</p>
          {!item.read ? <Badge tone="accent">New</Badge> : null}
        </div>
        <p className="lede mt-0.5">{item.description}</p>
        <p className="meta mt-1">{formatDateTime(item.createdAt)}</p>
      </div>
    </article>
  );

  return (
    <div>
      {item.href ? (
        <NoticeLink href={item.href} onRead={onRead}>
          {body}
        </NoticeLink>
      ) : (
        body
      )}
      {!item.read ? (
        <Button variant="ghost" className="mt-1 h-9 min-h-9 text-xs" onClick={onRead}>
          Mark as read
        </Button>
      ) : null}
    </div>
  );
}

function NoticeLink({
  href,
  onRead,
  children,
}: {
  href: string;
  onRead: () => void;
  children: ReactNode;
}) {
  const profile = href.startsWith("/profile");
  if (profile) {
    const tab = new URLSearchParams(href.split("?")[1] ?? "").get("tab") ?? "overview";
    return (
      <Link to="/profile" search={{ tab }} onClick={onRead} className="block">
        {children}
      </Link>
    );
  }
  const agent = href.match(/^\/agents\/([^/?#]+)/);
  if (agent?.[1]) {
    return (
      <Link to="/agents/$agentId" params={{ agentId: agent[1] }} onClick={onRead} className="block">
        {children}
      </Link>
    );
  }
  return (
    <a href={href} onClick={onRead} className="block">
      {children}
    </a>
  );
}
