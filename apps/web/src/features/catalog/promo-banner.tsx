import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Star, X } from "lucide-react";
import { CATEGORY_LABELS, type AgentListing } from "@era/domain";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { AgentAvatar } from "./agent-avatar";

const STORAGE_KEY = "pulse:promo:dismissed";

export function PromoBanner({ agents }: { agents: AgentListing[] }) {
  const [dismissed, setDismissed] = useState(true);
  const featured =
    agents.find((agent) => agent.featured && agent.live) ?? agents.find((agent) => agent.live);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed || !featured) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setDismissed(true);
  }

  return (
    <section
      aria-label="Featured agent"
      className="relative overflow-hidden rounded-2xl border border-accent/35 bg-ink-2"
    >
      <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
        <AgentAvatar name={featured.name} category={featured.category} />
        <div className="min-w-0 flex-1 pr-8 sm:pr-0">
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-accent">
            <Icon icon={Star} className="size-3.5" />
            Featured · {CATEGORY_LABELS[featured.category]}
          </p>
          <h2 className="section-title mt-1">{featured.name} is live on BSC</h2>
          <p className="lede mt-1 line-clamp-2">{featured.description}</p>
          <Link
            to="/agents/$agentId"
            params={{ agentId: featured.id }}
            hash="hire"
            className="mt-2.5 inline-flex"
          >
            <Button>
              Hire {featured.name}
              <Icon icon={ArrowRight} />
            </Button>
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss featured agent"
          className="absolute top-2 right-2 inline-flex size-9 items-center justify-center rounded-full text-muted hover:text-paper"
        >
          <Icon icon={X} />
        </button>
      </div>
    </section>
  );
}
