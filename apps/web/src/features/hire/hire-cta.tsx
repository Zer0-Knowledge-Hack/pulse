import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { Handshake, CircleCheck } from "lucide-react";
import type { Address, Hex } from "viem";
import type { AgentListing, JobView } from "@era/domain";
import {
  COMMERCE_CONTRACTS,
  TESTNET_DEFAULT_AMOUNT_WEI,
  assertAffordable,
  createRealJob,
  ensureAllowance,
  fundRealJob,
  getContractAddress,
  getJobStatus,
  mapHireError,
  registerJobPolicy,
  resolveTestnetAmountWei,
  setJobBudget,
  toFundedJobView,
  validateHireReady,
  waitForFundedStatus,
  type HirePhase,
} from "@era/commerce";
import { Button, Card, Lede, Meta, TextAreaField, TextField, useToast } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { WalletGlyph } from "@/components/layout/wallet-glyph";
import { useInbox } from "@/features/account/inbox";
import { formatAddress, uToWei, weiToU } from "@/lib/format";
import { targetChain } from "@/providers/network";
import {
  HireConfirmDialog,
  HireGateDialog,
  HireProgressDialog,
  HireSuccessDialog,
} from "./hire-confirm";
import { HIRE_CHAIN, HIRE_CHAIN_ID, hireLog, testnetExplorerTx } from "./hire-log";
import { resolveListingProvider } from "./hire-provider";
import {
  appendTxHash,
  clearHireRecord,
  readHireRecord,
  writeHireRecord,
  type StoredHireTx,
} from "./hire-storage";

type UiPhase =
  | "idle"
  | "preparing"
  | HirePhase
  | "funded"
  | "failed"
  | "rejected";

function commerceContract(): Address {
  try {
    return getContractAddress(undefined, HIRE_CHAIN_ID);
  } catch {
    return COMMERCE_CONTRACTS[HIRE_CHAIN_ID];
  }
}

function phaseCopy(phase: UiPhase): string {
  if (phase === "preparing") return "Preparing transaction…";
  if (phase === "creating") return "Waiting for wallet confirmation";
  if (phase === "budgeting") return "Waiting for wallet confirmation";
  if (phase === "registering") return "Waiting for wallet confirmation";
  if (phase === "approving") return "Waiting for wallet confirmation";
  if (phase === "funding") return "Waiting for wallet confirmation";
  if (phase === "confirming") return "Confirming transaction…";
  if (phase === "funded") return "Payment confirmed";
  return "Ready to hire";
}

function progressFromPhase(phase: UiPhase): {
  created: boolean;
  submitted: boolean;
  confirming: boolean;
  activating: boolean;
} {
  const order: UiPhase[] = [
    "creating",
    "budgeting",
    "registering",
    "approving",
    "funding",
    "confirming",
    "funded",
  ];
  const index = order.indexOf(phase);
  return {
    created: index >= 0,
    submitted: index >= 0 && phase !== "creating",
    confirming: index >= 5,
    activating: phase === "funded",
  };
}

