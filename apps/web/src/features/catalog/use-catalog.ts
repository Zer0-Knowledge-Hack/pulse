import { useQuery } from "@tanstack/react-query";
import type { Category } from "@era/domain";
import { ApiError, fetchSignals, listAgents } from "@/lib/api";

type Status = "loading" | "ready" | "error";

function retryCatalog(count: number, err: Error) {
  if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return false;
  return count < 1;
}

export function useCatalog(category?: Category) {
  const agentsQuery = useQuery({
    queryKey: ["catalog-agents", category ?? "all"],
    queryFn: ({ signal }) => listAgents(category, { signal }),
    retry: retryCatalog,
  });

  const agents = agentsQuery.data?.agents ?? [];

  const signalsQuery = useQuery({
    queryKey: ["catalog-signals", category ?? "all", agents.map((agent) => agent.id)],
    queryFn: ({ signal }) => fetchSignals(
      agents.map((agent) => agent.id),
      signal,
    ),
    enabled: agentsQuery.isSuccess && agents.length > 0,
    retry: false,
    staleTime: 30_000,
  });

  const status: Status = agentsQuery.isPending
    ? "loading"
    : agentsQuery.isError
      ? "error"
      : "ready";

  return {
    agents,
    signals: signalsQuery.data ?? {},
    status,
    error: agentsQuery.error instanceof Error ? agentsQuery.error.message : null,
    retry: () => {
      void agentsQuery.refetch();
      void signalsQuery.refetch();
    },
  };
}
