import { Link } from "@tanstack/react-router";
import type { AgentListing, AgentSignal } from "@era/domain";
import { Badge, Card } from "@/components/ui";
import { CategorySignal } from "@/features/signals/category-signal";
import { HireCTA } from "@/features/hire/hire-cta";

export function AgentCard({
  agent,
  signal,
}: {
  agent: AgentListing;
  signal?: AgentSignal;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge>{agent.live ? "live" : "offline"}</Badge>
          <h3 className="mt-2 text-lg font-semibold">{agent.name}</h3>
          <p className="mt-1 text-sm text-muted">{agent.description}</p>
        </div>
        <HireCTA agent={agent} />
      </div>
      {signal ? <CategorySignal signal={signal} /> : null}
      <Link
        to="/agents/$agentId"
        params={{ agentId: agent.id }}
        className="font-mono text-xs uppercase tracking-wide text-accent hover:underline"
      >
        Open detail
      </Link>
    </Card>
  );
}