function isCancelled(err: unknown): boolean {
  const message = mapHireError(err).message.toLowerCase();
  return message.includes("cancelled") || message.includes("canceled");
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
  const { address, isConnected, chainId, status: walletStatus } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { openConnectModal } = useConnectModal();
  const { switchChain, isPending: switching } = useSwitchChain();
  const target = targetChain();
  const toast = useToast();
  const { pushNotice, pushActivity, recordHire } = useInbox();
  const processingRef = useRef(false);
  const formId = useId();
  const provider = resolveListingProvider(agent);
  const contract = commerceContract();
  const [task, setTask] = useState(
    `Run a ${agent.category.replaceAll("_", " ")} pass and return the current signal plus a recommended action.`,
  );
  const [budgetU, setBudgetU] = useState(() => weiToU(TESTNET_DEFAULT_AMOUNT_WEI) || "0.001");
  const [job, setJob] = useState<JobView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ task?: string; budget?: string }>({});
  const [phase, setPhase] = useState<UiPhase>("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [gate, setGate] = useState<"wallet" | "network" | "fields" | "error" | "rejected" | null>(
    null,
  );
  const [resumeJobId, setResumeJobId] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | undefined>();

  const budgetWei = uToWei(budgetU);
  const amountWei = budgetWei
    ? resolveTestnetAmountWei(budgetWei, HIRE_CHAIN_ID)
    : TESTNET_DEFAULT_AMOUNT_WEI;
  const busy =
    processingRef.current ||
    phase === "preparing" ||
    phase === "creating" ||
    phase === "budgeting" ||
    phase === "registering" ||
    phase === "approving" ||
    phase === "funding" ||
    phase === "confirming";
  const inFlight = busy || phase === "creating";
  const wrongNetwork = isConnected && chainId !== HIRE_CHAIN_ID;
  const connecting = walletStatus === "connecting" || walletStatus === "reconnecting";

  useEffect(() => {
    if (gate === "wallet" && isConnected) setGate(null);
    if (gate === "network" && !wrongNetwork) setGate(null);
  }, [gate, isConnected, wrongNetwork]);

  useEffect(() => {
    if (!address || !publicClient) return;
    const stored = readHireRecord(agent.id, address);
    if (!stored?.jobId) return;
    let cancelled = false;
    hireLog("restore", { agentId: agent.id, wallet: address, jobId: stored.jobId });
    setPhase("confirming");
    setLastTx(stored.lastTxHash);
    getJobStatus(stored.jobId, publicClient, { expectedChainId: HIRE_CHAIN_ID })
      .then((onChain) => {
        if (cancelled) return;
        if (
          onChain.status === "Funded" ||
          onChain.status === "Submitted" ||
          onChain.status === "Completed"
        ) {
          const hashes = stored.txHashes.filter((hash) => /^0x[a-fA-F0-9]{64}$/.test(hash));
          setJob({
            jobId: stored.jobId!,
            agentId: agent.id,
            budgetWei: stored.budgetWei,
            task: stored.task,
            status: onChain.status,
            txHashes: hashes,
            session: null,
            createdAt: stored.createdAt,
          });
          setPhase("funded");
          hireLog("hire status", { status: onChain.status, jobId: stored.jobId });
          return;
        }
        if (onChain.status === "Rejected" || onChain.status === "Expired") {
          clearHireRecord(agent.id, address);
          setResumeJobId(null);
          setPhase("idle");
          return;
        }
        setResumeJobId(stored.jobId!);
        setTask(stored.task);
        setBudgetU(weiToU(stored.budgetWei) || budgetU);
        setPhase("idle");
      })
      .catch(() => {
        if (cancelled) return;
        setResumeJobId(stored.jobId ?? null);
        setPhase("idle");
      });
    return () => {
      cancelled = true;
    };
  }, [address, agent.id, publicClient]);

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

  function blockedReason(): string | undefined {
    if (connecting) return "Connecting wallet...";
    if (!isConnected) return "Connect your wallet to continue.";
    if (wrongNetwork) return "Please switch to BNB Smart Chain Testnet.";
    if (!provider) return "This agent has no real ERC-8183 provider address.";
    if (!contract) return "Commerce contract is not configured.";
    if (!walletClient || !publicClient) return "Wallet is not ready.";
    return undefined;
  }

  function onReview(event: FormEvent) {
    event.preventDefault();
    if (processingRef.current || busy || phase === "funded") return;
    if (!isConnected) {
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

  function persist(
    record: StoredHireTx,
    extra?: Partial<StoredHireTx> & { hash?: string },
  ): StoredHireTx {
    let next = { ...record, ...extra };
    if (extra?.hash) next = appendTxHash(next, extra.hash);
    else writeHireRecord(next);
    if (next.lastTxHash) setLastTx(next.lastTxHash);
    return next;
  }

  async function executeHire() {
    if (processingRef.current) {
      hireLog("blocked duplicate submit");
      return;
    }
    if (!address || !walletClient || !publicClient || !provider || !budgetWei) return;
    const block = blockedReason();
    if (block) {
      setError(block);
      return;
    }

    processingRef.current = true;
    setError(null);
    setPhase("preparing");
    hireLog("agentId", { agentId: agent.id });
    hireLog("wallet", { wallet: address });
    hireLog("chainId", { chainId, expected: HIRE_CHAIN_ID });
    hireLog("contract", { contract });
    hireLog("function", { name: resumeJobId ? "resume" : "createJob" });

    const clients = { walletClient, publicClient };
    const options = {
      expectedChainId: HIRE_CHAIN_ID,
      agentAddress: provider,
      amount: amountWei,
      onPhase: (next: HirePhase) => {
        setPhase(next);
        if (next === "confirming") hireLog("waiting confirmation");
      },
    };

    let record: StoredHireTx =
      readHireRecord(agent.id, address) ?? {
        agentId: agent.id,
        buyer: address,
        task: task.trim(),
        budgetWei: amountWei,
        txHashes: [],
        createdAt: new Date().toISOString(),
      };
    record = persist({ ...record, task: task.trim(), budgetWei: amountWei });

    try {
      const intent = validateHireReady({
        intent: { agentId: agent.id, budgetWei: amountWei, task: task.trim() },
        chain: HIRE_CHAIN,
        connected: true,
        chainId,
      });

      await assertAffordable(clients, BigInt(amountWei), { chainId: HIRE_CHAIN_ID });

      let jobId = record.jobId ?? resumeJobId ?? undefined;
      if (jobId) {
        const existing = await getJobStatus(jobId, publicClient, {
          expectedChainId: HIRE_CHAIN_ID,
        });
        if (
          existing.status === "Funded" ||
          existing.status === "Submitted" ||
          existing.status === "Completed"
        ) {
          const hashes = record.txHashes.filter((hash) => /^0x[a-fA-F0-9]{64}$/.test(hash));
          finishHire(
            {
              jobId,
              agentId: agent.id,
              budgetWei: amountWei,
              task: task.trim(),
              status: existing.status,
              txHashes: hashes,
              session: null,
              createdAt: record.createdAt,
            },
            record,
          );
          return;
        }
        hireLog("resume job", { jobId, status: existing.status });
      } else {
        setPhase("creating");
        const created = await createRealJob(intent, clients, options);
        jobId = created.jobId;
        record = persist(record, { jobId, hash: created.txHash });
        setLastTx(created.txHash);
        hireLog("transaction submitted", { step: "createJob", txHash: created.txHash, jobId });
      }

      setPhase("budgeting");
      const budget = await setJobBudget(jobId, amountWei, clients, options);
      record = persist(record, { jobId, hash: budget.txHash });
      hireLog("transaction submitted", { step: "setBudget", txHash: budget.txHash });

      setPhase("registering");
      const registered = await registerJobPolicy(jobId, clients, options);
      record = persist(record, { jobId, hash: registered.txHash });
      hireLog("transaction submitted", { step: "registerJob", txHash: registered.txHash });

      const approval = await ensureAllowance(amountWei, clients, options);
      if (approval.txHash) {
        record = persist(record, { jobId, hash: approval.txHash });
        hireLog("transaction submitted", { step: "approve", txHash: approval.txHash });
      }

      setPhase("funding");
      const funded = await fundRealJob(jobId, amountWei, clients, options);
      record = persist(record, { jobId, hash: funded.txHash });
      setLastTx(funded.txHash);
      hireLog("txHash", { txHash: funded.txHash });
      hireLog("waiting confirmation");

      const onChain = await waitForFundedStatus(jobId, publicClient, options);
      const view = toFundedJobView(intent, {
        jobId,
        txHash: funded.txHash,
        createTxHash: record.txHashes[0] as Hex | undefined,
        budgetTxHash: record.txHashes[1] as Hex | undefined,
        registerTxHash: record.txHashes[2] as Hex | undefined,
        approveTxHash: approval.txHash,
      });
      hireLog("transaction confirmed", { status: onChain.status, jobId });
      finishHire({ ...view, status: onChain.status, txHashes: record.txHashes }, record);
    } catch (err) {
      const mapped = mapHireError(err);
      hireLog("hire status", { error: mapped.message, jobId: record.jobId });
      if (record.jobId) setResumeJobId(record.jobId);
      setConfirmOpen(false);
      processingRef.current = false;
      if (isCancelled(err)) {
        setPhase("rejected");
        setGate("rejected");
        toast.push("Transaction cancelled.", "muted");
        return;
      }
      setError(mapped.message);
      setPhase("failed");
      setGate("error");
      pushNotice({
        kind: "hire_failed",
        title: "Hire failed",
        description: mapped.message,
        href: `/agents/${agent.id}`,
      });
      toast.push(mapped.message, "danger");
    }
  }

  function finishHire(created: JobView, record: StoredHireTx) {
    const hashes = created.txHashes.filter((hash) => /^0x[a-fA-F0-9]{64}$/.test(hash));
    const view = { ...created, txHashes: hashes };
    setJob(view);
    setPhase("funded");
    setConfirmOpen(false);
    setSuccessOpen(true);
    setResumeJobId(null);
    processingRef.current = false;
    persist(record, { jobId: created.jobId });
    recordHire({
      jobId: created.jobId,
      agentId: agent.id,
      agentName: agent.name,
      category: agent.category,
      status: created.status,
      budgetWei: created.budgetWei,
      createdAt: created.createdAt,
      txHash: hashes.at(-1),
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
      description: hashes.at(-1) ?? created.jobId,
      status: created.status,
      href: `/agents/${agent.id}`,
    });
    toast.push("Hire successful.", "ok");
    hireLog("hire status", { status: created.status, jobId: created.jobId });
  }

  function onRetry() {
    if (processingRef.current) return;
    setError(null);
    setPhase("idle");
    setGate(null);
  }

  const block = blockedReason();
  const canPay = !block && Boolean(budgetWei) && Object.keys(validateFieldsPreview()).length === 0;

  function validateFieldsPreview(): { task?: string; budget?: string } {
    const next: { task?: string; budget?: string } = {};
    const trimmed = task.trim();
    if (!trimmed || trimmed.length < 8 || trimmed.length > 500) next.task = "invalid";
    if (!budgetWei) next.budget = "invalid";
    return next;
  }

  const explorer = lastTx ? testnetExplorerTx(lastTx) : job?.txHashes.at(-1)
    ? testnetExplorerTx(job.txHashes.at(-1) ?? "")
    : null;
  const progressOpen = confirmOpen === false && inFlight && phase !== "funded" && phase !== "idle";

  return (
    <Card id="hire" className="space-y-3 scroll-mt-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Meta>Activate</Meta>
          <h2 className="section-title mt-1">Hire {agent.name}</h2>
          <Lede className="mt-1">BNB Smart Chain Testnet · chain ID 97 · ERC-8183 in $U</Lede>
        </div>
        <div className="flex items-center gap-2">
          <span className="lg:hidden">
            <WalletGlyph />
          </span>
          <span className="hidden lg:inline-flex">
            <ConnectButton showBalance={false} chainStatus="icon" />
          </span>
        </div>
      </div>

      {job && phase === "funded" ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-ok">
            <Icon icon={CircleCheck} className="text-ok" />
            Hire successful
          </p>
          <p className="text-sm">{agent.name} is now active.</p>
          <p className="meta">BNB Smart Chain Testnet</p>
          {job.txHashes.at(-1) ? (
            <p className="break-all font-mono text-xs text-muted">
              Transaction {job.txHashes.at(-1)}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            {explorer ? (
              <a href={explorer} rel="noreferrer" target="_blank">
                <Button>View transaction</Button>
              </a>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => document.getElementById("main")?.scrollTo({ top: 0 })}
            >
              View agent
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={onReview} noValidate>
          {connecting ? <p className="text-sm text-muted">Connecting wallet...</p> : null}
          {resumeJobId ? (
            <p className="rounded-xl border border-accent/40 bg-ink px-3 py-2 text-sm">
              A hire is already open on-chain (job {resumeJobId}). Continue to finish funding. This
              will not open a second job.
            </p>
          ) : null}
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
            hint={`Settles as ${weiToU(amountWei) || amountWei} $U on BSC Testnet (max 0.001 $U).`}
          />
          <dl className="grid gap-2 rounded-xl border border-line bg-ink px-3 py-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="meta">Network</dt>
              <dd>BNB Smart Chain Testnet</dd>
            </div>
            <div>
              <dt className="meta">Chain ID</dt>
              <dd>97</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="meta">Contract</dt>
              <dd className="break-all font-mono text-xs">{contract}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="meta">Provider</dt>
              <dd className="break-all font-mono text-xs">
                {provider ? formatAddress(provider) : "Not configured"}
              </dd>
            </div>
          </dl>
          {wrongNetwork ? (
            <div className="space-y-2">
              <p className="text-sm text-danger">
                Wrong network. Please switch to BNB Smart Chain Testnet.
              </p>
              <Button
                type="button"
                loading={switching}
                onClick={() => switchChain?.({ chainId: HIRE_CHAIN_ID })}
              >
                {switching ? "Switching…" : "Switch network"}
              </Button>
            </div>
          ) : !isConnected ? (
            <p className="text-sm text-muted">Connect your wallet to continue.</p>
          ) : !provider ? (
            <p className="text-sm text-danger">
              This agent has no real provider address. Hire is disabled.
            </p>
          ) : null}
          <Button type="submit" className="w-full sm:w-auto" disabled={busy || phase === "funded"} loading={busy}>
            {busy ? phaseCopy(phase) : resumeJobId ? "Continue hire" : "Hire agent"}
          </Button>
          {phase === "rejected" ? (
            <p className="text-sm text-muted">Transaction cancelled. You can try again.</p>
          ) : null}
          {phase === "failed" && error ? (
            <div className="space-y-2">
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
              {lastTx && testnetExplorerTx(lastTx) ? (
                <a
                  href={testnetExplorerTx(lastTx) ?? undefined}
                  rel="noreferrer"
                  target="_blank"
                  className="text-sm text-accent hover:underline"
                >
                  View transaction
                </a>
              ) : null}
              <Button type="button" onClick={onRetry} disabled={busy}>
                Try again
              </Button>
              {resumeJobId ? (
                <p className="text-xs text-muted">
                  A job is already on-chain. Try again continues that job and will not create a
                  second payment from scratch.
                </p>
              ) : null}
            </div>
          ) : null}
        </form>
      )}

      <p className="sr-only" aria-live="polite">
        {busy ? phaseCopy(phase) : ""}
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
        onSwitch={switchChain ? () => switchChain({ chainId: target.id }) : undefined}
        switching={switching}
      />
      <HireConfirmDialog
        open={confirmOpen && !inFlight}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void executeHire()}
        agent={agent}
        task={task.trim()}
        budgetWei={amountWei}
        contractAddress={contract}
        provider={provider ?? ""}
        busy={busy}
        canPay={canPay && !wrongNetwork && isConnected}
        blockedReason={block}
      />
      <HireProgressDialog
        open={Boolean(inFlight && phase !== "funded" && (confirmOpen || progressOpen || busy))}
        agentName={agent.name}
        phaseLabel={phaseCopy(phase)}
        progress={progressFromPhase(phase)}
        txHash={lastTx}
      />
      <HireSuccessDialog
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        agentName={agent.name}
        txHash={job?.txHashes.at(-1)}
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
          <p className="text-xs text-muted">Hire on BSC Testnet</p>
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
