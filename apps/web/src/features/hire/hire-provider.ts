import type { Address } from "viem";

const PLACEHOLDER = /^(0x0{40}|0x([0-9a-f])\2{39}|0x(aa|bb|cc|dd|11|22|33|44|55|66|77|88|99|00)+)$/i;

export function isHexAddress(value: unknown): value is Address {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function isPlaceholderAddress(value: string): boolean {
  return PLACEHOLDER.test(value);
}

/** Provider for ERC-8183 `createJob`. Never invents an address. */
export function resolveListingProvider(agent: {
  owner?: unknown;
  commerce?: { erc8183Provider?: unknown };
}): Address | null {
  const candidates = [agent.commerce?.erc8183Provider, agent.owner];
  for (const candidate of candidates) {
    if (!isHexAddress(candidate)) continue;
    if (isPlaceholderAddress(candidate)) continue;
    return candidate;
  }
  return null;
}

export function isLocalAgentEndpoint(url: string | null | undefined): boolean {
  if (!url) return true;
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  } catch {
    return true;
  }
}
