import { Link } from "@tanstack/react-router";
import { Bell, Copy, History, Unplug, Wallet, Zap } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useInbox } from "@/features/account/inbox";
import { formatDateTime } from "@/lib/format";

export function ActivityList() {
  const { activity } = useInbox();

  if (activity.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        icon={
          <span className="icon-well">
            <Icon icon={History} />
          </span>
        }
      >
        <p>Hires, copies, and wallet events from this session will list here.</p>
      </EmptyState>
    );
  }

  return (
    <ol className="space-y-0">
      {activity.map((item, index) => (
        <li key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="icon-well">
              <Icon icon={iconFor(item.type)} />
            </span>
            {index < activity.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
          </div>
          <div className="min-w-0 pb-4">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="lede break-all">{item.description}</p>
            <p className="meta mt-1">
              {item.status ? `${item.status} · ` : ""}
              {formatDateTime(item.createdAt)}
            </p>
            {item.href?.startsWith("/agents/") ? (
              <Link
                to="/agents/$agentId"
                params={{ agentId: item.href.replace(/^\/agents\//, "").split("?")[0] ?? "" }}
                className="mt-1 inline-flex text-xs text-accent hover:underline"
              >
                Open agent
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function iconFor(type: string) {
  if (type === "hire") return Zap;
  if (type === "wallet") return Wallet;
  if (type === "copy") return Copy;
  if (type === "revoke") return Unplug;
  return Bell;
}
