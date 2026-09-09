import { useQuery } from "@tanstack/react-query";
import { ApiError, getAgent, getSignal, isNotFound } from "@/lib/api";

function retryAgent(count: number, err: Error) {
  if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return false;
  return count < 1;
}

export function useAgent(agentId: string) {
  const agentQuery = useQuery({
    queryKey: ["agent", agentId],
    queryFn: ({ signal }) => getAgent(agentId, { signal }),
    retry: retryAgent,
  });

  const signalQuery = useQuery({
    queryKey: ["agent-signal", agentId],
    queryFn: ({ signal }) => getSignal(agentId, { signal }),
    enabled: agentQuery.isSuccess,
    retry: false,
    staleTime: 30_000,
  });

  const signalMissing = signalQuery.isError && isNotFound(signalQuery.error);
  const signalFailed = signalQuery.isError && !signalMissing;

  return {
    agent: agentQuery.data?.agent ?? null,
    signal: signalQuery.data?.signal ?? null,
    loading: agentQuery.isPending,
    notFound: agentQuery.isError && isNotFound(agentQuery.error),
    error: agentQuery.isError
      ? agentQuery.error instanceof Error
        ? agentQuery.error.message
        : "This agent could not be loaded"
      : null,
    signalStatus: agentQuery.isPending || (agentQuery.isSuccess && signalQuery.isPending)
      ? ("loading" as const)
      : signalQuery.isSuccess
        ? ("ready" as const)
        : ("empty" as const),
    signalRefreshing: signalQuery.isFetching && !signalQuery.isPending,
    signalFailed,
    reload: () => {
      void agentQuery.refetch();
    },
    reloadSignal: () => {
      void signalQuery.refetch();
    },
  };
}
