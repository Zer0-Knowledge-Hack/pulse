import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import type { AgentListing, JobView } from "@era/domain";
import { Button, Card } from "@/components/ui";
import { createJob, isLocalChain, revokeJobSession } from "@/lib/api";

export function HireCTA({ agent }: { agent: AgentListing }) {
  return (
    <Link to="/agents/$agentId" params={{ agentId: agent.id }}>
      <Button type="button">Hire</Button>
    </Link>
  );
}

export function HirePanel({ agent }: { agent: AgentListing }) {
  const { isConnected } = useAccount();
  const local = isLocalChain();
  const [task, setTask] = useState(
    `Run a ${agent.category.replaceAll("_", " ")} pass and return the current signal plus a recommended action.`,
  );
  const [budgetWei, setBudgetWei] = useState("100000000000000000");
  const [job, setJob] = useState<JobView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { job: created } = await createJob({
        agentId: agent.id,
        budgetWei,
        task,
      });
      setJob(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hire failed");
    } finally {
      setPending(false);
    }
  }

  async function onRevoke() {
    if (!job) return;
    const { job: next } = await revokeJobSession(job.jobId);
    setJob(next);
  }

  const canHire = local || isConnected;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Activate</p>
          <h2 className="mt-1 text-lg font-semibold">Hire {agent.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {local
              ? "Local mock adapter: no wallet popup. Job is recorded as Funded."
              : "Buyer wallet pays ERC-8183 escrow. The agent wallet executes inside Altana caps."}
          </p>
        </div>
        {!local ? <ConnectButton /> : null}
      </div>

      {job ? (
        <div className="space-y-3">
          <p className="font-mono text-sm">
            Status <span className="text-ok">{job.status}</span>
          </p>
          <p className="font-mono text-xs text-muted">job {job.jobId}</p>
          {job.txHashes[0] ? (
            <p className="font-mono text-xs break-all text-muted">tx {job.txHashes[0]}</p>
          ) : null}
          {job.session ? (
            <div className="border border-line p-3 text-sm">
              <p className="font-mono text-[11px] uppercase text-muted">Session</p>
              <p className="mt-2">Spend cap {job.session.spendCapWei} wei</p>
              <p>Expires {new Date(job.session.expiry).toLocaleString()}</p>
              <p>Allowlist {job.session.allowlist.join(", ")}</p>
              <p className={job.session.revoked ? "text-danger" : "text-ok"}>
                {job.session.revoked ? "Revoked" : "Active"}
              </p>
              {!job.session.revoked ? (
                <Button className="mt-3" variant="danger" type="button" onClick={onRevoke}>
                  Revoke
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm">
            Task
            <textarea
              className="mt-1 w-full rounded-sm border border-line bg-ink px-3 py-2 font-sans text-sm text-paper"
              rows={3}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Budget (wei, $U 18dp)
            <input
              className="mt-1 w-full rounded-sm border border-line bg-ink px-3 py-2 font-mono text-sm"
              value={budgetWei}
              onChange={(e) => setBudgetWei(e.target.value)}
              required
            />
          </label>
          {!canHire ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">Connect a wallet on BSC testnet to hire.</p>
              <ConnectButton />
            </div>
          ) : (
            <Button type="submit" disabled={pending}>
              {pending ? "Funding…" : "Fund job"}
            </Button>
          )}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </form>
      )}
    </Card>
  );
}
