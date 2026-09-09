const U_DECIMALS = 18;

export function formatAddress(value: string): string {
  if (value.length < 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function agentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return `${first}${second ?? ""}`.toUpperCase();
}

export function chainLabel(chainId: 56 | 97): string {
  return chainId === 56 ? "BNB Smart Chain" : "BSC Testnet";
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Convert a $U wei string (18 decimals) into a compact decimal for display. */
export function weiToU(wei: string): string {
  if (!/^\d+$/.test(wei)) return "";
  const value = BigInt(wei);
  const base = 10n ** BigInt(U_DECIMALS);
  const whole = value / base;
  const frac = value % base;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(U_DECIMALS, "0").replace(/0+$/, "");
  return `${whole.toString()}.${fracStr}`;
}

/**
 * Parse a $U decimal into wei. Returns null when the value is empty,
 * not a number, has too many decimals, or is not strictly positive.
 */
export function uToWei(amount: string): string | null {
  const trimmed = amount.trim();
  if (!trimmed) return null;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const [wholeRaw, fracRaw = ""] = trimmed.split(".");
  if (fracRaw.length > U_DECIMALS) return null;
  const whole = wholeRaw && wholeRaw.length > 0 ? wholeRaw : "0";
  const fracPadded = fracRaw.padEnd(U_DECIMALS, "0");
  const wei = BigInt(whole) * 10n ** BigInt(U_DECIMALS) + BigInt(fracPadded);
  if (wei <= 0n) return null;
  return wei.toString();
}

export function friendlyLoadError(err?: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  return "Check your connection and try again. If this keeps happening, the catalog may be offline.";
}
