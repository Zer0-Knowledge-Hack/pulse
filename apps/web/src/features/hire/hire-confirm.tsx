import { CATEGORY_LABELS, type AgentListing } from "@era/domain";
import { Button, Dialog } from "@/components/ui";
import { formatAddress, weiToU } from "@/lib/format";
import { testnetExplorerTx } from "./hire-log";

export type HireProgress = {
  created: boolean;
  submitted: boolean;
  confirming: boolean;
  activating: boolean;
};

export function HireConfirmDialog({
  open,
  onClose,
  onConfirm,
  agent,
  task,
  budgetWei,
  contractAddress,
  provider,
  busy,
  canPay,
  blockedReason,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agent: AgentListing;
  task: string;
  budgetWei: string;
  contractAddress: string;
  provider: string;
  busy: boolean;
  canPay: boolean;
  blockedReason?: string;
}) {
  return (
    <Dialog
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Confirm hire"
      description="Review the job before you pay. Your wallet will ask you to confirm each ERC-8183 step."
      placement="bottom"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button className="flex-1" loading={busy} disabled={!canPay || busy} onClick={onConfirm}>
            {busy ? "Processing…" : "Confirm and pay"}
          </Button>
        </div>
      }
    >
      <dl className="space-y-3 text-sm">
        <Row label="Agent" value={agent.name} />
        <Row label="Job" value={CATEGORY_LABELS[agent.category]} />
        <Row label="Task" value={task} />
        <Row label="Network" value="BNB Smart Chain Testnet" />
        <Row label="Chain ID" value="97" />
        <Row label="Contract" value={contractAddress} mono />
        <Row label="Provider" value={formatAddress(provider)} mono />
        <Row label="Amount" value={`${weiToU(budgetWei) || budgetWei} $U`} />
        <Row label="Network fee" value="Estimated by wallet" />
      </dl>
      {blockedReason ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {blockedReason}
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted">
          One hire. Several wallet confirmations (create, budget, policy, approve $U, fund). Not a
          second payment of the same step.
        </p>
      )}
    </Dialog>
  );
}

export function HireProgressDialog({
  open,
  agentName,
  phaseLabel,
  progress,
  txHash,
}: {
  open: boolean;
  agentName: string;
  phaseLabel: string;
  progress: HireProgress;
  txHash?: string;
}) {
  const explorer = txHash ? testnetExplorerTx(txHash) : null;
  return (
    <Dialog
      open={open}
      onClose={() => undefined}
      title={`Hiring ${agentName}`}
      description={phaseLabel}
      placement="bottom"
    >
      <ol className="space-y-3 text-sm">
        <Step done={progress.created} active={!progress.created} label="Hire request created" />
        <Step
          done={progress.submitted}
          active={progress.created && !progress.submitted}
          label="Wallet transaction submitted"
        />
        <Step
          done={progress.confirming}
          active={progress.submitted && !progress.confirming}
          label="Waiting for blockchain confirmation"
        />
        <Step
          done={progress.activating}
          active={progress.confirming && !progress.activating}
          label="Hire activation"
        />
      </ol>
      {txHash ? (
        <p className="mt-4 break-all font-mono text-xs text-muted">
          Transaction: {txHash}
          {explorer ? (
            <>
              {" "}
              <a href={explorer} rel="noreferrer" target="_blank" className="text-accent hover:underline">
                View on BscScan
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </Dialog>
  );
}

export function HireSuccessDialog({
  open,
  onClose,
  agentName,
  txHash,
}: {
  open: boolean;
  onClose: () => void;
  agentName: string;
  txHash?: string;
}) {
  const explorer = txHash ? testnetExplorerTx(txHash) : null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Hire successful"
      description={`${agentName} is now active.`}
      placement="bottom"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          {explorer ? (
            <a href={explorer} rel="noreferrer" target="_blank" className="flex-1">
              <Button className="w-full">View transaction</Button>
            </a>
          ) : null}
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            View agent
          </Button>
        </div>
      }
    >
      <dl className="space-y-3 text-sm">
        <Row label="Agent" value={agentName} />
        <Row label="Status" value="Active" />
        <Row label="Network" value="BNB Smart Chain Testnet" />
        {txHash ? <Row label="Transaction" value={txHash} mono /> : null}
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
      description="On-chain session revoke is not available in this app."
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
  kind: "wallet" | "network" | "fields" | "error" | "rejected" | null;
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

function gateCopy(
  kind: "wallet" | "network" | "fields" | "error" | "rejected",
  details?: string,
) {
  if (kind === "wallet") {
    return {
      title: "Wallet not connected",
      description: "Connect your wallet to continue.",
    };
  }
  if (kind === "network") {
    return {
      title: "Wrong network",
      description: "Please switch to BNB Smart Chain Testnet.",
    };
  }
  if (kind === "fields") {
    return {
      title: "Unable to continue",
      description: details || "Check the required fields and try again.",
    };
  }
  if (kind === "rejected") {
    return {
      title: "Transaction cancelled",
      description: "You cancelled the transaction in your wallet.",
    };
  }
  return {
    title: "Hire failed",
    description: details || "The hire did not complete. Your payment was not started again.",
  };
}

function Step({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <li className="flex gap-2">
      <span className={done ? "text-ok" : active ? "text-accent" : "text-muted"}>
        {done ? "✓" : active ? "●" : "○"}
      </span>
      <span className={done || active ? "text-paper" : "text-muted"}>{label}</span>
    </li>
  );
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
