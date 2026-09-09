const PREFIX = "pulse:hire:v2:";

export type StoredHireTx = {
  agentId: string;
  buyer: string;
  jobId?: string;
  task: string;
  budgetWei: string;
  txHashes: string[];
  lastTxHash?: string;
  createdAt: string;
};

function key(agentId: string, buyer: string): string {
  return `${PREFIX}${agentId}:${buyer.toLowerCase()}`;
}

export function readHireRecord(agentId: string, buyer: string | undefined): StoredHireTx | null {
  if (!buyer) return null;
  try {
    const raw = localStorage.getItem(key(agentId, buyer));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredHireTx;
    if (parsed.agentId !== agentId) return null;
    if (parsed.buyer.toLowerCase() !== buyer.toLowerCase()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeHireRecord(record: StoredHireTx): void {
  try {
    localStorage.setItem(key(record.agentId, record.buyer), JSON.stringify(record));
  } catch {
    /* private mode */
  }
}

export function clearHireRecord(agentId: string, buyer: string | undefined): void {
  if (!buyer) return;
  try {
    localStorage.removeItem(key(agentId, buyer));
  } catch {
    /* private mode */
  }
}

export function appendTxHash(record: StoredHireTx, hash: string | undefined): StoredHireTx {
  if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash)) return record;
  const txHashes = record.txHashes.includes(hash) ? record.txHashes : [...record.txHashes, hash];
  const next = { ...record, txHashes, lastTxHash: hash };
  writeHireRecord(next);
  return next;
}
