import { CATEGORY_LABELS, type AgentListing } from "@era/domain";
import { Button, Dialog } from "@/components/ui";
import { formatAddress, weiToU } from "@/lib/format";

export function HireConfirmDialog({
  open,
  onClose,
  onConfirm,
  agent,
  task,
  budgetWei,
  local,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agent: AgentListing;
  task: string;
  budgetWei: string;
  local: boolean;
  busy: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Confirm hire"
      description="Review the job before you fund it. This opens a session the agent can spend against."
      placement="bottom"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button className="flex-1" loading={busy} onClick={onConfirm}>
            {busy ? "Processing…" : "Confirm hire"}
          </Button>
        </div>
      }
    >
      <dl className="space-y-3 text-sm">
        <Row label="Agent" value={agent.name} />
        <Row label="Job" value={CATEGORY_LABELS[agent.category]} />
        <Row label="Task" value={task} />
        <Row label="Price" value={`${weiToU(budgetWei) || budgetWei} $U`} />
        <Row label="Budget (wei)" value={budgetWei} mono />
        <Row label="Provider" value={formatAddress(agent.commerce.erc8183Provider)} mono />
        <Row
          label="Network"
          value={local ? "Mock commerce — no wallet prompt" : "Wallet signatures required"}
        />
      </dl>
    </Dialog>
  );
}

export function RevokeConfirmDialog({
  open,
  onClose,
  onConfirm,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Stop access"
      description="This ends the agent’s spend session. It cannot keep working against this hire."
      placement="center"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={busy}>
            Keep access
          </Button>
          <Button variant="danger" className="flex-1" loading={busy} onClick={onConfirm}>
            {busy ? "Processing…" : "Stop access"}
          </Button>
        </div>
      }
    />
  );
}

export function HireGateDialog({
  open,
  kind,
  onClose,
  onConnect,
  onSwitch,
  switching,
  details,
}: {
  open: boolean;
  kind: "wallet" | "network" | "fields" | "error" | null;
  onClose: () => void;
  onConnect?: () => void;
  onSwitch?: () => void;
  switching?: boolean;
  details?: string;
}) {
  if (!kind) return null;
  const copy = gateCopy(kind, details);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={copy.title}
      description={copy.description}
      placement="center"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Close
          </Button>
          {kind === "wallet" && onConnect ? (
            <Button className="flex-1" onClick={onConnect}>
              Connect wallet
            </Button>
          ) : null}
          {kind === "network" && onSwitch ? (
            <Button className="flex-1" loading={switching} onClick={onSwitch}>
              {switching ? "Switching…" : "Switch network"}
            </Button>
          ) : null}
        </div>
      }
    />
  );
}

function gateCopy(kind: "wallet" | "network" | "fields" | "error", details?: string) {
  if (kind === "wallet") {
    return {
      title: "Wallet not connected",
      description: "Connect a buyer wallet before you hire on a live chain.",
    };
  }
  if (kind === "network") {
    return {
      title: "Wrong network",
      description: "Switch to the network this demo uses, then try again.",
    };
  }
  if (kind === "fields") {
    return {
      title: "Unable to continue",
      description: details || "Check the required fields and try again.",
    };
  }
  return {
    title: "Hire failed",
    description: details || "The hire did not complete. You can retry when you are ready.",
  };
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border-b border-line pb-3 last:border-0 last:pb-0">
      <dt className="font-mono text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`mt-1 break-words ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
