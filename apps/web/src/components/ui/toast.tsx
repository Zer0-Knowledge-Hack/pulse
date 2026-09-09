import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type Tone = "ok" | "danger" | "muted";

type ToastItem = {
  id: string;
  message: string;
  tone: Tone;
};

type ToastApi = {
  push: (message: string, tone?: Tone) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, tone: Tone = "muted") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setItems((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-md items-start gap-2 rounded-2xl border bg-ink-2 px-3 py-2.5 text-sm shadow-lg",
              item.tone === "ok" && "border-ok/40",
              item.tone === "danger" && "border-danger/40",
              item.tone === "muted" && "border-line",
            )}
          >
            {item.tone === "ok" ? (
              <Icon icon={CircleCheck} className="mt-0.5 text-ok" />
            ) : null}
            {item.tone === "danger" ? (
              <Icon icon={CircleAlert} className="mt-0.5 text-danger" />
            ) : null}
            <p className="min-w-0 flex-1">{item.message}</p>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label="Dismiss notification"
              onClick={() =>
                setItems((current) => current.filter((entry) => entry.id !== item.id))
              }
            >
              <Icon icon={X} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { push: () => undefined };
  }
  return ctx;
}
