import { Outlet, useRouterState } from "@tanstack/react-router";
import { BnbChainLockup } from "@/components/brand/bnb-chain-lockup";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { AppHeader } from "@/components/layout/app-header";
import { ToastProvider } from "@/components/ui";
import { InboxProvider } from "@/features/account/inbox";
import { WrongNetworkBanner } from "@/providers/wrong-network-banner";

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/lockups") {
    return <Outlet />;
  }

  return (
    <ToastProvider>
      <InboxProvider>
        <div className="flex min-h-screen flex-col">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-full focus:bg-accent focus:px-3 focus:py-2 focus:text-ink"
          >
            Skip to content
          </a>
          <AppHeader />
          <WrongNetworkBanner />
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-20 sm:px-6 sm:py-6 lg:pb-6">
            <Outlet />
          </main>
          <footer className="border-t border-line pb-16 lg:pb-0">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="lede">Building on</p>
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
          <AppBottomNav />
        </div>
      </InboxProvider>
    </ToastProvider>
  );
}
