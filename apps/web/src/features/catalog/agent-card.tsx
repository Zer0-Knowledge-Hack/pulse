import { Link } from "@tanstack/react-router";
import { ArrowRight, CircleCheck, Radio } from "lucide-react";
import { CATEGORY_LABELS, type AgentListing, type AgentSignal } from "@era/domain";
import { Badge, Button, Card } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { CategorySignal } from "@/features/signals/category-signal";
import { HireCTA } from "@/features/hire/hire-cta";
import { AgentAvatar } from "./agent-avatar";

export function AgentCard({
  agent,
  signal,
}: {
  agent: AgentListing;
  signal?: AgentSignal;
}) {
  return (
    <Card className="flex h-full flex-col gap-3 p-3.5 sm:p-4">
      <div className="flex items-start gap-3">
        <AgentAvatar name={agent.name} category={agent.category} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <Badge tone={agent.live ? "ok" : "muted"}>
              <Icon icon={Radio} className="mr-1 size-3" />
              {agent.live ? "Live" : "Offline"}
            </Badge>
            {agent.featured ? (
              <Badge tone="accent">
                <Icon icon={CircleCheck} className="mr-1 size-3" />
                Featured
              </Badge>
            ) : null}
            <Badge>{CATEGORY_LABELS[agent.category]}</Badge>
          </div>
          <h3 className="mt-1.5 text-sm font-semibold leading-snug break-words sm:text-base">
            {agent.name}
          </h3>
          <p className="lede mt-1 line-clamp-2">{agent.description}</p>
        </div>
      </div>

      {signal ? <CategorySignal signal={signal} compact /> : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted">
        {agent.commerce.x402 ? <Badge>x402</Badge> : <Badge>ERC-8183</Badge>}
        <span className="font-mono">{agent.chainId === 56 ? "BSC" : "BSC testnet"}</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link to="/agents/$agentId" params={{ agentId: agent.id }} className="min-w-0 flex-1">
          <Button variant="secondary" className="w-full">
            View details
            <Icon icon={ArrowRight} />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <HireCTA agent={agent} className="w-full" />
        </div>
      </div>
    </Card>
  );
}
