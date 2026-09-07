import { useEffect, useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import type { AgentListing, AgentSignal } from "@era/domain";
import { Badge, Button, PageState } from "@/components/ui";
import { CategorySignal } from "@/features/signals/category-signal";
import { HirePanel } from "@/features/hire/hire-cta";
import { getAgent, getSignal } from "@/lib/api";

const agentRoute = getRouteApi("/agents/$agentId");

export function AgentDetailPage() {
  const { agentId } = agentRoute.useParams();
  const [agent, setAgent] = useState<AgentListing | null>(null);
  const [signal, setSignal] = useState<AgentSignal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setAgent(null);
    setSignal(null);
    setError(null);

    getAgent(agentId)
      .then(async ({ agent: row }) => {
        if (cancelled) return;
        setAgent(row);
        // The signal is decoration. A missing one must not hide the agent
        // or, worse, its hire panel.
        try {
          const { signal: value } = await getSignal(agentId);
          if (!cancelled) setSignal(value);
        } catch {
          if (!cancelled) setSignal(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load agent");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [agentId, attempt]);

  if (error) {
    return (
      <PageState
        tone="danger"
        title="This agent could not be loaded"
        action={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Try again
            </Button>
            <Link to="/">
              <Button variant="ghost" type="button">
                Back to the marketplace
              </Button>
            </Link>
          </div>
        }
      >
        <p className="font-mono text-xs break-all">{error}</p>
      </PageState>
    );
  }
  if (!agent) {
    return <PageState title="Loading the agent…" />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <Badge>{agent.category.replaceAll("_", " ")}</Badge>
        <h1 className="text-3xl font-semibold">{agent.name}</h1>
        <p className="text-muted">{agent.description}</p>
        {signal ? <CategorySignal signal={signal} /> : null}
        <p className="font-mono text-xs text-muted">
          provider {agent.commerce.erc8183Provider}
        </p>
      </div>
      <HirePanel agent={agent} />
    </div>
  );
}
