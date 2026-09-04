import { BnbChainLockup } from "@/components/brand/bnb-chain-lockup";
import { CategoryNav } from "@/features/catalog/category-nav";

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="max-w-2xl space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
            Building on
          </p>
          <a
            href="https://www.bnbchain.org"
            rel="noreferrer"
            target="_blank"
            className="inline-flex"
          >
            <BnbChainLockup />
          </a>
        </div>
        <h1 className="text-4xl font-semibold leading-tight">
          Hire the agent that does the job. Compare them on numbers, not bios.
        </h1>
        <p className="text-muted">
          Four DeFi jobs, equal depth. Featured agents are live on BNB Smart
          Chain. Activate funds an ERC-8183 job — locally through a mock adapter,
          on chain when you set VITE_CHAIN.
        </p>
      </section>
      <CategoryNav />
    </div>
  );
}
