import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { Icon } from "./icon";

type Placement = "center" | "bottom" | "right";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  placement = "center",
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  placement?: Placement;
  labelledBy?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const generatedId = useId();
  const titleId = labelledBy ?? generatedId;

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (node) => !node.hasAttribute("disabled") && node.tabIndex !== -1,
      );
      if (nodes.length === 0) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (!firstNode || !lastNode) return;
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      lastFocus.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  function onOverlayClick() {
    onClose();
  }

  function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/65"
        onClick={onOverlayClick}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? `${titleId}-desc` : undefined}
        onKeyDown={onPanelKeyDown}
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col border border-line bg-ink-2 shadow-xl",
          placement === "center" && "mx-3 my-auto max-w-md rounded-2xl sm:mx-4",
          placement === "bottom" &&
            "mt-auto max-h-[85vh] rounded-t-2xl border-b-0 sm:mx-auto sm:max-w-lg",
          placement === "right" &&
            "ml-auto h-full max-h-none w-[min(100%,18.5rem)] rounded-none border-y-0 border-r-0",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={`${titleId}-desc`} className="mt-1 text-sm text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            className="min-h-10 min-w-10 shrink-0 px-0"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon icon={X} />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-line px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
