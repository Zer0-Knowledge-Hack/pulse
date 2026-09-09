import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { Handshake, CircleCheck } from "lucide-react";
import type { Address } from "viem";
import type { AgentListing, JobView } from "@era/domain";
import {
  createJob as createCommerceJob,
  getJob as getCommerceJob,
  mapHireError,
  validateHireReady,
  type HirePhase,
} from "@era/commerce";
import { Button, Card, Lede, Meta, TextAreaField, TextField, useToast } from "@/components/ui";
import {
  createJob as createMockJobViaApi,
  getJob as getMockJobViaApi,
  isLocalChain,
  revokeJobSession,
} from "@/lib/api";
import { formatDateTime, uToWei, weiToU } from "@/lib/format";
import { HireConfirmDialog, HireGateDialog, RevokeConfirmDialog } from "./hire-confirm";
import { WalletGlyph } from "@/components/layout/wallet-glyph";
import { targetChain } from "@/providers/network";
import { Icon } from "@/components/ui/icon";
import { useInbox } from "@/features/account/inbox";

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

/**
 * A live hire is four wallet signatures: open the job, set its budget,
 * approve $U, then fund. Each phase says which one is on screen, so the
 * buyer is not surprised by a second or third prompt.
 */
function phaseLabel(phase: UiPhase): string {
  if (phase === "preparing") return "Preparing…";
  if (phase === "creating") return "1 of 4 · Confirm the job in your wallet…";
  if (phase === "budgeting") return "2 of 4 · Confirm the budget…";
  if (phase === "approving") return "3 of 4 · Approve $U spending…";
  if (phase === "funding") return "4 of 4 · Confirm the payment…";
  if (phase === "confirming") return "Processing… we’re checking the payment.";
  return "Hire";
}

export function HireCTA({
  agent,
  className,
}: {
  agent: AgentListing;
  className?: string;
}) {
  return (
    <Link to="/agents/$agentId" params={{ agentId: agent.id }} hash="hire" className={className}>
      <Button className="w-full">
        Hire
        <Icon icon={Handshake} />
      </Button>
    </Link>
  );
}

