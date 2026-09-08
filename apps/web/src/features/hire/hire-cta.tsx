import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { Address } from "viem";
import type { AgentListing, JobView } from "@era/domain";
import {
  createJob as createCommerceJob,
  getJob as getCommerceJob,
  mapHireError,
  validateHireReady,
  type HirePhase,
} from "@era/commerce";
import { Button, Card } from "@/components/ui";
import {
  createJob as createMockJobViaApi,
  getJob as getMockJobViaApi,
  isLocalChain,
  revokeJobSession,
} from "@/lib/api";

type UiPhase = "idle" | "preparing" | HirePhase | "funded" | "failed";

function readWebEnv(name: string): string | undefined {
  return (import.meta.env as Record<string, string | undefined>)[name];
}

function hireChain(): string {
  return readWebEnv("VITE_CHAIN") ?? "local";
}

function contractAddress(): Address | undefined {
  const raw = readWebEnv("VITE_CONTRACT_ADDRESS");
  return raw && /^0x[a-fA-F0-9]{40}$/.test(raw) ? (raw as Address) : undefined;
}

function storageKey(agentId: string): string {
  return `pulse:hire:${agentId}`;
}

function readStoredJobId(agentId: string): string | null {
  try {
    const raw = sessionStorage.getItem(storageKey(agentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { jobId?: string };
    return parsed.jobId ?? null;
  } catch {
    return null;
  }
}

function storeJobId(agentId: string, jobId: string): void {
  sessionStorage.setItem(storageKey(agentId), JSON.stringify({ jobId, agentId }));
}

function phaseLabel(phase: UiPhase): string {
  if (phase === "preparing") return "Preparing…";
  if (phase === "creating") return "Confirm in your wallet…";
  if (phase === "funding") return "Confirm payment in your wallet…";
  if (phase === "confirming") return "Processing… we’re checking the payment.";
  return "Hire";
}

export function HireCTA({ agent }: { agent: AgentListing }) {
  return (
    <Link to="/agents/$agentId" params={{ agentId: agent.id }}>
      <Button type="button">Hire</Button>
    </Link>
  );
}

export function HirePanel({ agent }: { agent: AgentListing }) {
  const { isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const local = isLocalChain();
  const chain = hireChain();
  const processingRef = useRef(false);
  const restoredRef = useRef(false);
  const [task, setTask] = useState(
    `Run a ${agent.category.replaceAll("_", " ")} pass and return the current signal plus a recommended action.`,
  );
  const [budgetWei, setBudgetWei] = useState("100000000000000000");
  const [job, setJob] = useState<JobView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<UiPhase>("idle");

  const busy = phase === "preparing" || phase === "creating" || phase === "funding" || phase === "confirming";
  const wrongNetwork = !local && isConnected && chainId !== (chain === "bsc-mainnet" ? 56 : 97);
  const canHire = local || (isConnected && Boolean(walletClient) && Boolean(publicClient) && !wrongNetwork);

  useEffect(() => {
    if (restoredRef.current) return;
    const jobId = readStoredJobId(agent.id);
    if (!jobId) return;
    if (!local && !publicClient) return;
    restoredRef.current = true;
    let cancelled = false;
    setPhase("confirming");
    const restore = local
      ? getMockJobViaApi(jobId).then((res) => res.job)
      : publicClient
        ? getCommerceJob(jobId, {
            chain,
            publicClient,
            contractAddress: contractAddress(),
          })
        : Promise.resolve(undefined);
    restore
      .then((restored) => {
        if (cancelled) return;
        if (restored) {
          setJob(restored);
          setPhase("funded");
        } else {
          setPhase("idle");
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(mapHireError(err).message);
        setPhase("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [agent.id, chain, local, publicClient]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (processingRef.current) return;
    processingRef.current = true;
    setError(null);
    setPhase("preparing");
    try {
      const intent = validateHireReady({
        intent: { agentId: agent.id, budgetWei, task },
        chain,
        connected: local || isConnected,
        chainId,
      });
      if (local) {
        setPhase("confirming");
        const { job: created } = await createMockJobViaApi(intent);
        storeJobId(agent.id, created.jobId);
        setJob(created);
        setPhase("funded");
        return;
      }
      if (!walletClient || !publicClient) {
        throw new Error("Connect your wallet to hire.");
      }
      const created = await createCommerceJob(intent, {
        chain,
        clients: { walletClient, publicClient },
        agentAddress: agent.commerce.erc8183Provider as Address,
        contractAddress: contractAddress(),
        amountInWei: intent.budgetWei,
        onPhase: setPhase,
        onCreated: (jobId) => storeJobId(agent.id, jobId),
      });
      storeJobId(agent.id, created.jobId);
      setJob(created);
      setPhase("funded");
    } catch (err) {
      setError(mapHireError(err).message);
      setPhase("failed");
    } finally {
      processingRef.current = false;
    }
  }

  async function onRevoke() {
    if (!job || processingRef.current) return;
    processingRef.current = true;
    try {
      const { job: next } = await revokeJobSession(job.jobId);
      setJob(next);
    } catch (err) {
      setError(mapHireError(err).message);
    } finally {
      processingRef.current = false;
    }
  }

  function onRetry() {
    setError(null);
    setPhase("idle");
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Activate</p>
          <h2 className="mt-1 text-lg font-semibold">Hire {agent.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {local
              ? "No wallet needed. We’ll mark this hire as complete."
              : "Confirm in your wallet. We’ll tell you when it’s done."}
          </p>
        </div>
        {!local ? <ConnectButton /> : null}
      </div>

      {job && phase === "funded" ? (
        <div className="space-y-3">
          <p className="text-sm text-ok">Hire complete</p>
          {job.txHashes[0] ? (
            <p className="font-mono text-xs break-all text-muted">Receipt {job.txHashes[0]}</p>
          ) : null}
          {job.session ? (
            <div className="border border-line p-3 text-sm">
              <p className="font-mono text-[11px] uppercase text-muted">Access</p>
              <p className="mt-2">Spend cap {job.session.spendCapWei} wei</p>
              <p>Expires {new Date(job.session.expiry).toLocaleString()}</p>
              <p className={job.session.revoked ? "text-danger" : "text-ok"}>
                {job.session.revoked ? "Access stopped" : "Access active"}
              </p>
              {!job.session.revoked ? (
                <Button className="mt-3" variant="danger" type="button" onClick={onRevoke}>
                  Stop access
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm">
            What should it do?
            <textarea
              className="mt-1 w-full rounded-sm border border-line bg-ink px-3 py-2 font-sans text-sm text-paper"
              rows={3}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
              disabled={busy}
            />
          </label>
          <label className="block text-sm">
            Budget
            <input
              className="mt-1 w-full rounded-sm border border-line bg-ink px-3 py-2 font-mono text-sm"
              value={budgetWei}
              onChange={(e) => setBudgetWei(e.target.value)}
              required
              disabled={busy}
            />
          </label>
          {wrongNetwork ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-danger">Switch to the correct network (BSC Testnet).</p>
              <ConnectButton />
            </div>
          ) : !canHire ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">Connect your wallet to hire.</p>
              <ConnectButton />
            </div>
          ) : (
            <Button type="submit" disabled={busy}>
              {busy ? phaseLabel(phase) : "Hire"}
            </Button>
          )}
          {phase === "failed" && error ? (
            <div className="space-y-2">
              <p className="text-sm text-danger">{error}</p>
              <Button type="button" onClick={onRetry}>
                Try again
              </Button>
            </div>
          ) : null}
        </form>
      )}
    </Card>
  );
}
