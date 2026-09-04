import type {
  AgentListing,
  AgentSignal,
  Category,
  HireIntent,
  JobView,
} from "@era/domain";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function listAgents(category?: Category) {
  const query = category ? `?category=${category}` : "";
  return request<{ agents: AgentListing[] }>(`/agents${query}`);
}

export function getAgent(id: string) {
  return request<{ agent: AgentListing }>(`/agents/${id}`);
}

export function getSignal(id: string) {
  return request<{ signal: AgentSignal }>(`/agents/${id}/signal`);
}

export function createJob(intent: HireIntent) {
  return request<{ job: JobView }>("/jobs", {
    method: "POST",
    body: JSON.stringify(intent),
  });
}

export function getJob(jobId: string) {
  return request<{ job: JobView }>(`/jobs/${jobId}`);
}

export function revokeJobSession(jobId: string) {
  return request<{ job: JobView }>(`/jobs/${jobId}/revoke`, { method: "POST" });
}

export function isLocalChain() {
  const chain = import.meta.env.VITE_CHAIN ?? "local";
  return chain !== "bsc-testnet" && chain !== "bsc-mainnet";
}
