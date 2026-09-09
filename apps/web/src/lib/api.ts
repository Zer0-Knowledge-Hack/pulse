import type {
  AgentListing,
  AgentSignal,
  Category,
  HireIntent,
  JobView,
} from "@era/domain";

const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function stripSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function pageHost(): string {
  return typeof window === "undefined" ? "" : window.location.hostname;
}

function isLoopbackHost(host: string): boolean {
  return host === "" || host === "localhost" || host === "127.0.0.1";
}

/**
 * On the PC (`localhost:5173`) call the API on :3001 — the path that already worked.
 * On a phone (`http://PC-IP:5173`) use the Vite `/api` proxy so the phone never
 * hits its own localhost.
 */
export function resolveApiUrl(): string {
  const configured = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").trim();
  if (import.meta.env.DEV && !isLoopbackHost(pageHost())) {
    return "/api";
  }
  return stripSlash(configured || "http://localhost:3001");
}

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

function messageForStatus(status: number, fallback?: string): string {
  if (fallback && fallback.trim()) return fallback;
  if (status === 400) return "The request was invalid. Check the fields and try again.";
  if (status === 404) return "Nothing was found for this request.";
  if (status === 409) return "That job is already in a different state.";
  if (status === 429) return "Too many requests. Wait a moment and try again.";
  if (status >= 500) return "The catalog is unavailable. Try again.";
  return `Request failed (${status}).`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const upstream = init?.signal;
  if (upstream) {
    if (upstream.aborted) controller.abort();
    else upstream.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${resolveApiUrl()}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const text = await response.text();
    let payload: unknown = {};
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        throw new ApiError(
          response.ok
            ? "The catalog did not return JSON."
            : messageForStatus(response.status),
          response.status,
        );
      }
    }

    const errorMessage =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error?: unknown }).error ?? "")
        : "";

    if (!response.ok) {
      throw new ApiError(messageForStatus(response.status, errorMessage), response.status);
    }

    return payload as T;
  } catch (err) {
    if (upstream?.aborted) throw err;
    if (err instanceof ApiError) throw err;
    if (isAbortError(err)) {
      throw new ApiError("The request timed out. Try again.", 408);
    }
    throw new ApiError("Check your connection and try again. The catalog may be offline.");
  } finally {
    clearTimeout(timeout);
  }
}

export function listAgents(category?: Category, init?: RequestInit) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return request<{ agents?: AgentListing[] }>(`/agents${query}`, init).then((body) => {
    if (!Array.isArray(body.agents)) {
      throw new ApiError("The catalog returned data this app cannot read.");
    }
    return { agents: body.agents };
  });
}

export function getAgent(id: string, init?: RequestInit) {
  return request<{ agent?: AgentListing }>(`/agents/${encodeURIComponent(id)}`, init).then((body) => {
    if (!body.agent || typeof body.agent !== "object") {
      throw new ApiError("This agent record cannot be displayed.");
    }
    return { agent: body.agent };
  });
}

export function getSignal(id: string, init?: RequestInit) {
  return request<{ signal?: AgentSignal }>(
    `/agents/${encodeURIComponent(id)}/signal`,
    init,
  ).then((body) => {
    if (!body.signal || typeof body.signal !== "object") {
      throw new ApiError("This signal cannot be displayed.");
    }
    return { signal: body.signal };
  });
}

export function createJob(intent: HireIntent, init?: RequestInit) {
  return request<{ job?: JobView }>("/jobs", {
    ...init,
    method: "POST",
    body: JSON.stringify(intent),
  }).then((body) => {
    if (!body.job || typeof body.job !== "object") {
      throw new ApiError("The hire response cannot be displayed.");
    }
    return { job: body.job };
  });
}

export function getJob(jobId: string, init?: RequestInit) {
  return request<{ job?: JobView }>(`/jobs/${encodeURIComponent(jobId)}`, init).then((body) => {
    if (!body.job || typeof body.job !== "object") {
      throw new ApiError("This job cannot be displayed.");
    }
    return { job: body.job };
  });
}

export function revokeJobSession(jobId: string, init?: RequestInit) {
  return request<{ job?: JobView }>(`/jobs/${encodeURIComponent(jobId)}/revoke`, {
    ...init,
    method: "POST",
  }).then((body) => {
    if (!body.job || typeof body.job !== "object") {
      throw new ApiError("The updated job cannot be displayed.");
    }
    return { job: body.job };
  });
}

export function isLocalChain() {
  const chain = import.meta.env.VITE_CHAIN ?? "local";
  return chain !== "bsc-testnet" && chain !== "bsc-mainnet";
}

export function isNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

export async function fetchSignals(
  ids: string[],
  abort?: AbortSignal,
): Promise<Record<string, AgentSignal>> {
  const settled = await Promise.allSettled(
    ids.map(async (id) => {
      const { signal: value } = await getSignal(id, { signal: abort });
      return [id, value] as const;
    }),
  );
  return Object.fromEntries(
    settled
      .filter((entry): entry is PromiseFulfilledResult<readonly [string, AgentSignal]> => {
        return entry.status === "fulfilled";
      })
      .map((entry) => entry.value),
  );
}
