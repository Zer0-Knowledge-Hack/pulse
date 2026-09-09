import { Link, getRouteApi } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Search, Wallet } from "lucide-react";
import { BnbChainLockup } from "@/components/brand/bnb-chain-lockup";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { Lede, PageTitle, SectionTitle } from "@/components/ui/heading";
import { CategoryNav } from "@/features/catalog/category-nav";
import { Marketplace } from "@/features/catalog/marketplace";
import { PromoBanner } from "@/features/catalog/promo-banner";
import { useCatalog } from "@/features/catalog/use-catalog";

const homeRoute = getRouteApi("/");

export function HomePage() {
  const { q } = homeRoute.useSearch();
  const catalog = useCatalog();

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="meta">Building on</p>
          <a href="https://www.bnbchain.org" rel="noreferrer" target="_blank" className="inline-flex">
            <BnbChainLockup />
          </a>
        </div>
        <PageTitle className="max-w-2xl">
          Hire the agent that does the job. Compare them on numbers, not bios.
        </PageTitle>
        <Lede className="max-w-xl">
          Four DeFi jobs, equal depth. Featured agents are live on BNB Smart Chain. Activate funds
          an ERC-8183 job.
        </Lede>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a href="#marketplace">
            <Button className="w-full sm:w-auto">
              Browse agents
              <Icon icon={ArrowRight} />
            </Button>
          </a>
          <Link to="/browse/$category" params={{ category: "health_factor" }}>
            <Button variant="secondary" className="w-full sm:w-auto">
              Health factor
            </Button>
          </Link>
        </div>
      </section>

      <PromoBanner agents={catalog.agents} />

      <section aria-labelledby="how-heading" className="space-y-3">
        <SectionTitle id="how-heading">How hiring works</SectionTitle>
        <ol className="grid gap-2 sm:grid-cols-3">
          <Step icon={Search} title="Pick a job" body="Health factor, rebalancing, grid trading, or yield." />
          <Step icon={BarChart3} title="Compare the signal" body="Read live numbers, then open the agent you trust." />
          <Step icon={Wallet} title="Confirm and fund" body="Set task and $U budget, review, then hire." />
        </ol>
      </section>

      <section className="space-y-3">
        <SectionTitle>Jobs</SectionTitle>
        <CategoryNav />
      </section>

      <section id="marketplace" className="scroll-mt-20 space-y-3">
        <div>
          <SectionTitle>Marketplace</SectionTitle>
          <Lede>Featured live agents first. Search, filter, then hire.</Lede>
        </div>
        <Marketplace
          agents={catalog.agents}
          signals={catalog.signals}
          status={catalog.status}
          onRetry={catalog.retry}
          initialSearch={q ?? ""}
        />
      </section>
    </div>
  );
}

function Step({
  icon,
  title,
  body,
}: {
  icon: typeof Search;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-2xl border border-line bg-ink-2 p-3">
      <div className="flex items-center gap-2">
        <span className="icon-well">
          <Icon icon={icon} />
        </span>
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="lede mt-1.5">{body}</p>
    </li>
  );
}
