import { useEffect, useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import {
  CATEGORY_LABELS,
  categorySchema,
  type AgentListing,
  type AgentSignal,
  type Category,
} from "@era/domain";
import {
  Button,
  CardSkeleton,
  PageState,
  RouteNotFoundState,
} from "@/components/ui";
import { AgentCard } from "@/features/catalog/agent-card";
import { CategoryNav } from "@/features/catalog/category-nav";
import { getSignal, listAgents } from "@/lib/api";

const browseRoute = getRouteApi("/browse/$category");

type Status = "loading" | "ready" | "error";

export function BrowsePage() {
  const { category: raw } = browseRoute.useParams();
  const parsed = categorySchema.safeParse(raw);

  // A mistyped slug is a wrong address, not a crash. Parsing used to throw
  // here and take the whole app down with no error boundary to catch it.
  if (!parsed.success) {
    return <RouteNotFoundState />;
  }
  return <BrowseCategory category={parsed.data as Category} />;
}

function BrowseCategory({ category }: { category: Category }) {
  const [agents, setAgents] = useState<AgentListing[]>([]);
  const [signals, setSignals] = useState<Record<string, AgentSignal>>({});
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Reset on every category change, otherwise the previous category's
    // cards stay on screen while the new request is in flight.
    setStatus("loading");
    setError(null);
    setAgents([]);
    setSignals({});

    listAgents(category)
      .then(async ({ agents: rows }) => {
        if (cancelled) return;
        setAgents(rows);
        setStatus("ready");

        // Signals are decoration, not the page. One missing signal must not
        // turn a working catalog into an error screen.
        const settled = await Promise.allSettled(
          rows.map(async (agent) => {
            const { signal } = await getSignal(agent.id);
            return [agent.id, signal] as const;
          }),
        );
        if (cancelled) return;
        setSignals(
          Object.fromEntries(
            settled
              .filter(
                (entry): entry is PromiseFulfilledResult<readonly [string, AgentSignal]> =>
                  entry.status === "fulfilled",
              )
              .map((entry) => entry.value),
          ),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to load agents");
      });

    return () => {
      cancelled = true;
    };
  }, [category, attempt]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{CATEGORY_LABELS[category]}</h1>
        <p className="text-muted">
          Featured agents first. Compare the signal, then hire.
        </p>
      </div>
      <CategoryNav active={category} />

      {status === "loading" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : null}

      {status === "error" ? (
        <PageState
          tone="danger"
          title="The catalog did not answer"
          action={
            <Button
              variant="ghost"
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Try again
            </Button>
          }
        >
          <p className="font-mono text-xs break-all">{error}</p>
        </PageState>
      ) : null}

      {status === "ready" && agents.length === 0 ? (
        <PageState
          title="No agents listed in this category yet"
          action={
            <Link to="/">
              <Button variant="ghost" type="button">
                See the other categories
              </Button>
            </Link>
          }
        >
          <p>
            The catalog answered, and it has nothing here. Try another category
            while this one fills up.
          </p>
        </PageState>
      ) : null}

      {status === "ready" && agents.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} signal={signals[agent.id]} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
