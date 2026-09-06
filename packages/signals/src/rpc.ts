export type RpcCall = { to: string; data: string };

const RPC_TIMEOUT_MS = 8_000;

export async function batchEthCall(rpcUrl: string, calls: RpcCall[]): Promise<(string | null)[]> {
  const body = calls.map((call, index) => ({
    jsonrpc: "2.0",
    id: index + 1,
    method: "eth_call",
    params: [{ to: call.to, data: call.data }, "latest"],
  }));
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`RPC HTTP ${response.status}`);
  }
  const rows = (await response.json()) as Array<{
    id: number;
    result?: string;
    error?: { message?: string };
  }>;
  return calls.map((_, index) => {
    const row = rows[index];
    if (!row || row.error || typeof row.result !== "string" || row.result.length < 2) {
      return null;
    }
    return row.result;
  });
}

export function word(hex: string, index: number): bigint {
  return BigInt("0x" + hex.slice(2 + index * 64, 2 + (index + 1) * 64));
}

export function wordToAddress(value: bigint): string {
  return "0x" + value.toString(16).padStart(64, "0").slice(24);
}

export function padAddress(address: string): string {
  return address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

export function decodeAddressArray(hex: string): string[] {
  const count = Number(word(hex, 1));
  const addresses: string[] = [];
  for (let index = 0; index < count; index += 1) {
    addresses.push(wordToAddress(word(hex, 2 + index)));
  }
  return addresses;
}
