import { Link } from "@tanstack/react-router";
import { Briefcase, Receipt } from "lucide-react";
import { Badge, Button, EmptyState } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useInbox } from "@/features/account/inbox";
import { formatDateTime, weiToU } from "@/lib/format";
import type { StoredHire } from "@/lib/inbox";

function statusTone(status: string): "ok" | "danger" | "accent" | "muted" {
  const label = hireStatusLabel(status);
  if (label === "Active" || label === "Completed") return "ok";
  if (label === "Failed") return "danger";
  if (label === "Pending") return "accent";
  return "muted";
}

function hireStatusLabel(status: string): string {
  if (status === "Funded") return "Active";
  if (status === "Open" || status === "Submitted") return "Pending";
  if (status === "Completed") return "Completed";
  if (status === "Rejected" || status === "Failed") return "Failed";
  if (status === "Expired" || status === "Revoked") return "Expired";
  return status;
}

export function HireList({ variant }: { variant: "agents" | "purchases" }) {
  const { hires } = useInbox();

  if (hires.length === 0) {
    return (
      <EmptyState
        title={variant === "agents" ? "No hired agents yet" : "No purchases yet"}
        icon={
          <span className="icon-well">
            <Icon icon={variant === "agents" ? Briefcase : Receipt} />
          </span>
        }
        action={
          <Link to="/">
            <Button variant="ghost">Browse marketplace</Button>
          </Link>
        }
      >
        <p>When you complete a hire, it will appear here from this browser.</p>
      </EmptyState>
    );
  }

  return (
    <ul className="space-y-2">
      {hires.map((hire) => (
        <HireRow key={hire.jobId} hire={hire} />
      ))}
    </ul>
  );
}

function HireRow({ hire }: { hire: StoredHire }) {
  return (
    <li className="rounded-xl border border-line bg-ink-2 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{hire.agentName}</p>
          <p className="lede capitalize">{hire.category.replaceAll("_", " ")}</p>
        </div>
        <Badge tone={statusTone(hire.status)}>{hireStatusLabel(hire.status)}</Badge>
      </div>
      <dl className="mt-2 grid gap-1 text-xs text-muted sm:grid-cols-2">
        <div>Budget {weiToU(hire.budgetWei) || hire.budgetWei} $U</div>
        <div>{formatDateTime(hire.createdAt)}</div>
        {hire.txHash ? <div className="break-all font-mono sm:col-span-2">Tx {hire.txHash}</div> : null}
      </dl>
      <Link to="/agents/$agentId" params={{ agentId: hire.agentId }} className="mt-2 inline-flex">
        <Button variant="ghost" className="h-9 min-h-9 text-xs">
          Open agent
        </Button>
      </Link>
    </li>
  );
}
