import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Bell, UserRound } from "lucide-react";
import { CATEGORY_LABELS } from "@era/domain";
import { PulsePersistMark } from "@/components/brand/pulse-persist-mark";
import { PulseWordmark } from "@/components/brand/pulse-wordmark";
import { WalletGlyph } from "@/components/layout/wallet-glyph";
import { SearchInput } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useInbox } from "@/features/account/inbox";
import { CATEGORY_ICONS, CATEGORY_ORDER } from "@/features/catalog/category-meta";
import { cn } from "@/lib/cn";

export function AppHeader() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const searchQ = useRouterState({
    select: (s) => {
      const q = (s.location.search as { q?: string }).q;
      return typeof q === "string" ? q : "";
    },
  });
  const profileTab = useRouterState({
    select: (s) => {
      const tab = (s.location.search as { tab?: string }).tab;
      return typeof tab === "string" ? tab : "";
    },
  });
  const { unreadCount } = useInbox();
  const [query, setQuery] = useState(searchQ);

  useEffect(() => {
    setQuery(searchQ);
  }, [searchQ]);

  function submitSearch(value: string) {
    const q = value.trim() || undefined;
    const browse = path.match(/^\/browse\/([^/]+)/);
    const category = browse?.[1];
    if (category) {
      void navigate({ to: "/browse/$category", params: { category }, search: { q } });
    } else {
      void navigate({ to: "/", search: { q } });
    }
  }

  const onProfile = path.startsWith("/profile");
  const onNotifications = onProfile && profileTab === "notifications";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-1 px-2 sm:h-14 sm:gap-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center px-1 text-paper" aria-label="pulse home">
          <span className="sm:hidden">
            <PulsePersistMark kind="mark" className="h-8 w-auto" />
          </span>
          <span className="hidden sm:block">
            <PulseWordmark />
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 items-center gap-0.5 lg:flex">
          <NavLink to="/" active={path === "/"}>
            Marketplace
          </NavLink>
          {CATEGORY_ORDER.map((category) => (
            <Link
              key={category}
              to="/browse/$category"
              params={{ category }}
              aria-current={path === `/browse/${category}` ? "page" : undefined}
              className={navClass(path === `/browse/${category}`)}
            >
              <Icon icon={CATEGORY_ICONS[category]} className="size-3.5" />
              {CATEGORY_LABELS[category]}
            </Link>
          ))}
        </nav>

        <SearchInput
          id="header-search"
          value={query}
          onChange={setQuery}
          onSubmit={submitSearch}
          placeholder="Search agents…"
          className="min-w-0 flex-1 lg:max-w-xs"
        />

        <div className="ml-auto flex shrink-0 items-center">
          <Link
            to="/profile"
            search={{ tab: "notifications" }}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
            aria-current={onNotifications ? "page" : undefined}
            className={cn("header-icon hidden sm:inline-flex", onNotifications && "text-accent")}
          >
            <Icon icon={Bell} />
            {unreadCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent" aria-hidden />
            ) : null}
          </Link>
          <WalletGlyph className="lg:hidden" />
          <Link
            to="/profile"
            search={{ tab: "overview" }}
            aria-label="Profile"
            aria-current={onProfile && !onNotifications ? "page" : undefined}
            className={cn("header-icon lg:hidden", onProfile && !onNotifications && "text-accent")}
          >
            <Icon icon={UserRound} />
          </Link>
          <div className="hidden lg:block">
            <ConnectButton showBalance={false} accountStatus="full" chainStatus="icon" />
          </div>
        </div>
      </div>
    </header>
  );
}

function navClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm transition-colors",
    active ? "bg-ink-2 text-paper" : "text-muted hover:text-paper",
  );
}

function NavLink({ to, active, children }: { to: "/"; active: boolean; children: string }) {
  return (
    <Link to={to} className={navClass(active)}>
      {children}
    </Link>
  );
}
