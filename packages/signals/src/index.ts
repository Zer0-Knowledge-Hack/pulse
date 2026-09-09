import { getSignal } from "@era/indexer";
import type { AgentSignal } from "@era/domain";
import { readVenusPositionHealth } from "./venus";

const CACHE_TTL_MS = 60_000;
const WATCH_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const DEFAULT_WATCH_ADDRESS = "0x22f3e24233B9BDcC65fa855495D99Fe7d2458510";

type CacheEntry = { at: number; signal: AgentSignal };

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<void>>();

function envValue(name: string): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.[name];
}

const VENUS_WATCH_ADDRESS = (envValue("VENUS_WATCH_ADDRESS") ?? DEFAULT_WATCH_ADDRESS).trim();

async function refresh(agentId: string): Promise<void> {
  if (agentId !== "hf-watch" || !WATCH_ADDRESS_PATTERN.test(VENUS_WATCH_ADDRESS)) {
    return;
  }
  try {
    const health = await readVenusPositionHealth(VENUS_WATCH_ADDRESS);
    if (!health) {
      return;
    }
    const fixture = getSignal(agentId);
    const lastActionAt =
      fixture && fixture.category === "health_factor"
        ? fixture.lastActionAt
        : new Date().toISOString();
    cache.set(agentId, {
      at: Date.now(),
      signal: {
        category: "health_factor",
        healthFactor: health.healthFactor,
        liquidationPrice: health.liquidationPrice,
        protocol: "Venus",
        lastActionAt,
      },
    });
  } catch {
    const fixture = getSignal(agentId);
    if (fixture) {
      cache.set(agentId, { at: Date.now(), signal: fixture });
    }
  }
}

export function getAgentSignal(agentId: string): AgentSignal | undefined {
  const now = Date.now();
  const hit = cache.get(agentId);
  if (hit && now - hit.at < CACHE_TTL_MS) {
    return hit.signal;
  }
  if (!inFlight.has(agentId)) {
    const pending = refresh(agentId).finally(() => {
      inFlight.delete(agentId);
    });
    inFlight.set(agentId, pending);
  }
  return hit?.signal ?? getSignal(agentId);
}
