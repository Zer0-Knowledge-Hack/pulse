export type NoticeKind =
  | "hire_success"
  | "hire_failed"
  | "tx_pending"
  | "wallet_connected"
  | "wallet_disconnected"
  | "agent_update"
  | "system"
  | "error"
  | "warning";

export type Notice = {
  id: string;
  kind: NoticeKind;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  href?: string;
};

export type ActivityEvent = {
  id: string;
  type: "hire" | "revoke" | "wallet" | "copy" | "system";
  title: string;
  description: string;
  status?: string;
  createdAt: string;
  href?: string;
};

export type StoredHire = {
  jobId: string;
  agentId: string;
  agentName: string;
  category: string;
  status: string;
  budgetWei: string;
  createdAt: string;
  txHash?: string;
};

const NOTICE_KEY = "pulse:notices";
const ACTIVITY_KEY = "pulse:activity";
const HIRES_KEY = "pulse:hires";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

export function loadNotices(): Notice[] {
  return readJson<Notice[]>(NOTICE_KEY, []);
}

export function saveNotices(items: Notice[]): void {
  writeJson(NOTICE_KEY, items.slice(0, 80));
}

export function loadActivity(): ActivityEvent[] {
  return readJson<ActivityEvent[]>(ACTIVITY_KEY, []);
}

export function saveActivity(items: ActivityEvent[]): void {
  writeJson(ACTIVITY_KEY, items.slice(0, 80));
}

export function loadHires(): StoredHire[] {
  return readJson<StoredHire[]>(HIRES_KEY, []);
}

export function saveHires(items: StoredHire[]): void {
  writeJson(HIRES_KEY, items.slice(0, 80));
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
