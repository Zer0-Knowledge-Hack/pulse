import { useEffect, useState } from "react";
import type { AgentListing, AgentSignal, Category } from "@era/domain";
import { getSignal, listAgents } from "@/lib/api";

type Status = "loading" | "ready" | "error";

export function useCatalog(category?: Category) {
  const [agents, setAgents] = useState<AgentListing[]>([]);
  const [signals, setSignals] = useState<Record<string, AgentSignal>>({});
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    setAgents([]);
    setSignals({});

    listAgents(category)
      .then(async ({ agents: rows }) => {
        if (cancelled) return;
        setAgents(rows);
        setStatus("ready");

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
                (
                  entry,
                ): entry is PromiseFulfilledResult<readonly [string, AgentSignal]> =>
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

  return {
    agents,
    signals,
    status,
    error,
    retry: () => setAttempt((n) => n + 1),
  };
}