export function HirePanel({ agent }: { agent: AgentListing }) {
  const { isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { openConnectModal } = useConnectModal();
  const { switchChain, isPending: switching } = useSwitchChain();
  const target = targetChain();
  const local = isLocalChain();
  const chain = hireChain();
  const toast = useToast();
  const { pushNotice, pushActivity, recordHire } = useInbox();
  const processingRef = useRef(false);
  const restoredRef = useRef(false);
  const formId = useId();
  const [task, setTask] = useState(
    `Run a ${agent.category.replaceAll("_", " ")} pass and return the current signal plus a recommended action.`,
  );
  const [budgetU, setBudgetU] = useState("0.1");
  const [job, setJob] = useState<JobView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ task?: string; budget?: string }>({});
  const [phase, setPhase] = useState<UiPhase>("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [gate, setGate] = useState<"wallet" | "network" | "fields" | "error" | null>(null);

  const budgetWei = uToWei(budgetU);
  const busy =
    phase === "preparing" ||
    phase === "creating" ||
    phase === "budgeting" ||
    phase === "approving" ||
    phase === "funding" ||
    phase === "confirming";
  const wrongNetwork =
    !local && isConnected && chainId !== (chain === "bsc-mainnet" ? 56 : 97);
  const canHire =
    local || (isConnected && Boolean(walletClient) && Boolean(publicClient) && !wrongNetwork);

  useEffect(() => {
    if (gate === "wallet" && isConnected) setGate(null);
    if (gate === "network" && !wrongNetwork) setGate(null);
  }, [gate, isConnected, wrongNetwork]);

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

  function validateFields(): { task?: string; budget?: string } {
    const next: { task?: string; budget?: string } = {};
    const trimmed = task.trim();
    if (!trimmed) next.task = "Describe what the agent should do.";
    else if (trimmed.length < 8) next.task = "Use at least 8 characters so the job is clear.";
    else if (trimmed.length > 500) next.task = "Keep the task under 500 characters.";
    if (!budgetU.trim()) next.budget = "Enter a $U budget.";
    else if (!budgetWei) next.budget = "Enter a positive $U amount with up to 18 decimals.";
    setFieldErrors(next);
    return next;
  }

  function onReview(event: FormEvent) {
    event.preventDefault();
    if (processingRef.current || busy) return;
    if (!local && !isConnected) {
      setGate("wallet");
      return;
    }
    if (wrongNetwork) {
      setGate("network");
      return;
    }
    const next = validateFields();
    if (Object.keys(next).length > 0) {
      setGate("fields");
      return;
    }
    setError(null);
    setConfirmOpen(true);
  }

  async function executeHire() {
    if (processingRef.current) return;
    if (!budgetWei) return;
    processingRef.current = true;
    setError(null);
    setPhase("preparing");
    toast.push("Hire started.", "ok");
    try {
      const intent = validateHireReady({
        intent: { agentId: agent.id, budgetWei, task: task.trim() },
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
        setConfirmOpen(false);
        rememberHire(created);
        toast.push("Hire successful.", "ok");
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
          onPhase: (next) => {
            setPhase(next);
            if (next === "confirming") toast.push("Transaction pending.", "muted");
          },
        onCreated: (jobId) => storeJobId(agent.id, jobId),
      });
      storeJobId(agent.id, created.jobId);
      setJob(created);
      setPhase("funded");
      setConfirmOpen(false);
      rememberHire(created);
      toast.push("Hire successful.", "ok");
    } catch (err) {
      setError(mapHireError(err).message);
      setPhase("failed");
      setConfirmOpen(false);
      setGate("error");
      pushNotice({
        kind: "hire_failed",
        title: "Hire failed",
        description: mapHireError(err).message,
        href: `/agents/${agent.id}`,
      });
      toast.push("Hire failed.", "danger");
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
      setRevokeOpen(false);
      recordHire({
        jobId: next.jobId,
        agentId: agent.id,
        agentName: agent.name,
        category: agent.category,
        status: next.session?.revoked ? "Expired" : next.status,
        budgetWei: next.budgetWei,
        createdAt: next.createdAt,
        txHash: next.txHashes[0],
      });
      pushActivity({
        type: "revoke",
        title: `Stopped access for ${agent.name}`,
        description: next.jobId,
        status: "Revoked",
      });
      toast.push("Access stopped.", "ok");
    } catch (err) {
      setError(mapHireError(err).message);
      toast.push("Could not stop access.", "danger");
    } finally {
      processingRef.current = false;
    }
  }

  function onRetry() {
    setError(null);
    setPhase("idle");
  }

  function rememberHire(created: JobView) {
    recordHire({
      jobId: created.jobId,
      agentId: agent.id,
      agentName: agent.name,
      category: agent.category,
      status: created.status,
      budgetWei: created.budgetWei,
      createdAt: created.createdAt,
      txHash: created.txHashes[0],
    });
    pushNotice({
      kind: "hire_success",
      title: "Hire successful",
      description: `${agent.name} is funded.`,
      href: `/agents/${agent.id}`,
    });
    pushActivity({
      type: "hire",
      title: `Hired ${agent.name}`,
      description: created.jobId,
      status: created.status,
      href: `/agents/${agent.id}`,
    });
  }

  return (
    <Card id="hire" className="space-y-3 scroll-mt-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Meta>Activate</Meta>
          <h2 className="section-title mt-1">Hire {agent.name}</h2>
          <Lede className="mt-1">
            {local
              ? "No wallet needed. We’ll mark this hire as complete."
              : "Confirm in your wallet. We’ll tell you when it’s done."}
          </Lede>
        </div>
        {!local ? (
          <div className="flex items-center gap-2">
            <span className="lg:hidden">
              <WalletGlyph />
            </span>
            <span className="hidden lg:inline-flex">
              <ConnectButton showBalance={false} chainStatus="icon" />
            </span>
          </div>
        ) : null}
      </div>

      {job && phase === "funded" ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-ok">
            <Icon icon={CircleCheck} className="text-ok" />
            Hire complete
          </p>
          {job.txHashes[0] ? (
            <p className="break-all font-mono text-xs text-muted">Receipt {job.txHashes[0]}</p>
          ) : null}
          {job.session ? (
            <div className="rounded-xl border border-line p-3 text-sm">
              <p className="font-mono text-[11px] uppercase text-muted">Access</p>
              <p className="mt-2">Spend cap {weiToU(job.session.spendCapWei) || job.session.spendCapWei} $U</p>
              <p>Expires {formatDateTime(job.session.expiry)}</p>
              <p className={job.session.revoked ? "text-danger" : "text-ok"}>
                {job.session.revoked ? "Access stopped" : "Access active"}
              </p>
              {!job.session.revoked ? (
                <Button className="mt-3" variant="danger" onClick={() => setRevokeOpen(true)}>
                  Stop access
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <form className="space-y-3" onSubmit={onReview} noValidate>
          <ol className="grid grid-cols-3 gap-2 font-mono text-[11px] uppercase tracking-wide text-muted">
            <li className="border-b-2 border-accent pb-1 text-paper">1. Review</li>
            <li className="border-b-2 border-line pb-1">2. Confirm</li>
            <li className="border-b-2 border-line pb-1">3. Fund</li>
          </ol>
          <TextAreaField
            id={`${formId}-task`}
            label="What should it do?"
            rows={3}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            required
            disabled={busy}
            error={fieldErrors.task}
            maxLength={500}
          />
          <TextField
            id={`${formId}-budget`}
            label="Budget ($U)"
            inputMode="decimal"
            value={budgetU}
            onChange={(e) => setBudgetU(e.target.value)}
            required
            disabled={busy}
            error={fieldErrors.budget}
            hint={budgetWei ? `Settles on-chain as ${budgetWei} wei` : "Paid in $U with 18 decimals."}
          />
          {wrongNetwork ? (
            <p className="text-sm text-danger">Wrong network. Switch before you hire.</p>
          ) : !canHire ? (
            <p className="text-sm text-muted">Wallet not connected. You can still review, then connect.</p>
          ) : null}
          <Button type="submit" className="w-full sm:w-auto" disabled={busy} loading={busy}>
            {busy ? phaseLabel(phase) : "Review hire"}
          </Button>
          {phase === "failed" && error ? (
            <div className="space-y-2">
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
              <Button type="button" onClick={onRetry}>
                Retry
              </Button>
            </div>
          ) : null}
        </form>
      )}

      <p className="sr-only" aria-live="polite">
        {busy ? phaseLabel(phase) : ""}
      </p>

      <HireGateDialog
        open={gate !== null}
        kind={gate}
        onClose={() => setGate(null)}
        details={gate === "fields" ? fieldErrors.task || fieldErrors.budget : error ?? undefined}
        onConnect={() => {
          setGate(null);
          openConnectModal?.();
        }}
        onSwitch={
          target && switchChain
            ? () => switchChain({ chainId: target.id })
            : undefined
        }
        switching={switching}
      />
      <HireConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void executeHire()}
        agent={agent}
        task={task.trim()}
        budgetWei={budgetWei ?? ""}
        local={local}
        busy={busy}
      />
      <RevokeConfirmDialog
        open={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        onConfirm={() => void onRevoke()}
        busy={busy}
      />
    </Card>
  );
}

export function HireStickyBar({
  agent,
  visible,
}: {
  agent: AgentListing;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-x-3 z-30 rounded-2xl border border-line bg-ink/95 p-2.5 shadow-lg backdrop-blur lg:hidden bottom-[calc(3.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{agent.name}</p>
          <p className="text-xs text-muted">Hire with $U</p>
        </div>
        <Button
          onClick={() =>
            document.getElementById("hire")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        >
          Hire
        </Button>
      </div>
    </div>
  );
}
