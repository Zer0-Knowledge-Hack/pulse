import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/toast";
import {
  loadActivity,
  loadHires,
  loadNotices,
  newId,
  saveActivity,
  saveHires,
  saveNotices,
  type ActivityEvent,
  type Notice,
  type NoticeKind,
  type StoredHire,
} from "@/lib/inbox";

type InboxApi = {
  notices: Notice[];
  activity: ActivityEvent[];
  hires: StoredHire[];
  unreadCount: number;
  pushNotice: (input: {
    kind: NoticeKind;
    title: string;
    description: string;
    href?: string;
  }) => void;
  pushActivity: (input: Omit<ActivityEvent, "id" | "createdAt">) => void;
  recordHire: (hire: StoredHire) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

const InboxContext = createContext<InboxApi | null>(null);

export function InboxProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [hires, setHires] = useState<StoredHire[]>([]);
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const [walletSeen, setWalletSeen] = useState<string | null>(null);

  useEffect(() => {
    setNotices(loadNotices());
    setActivity(loadActivity());
    setHires(loadHires());
  }, []);

  const pushNotice = useCallback(
    (input: { kind: NoticeKind; title: string; description: string; href?: string }) => {
      const item: Notice = {
        id: newId(),
        createdAt: new Date().toISOString(),
        read: false,
        ...input,
      };
      setNotices((current) => {
        const next = [item, ...current];
        saveNotices(next);
        return next;
      });
    },
    [],
  );

  const pushActivity = useCallback((input: Omit<ActivityEvent, "id" | "createdAt">) => {
    const item: ActivityEvent = {
      id: newId(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    setActivity((current) => {
      const next = [item, ...current];
      saveActivity(next);
      return next;
    });
  }, []);

  const recordHire = useCallback((hire: StoredHire) => {
    setHires((current) => {
      const next = [hire, ...current.filter((row) => row.jobId !== hire.jobId)];
      saveHires(next);
      return next;
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setNotices((current) => {
      const next = current.map((item) => (item.id === id ? { ...item, read: true } : item));
      saveNotices(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotices((current) => {
      const next = current.map((item) => ({ ...item, read: true }));
      saveNotices(next);
      return next;
    });
  }, []);

  const ready = useRef(false);

  useEffect(() => {
    if (!ready.current) {
      ready.current = true;
      setWalletSeen(isConnected && address ? address : null);
      return;
    }
    if (isConnected && address && walletSeen !== address) {
      setWalletSeen(address);
      toast.push("Wallet connected.", "ok");
      pushNotice({
        kind: "wallet_connected",
        title: "Wallet connected",
        description: `${address.slice(0, 6)}…${address.slice(-4)} is connected.`,
        href: "/profile?tab=wallet",
      });
      pushActivity({
        type: "wallet",
        title: "Wallet connected",
        description: address,
        status: "Connected",
      });
      return;
    }
    if (!isConnected && walletSeen) {
      toast.push("Wallet disconnected.", "muted");
      pushNotice({
        kind: "wallet_disconnected",
        title: "Wallet disconnected",
        description: "The buyer wallet is no longer connected.",
        href: "/profile?tab=wallet",
      });
      pushActivity({
        type: "wallet",
        title: "Wallet disconnected",
        description: "Connection ended.",
        status: "Disconnected",
      });
      setWalletSeen(null);
    }
  }, [address, isConnected, pushActivity, pushNotice, toast, walletSeen]);

  const unreadCount = notices.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({
      notices,
      activity,
      hires,
      unreadCount,
      pushNotice,
      pushActivity,
      recordHire,
      markRead,
      markAllRead,
    }),
    [activity, hires, markAllRead, markRead, notices, pushActivity, pushNotice, recordHire, unreadCount],
  );

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox(): InboxApi {
  const ctx = useContext(InboxContext);
  if (!ctx) {
    return {
      notices: [],
      activity: [],
      hires: [],
      unreadCount: 0,
      pushNotice: () => undefined,
      pushActivity: () => undefined,
      recordHire: () => undefined,
      markRead: () => undefined,
      markAllRead: () => undefined,
    };
  }
  return ctx;
}
