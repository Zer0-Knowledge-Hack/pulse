import { getRouteApi, Link } from "@tanstack/react-router";
import { Bell, Briefcase, History, Receipt, Settings, UserRound, Wallet } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { Lede, PageTitle, SectionTitle } from "@/components/ui/heading";
import { ActivityList } from "@/features/account/activity-list";
import { HireList } from "@/features/account/hire-list";
import { useInbox } from "@/features/account/inbox";
import { NoticeList } from "@/features/account/notice-list";
import { WalletCard } from "@/features/account/wallet-card";
import { cn } from "@/lib/cn";
import { chainStatusLabel } from "@/providers/network";
import { useAccount } from "wagmi";
import { formatAddress } from "@/lib/format";

const profileRoute = getRouteApi("/profile");

const TABS = [
  { id: "overview", label: "Profile", icon: UserRound },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "agents", label: "My Agents", icon: Briefcase },
  { id: "purchases", label: "Purchases", icon: Receipt },
  { id: "activity", label: "Activity", icon: History },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type ProfileTab = (typeof TABS)[number]["id"];

export function ProfilePage() {
  const { tab: raw } = profileRoute.useSearch();
  const tab = TABS.some((item) => item.id === raw) ? (raw as ProfileTab) : "overview";
  const { address, isConnected } = useAccount();
  const { unreadCount, hires } = useInbox();

  return (
    <div className="space-y-4">
      <div>
        <PageTitle>Account</PageTitle>
        <Lede className="mt-1">Wallet, hires, and notifications from this browser.</Lede>
      </div>

      <nav aria-label="Account" className="hide-scrollbar -mx-4 overflow-x-auto px-4">
        <ul className="flex gap-1.5">
          {TABS.map((item) => (
            <li key={item.id} className="shrink-0">
              <Link
                to="/profile"
                search={{ tab: item.id }}
                aria-current={tab === item.id ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm",
                  tab === item.id
                    ? "border-accent bg-accent/15 text-paper"
                    : "border-line text-muted hover:text-paper",
                )}
              >
                <Icon icon={item.icon} />
                {item.label}
                {item.id === "notifications" && unreadCount > 0 ? (
                  <span className="rounded-full bg-accent px-1.5 font-mono text-[10px] text-ink">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {tab === "overview" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="space-y-2 p-4">
            <SectionTitle>Profile</SectionTitle>
            <p className="text-sm">{isConnected ? "Connected buyer" : "Guest"}</p>
            <p className="lede">
              {address ? formatAddress(address) : "Connect a wallet when you hire on a live chain."}
            </p>
            <p className="meta">{chainStatusLabel()}</p>
          </Card>
          <Card className="space-y-2 p-4">
            <SectionTitle>Summary</SectionTitle>
            <p className="text-sm">{hires.length} recorded hire{hires.length === 1 ? "" : "s"}</p>
            <p className="lede">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</p>
            <Link to="/profile" search={{ tab: "wallet" }}>
              <Button variant="ghost" className="mt-1">Open wallet</Button>
            </Link>
          </Card>
          <div className="lg:col-span-2">
            <WalletCard />
          </div>
        </div>
      ) : null}

      {tab === "wallet" ? <WalletCard /> : null}
      {tab === "agents" ? <HireList variant="agents" /> : null}
      {tab === "purchases" ? <HireList variant="purchases" /> : null}
      {tab === "activity" ? <ActivityList /> : null}
      {tab === "notifications" ? <NoticeList /> : null}
      {tab === "settings" ? (
        <Card className="space-y-2 p-4">
          <SectionTitle>Settings</SectionTitle>
          <Lede>
            Commerce mode is {chainStatusLabel()}. Network and wallet stay in this browser; there is
            no server-side profile to edit.
          </Lede>
        </Card>
      ) : null}
    </div>
  );
}
