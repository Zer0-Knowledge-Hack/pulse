import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, LayoutGrid, UserRound, Wallet } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useInbox } from "@/features/account/inbox";
import { cn } from "@/lib/cn";

export function AppBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const profileTab = useRouterState({
    select: (s) => {
      const tab = (s.location.search as { tab?: string }).tab;
      return typeof tab === "string" ? tab : "";
    },
  });
  const { unreadCount } = useInbox();
  const onProfile = path.startsWith("/profile");
  const onMarket = path === "/" || path.startsWith("/browse") || path.startsWith("/agents");

  return (
    <nav aria-label="App" className="bottom-nav lg:hidden">
      <ul className="mx-auto grid max-w-6xl grid-cols-4">
        <Item
          to="/"
          label="Market"
          icon={LayoutGrid}
          active={onMarket}
        />
        <Item
          to="/profile"
          search={{ tab: "wallet" }}
          label="Wallet"
          icon={Wallet}
          active={onProfile && profileTab === "wallet"}
        />
        <Item
          to="/profile"
          search={{ tab: "notifications" }}
          label="Alerts"
          icon={Bell}
          active={onProfile && profileTab === "notifications"}
          badge={unreadCount}
        />
        <Item
          to="/profile"
          search={{ tab: "overview" }}
          label="Profile"
          icon={UserRound}
          active={onProfile && profileTab !== "wallet" && profileTab !== "notifications"}
        />
      </ul>
    </nav>
  );
}

function Item({
  to,
  search,
  label,
  icon,
  active,
  badge = 0,
}: {
  to: "/" | "/profile";
  search?: { tab: string };
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
  badge?: number;
}) {
  return (
    <li>
      <Link
        to={to}
        search={search}
        aria-current={active ? "page" : undefined}
        aria-label={badge > 0 ? `${label}, ${badge} unread` : label}
        className={cn(
          "relative flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px]",
          active ? "text-accent" : "text-muted",
        )}
      >
        <span className="relative inline-flex">
          <Icon icon={icon} className="size-[1.15rem]" />
          {badge > 0 ? (
            <span className="absolute -top-0.5 -right-1 size-1.5 rounded-full bg-accent" aria-hidden />
          ) : null}
        </span>
        {label}
      </Link>
    </li>
  );
}
