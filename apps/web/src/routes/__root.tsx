import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BnbChainLockup } from "@/components/brand/bnb-chain-lockup";
import { PulseWordmark } from "@/components/brand/pulse-wordmark";
import { chainStatusLabel } from "@/providers/network";
import { WrongNetworkBanner } from "@/providers/wrong-network-banner";

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/lockups") {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="overflow-visible text-paper">
            <PulseWordmark />
          </Link>
          <div className="flex items-center gap-3">
            <p className="hidden font-mono text-[11px] uppercase text-muted sm:block">
              {chainStatusLabel()}
            </p>
            <ConnectButton />
          </div>
        </div>
      </header>
      <WrongNetworkBanner />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3" style={{ paddingBlock: 16 }}>
            <p className="text-sm text-muted">Building on</p>
            <a
              href="https://www.bnbchain.org"
              rel="noreferrer"
              target="_blank"
              className="inline-flex"
            >
              <BnbChainLockup />
            </a>
          </div>
          <a
            href="https://www.bnbchain.org/en/brand-guidelines"
            rel="noreferrer"
            target="_blank"
            className="text-xs text-muted hover:text-paper"
          >
            BNB Chain brand guidelines
          </a>
        </div>
      </footer>
    </div>
  );
}
