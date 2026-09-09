export function hireLog(event: string, data?: Record<string, unknown>): void {
  if (!import.meta.env.DEV) return;
  if (data) {
    console.info(`[HIRE] ${event}`, data);
    return;
  }
  console.info(`[HIRE] ${event}`);
}

export function testnetExplorerTx(hash: string): string | null {
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) return null;
  return `https://testnet.bscscan.com/tx/${hash}`;
}

export const HIRE_CHAIN = "bsc-testnet" as const;
export const HIRE_CHAIN_ID = 97;
