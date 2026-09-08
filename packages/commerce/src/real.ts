import {
  keccak256,
  toBytes,
  type Abi,
  type Account,
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
  type Transport,
  type WalletClient,
} from "viem";
import { hireIntentSchema, type HireIntent, type JobStatus, type JobView } from "@era/domain";
import {
  ERC20_ABI,
  ERC8183_ABI,
  getContractAddress,
  getPaymentToken,
  HIRE_USER_ERRORS,
  ON_CHAIN_STATUS,
  resolveExpiry,
  TESTNET_DEFAULT_AMOUNT_WEI,
  ZERO_ADDRESS,
} from "./config";
import { commerceError, commerceLog } from "./log";

export type CommerceWriteClients = {
  publicClient: PublicClient;
  walletClient: WalletClient<Transport, Chain | undefined, Account | undefined>;
};

export type RealHireResult = {
  jobId: string;
  txHash: Hex;
  createTxHash?: Hex;
  budgetTxHash?: Hex;
  approveTxHash?: Hex;
};

/** Job status as the contract reports it. Same six values as the domain. */
export type JobOnChainStatus = (typeof ON_CHAIN_STATUS)[number];

export type HirePhase =
  | "creating"
  | "budgeting"
  | "approving"
  | "funding"
  | "confirming";

export type RealHireOptions = {
  amount?: string;
  agentAddress?: Address;
  contractAddress?: Address;
  paymentToken?: Address;
  expectedChainId?: number;
  onPhase?: (phase: HirePhase) => void;
  onCreated?: (jobId: string) => void;
};

type WriteFn = "createJob" | "setBudget" | "fund";

/** Gas headroom in native tBNB. The budget itself is paid in `$U`. */
const GAS_BUFFER_WEI = 10n ** 15n;
const STATUS_POLL_MS = 2_000;
const STATUS_POLL_ATTEMPTS = 15;

export function resolveAgentAddress(agentId: string, override?: Address): Address {
  if (override) {
    commerceLog(`hire:agent ${override}`);
    return override;
  }
  if (/^0x[a-fA-F0-9]{40}$/.test(agentId)) {
    commerceLog(`hire:agent ${agentId}`);
    return agentId as Address;
  }
  const derived = `0x${keccak256(toBytes(agentId)).slice(26)}` as Address;
  commerceLog(`hire:agent ${derived} (derived from agentId)`);
  return derived;
}

export function parseBudgetWei(raw: string): bigint {
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) {
    commerceError("validation");
    throw new Error(HIRE_USER_ERRORS.amount);
  }
  const amount = BigInt(raw);
  if (amount <= 0n) {
    commerceError("validation");
    throw new Error(HIRE_USER_ERRORS.amount);
  }
  return amount;
}

/** BSC Testnet (97) caps at 0.001 `$U`. Mock and mainnet keep the requested amount. */
export function resolveTestnetAmountWei(requestedWei: string, expectedChainId?: number): string {
  parseBudgetWei(requestedWei);
  if (expectedChainId !== 97) return requestedWei;
  if (BigInt(requestedWei) > BigInt(TESTNET_DEFAULT_AMOUNT_WEI)) {
    commerceLog(`hire:amount ${TESTNET_DEFAULT_AMOUNT_WEI}`);
    return TESTNET_DEFAULT_AMOUNT_WEI;
  }
  commerceLog(`hire:amount ${requestedWei}`);
  return requestedWei;
}

export function parseHireIntent(input: HireIntent): HireIntent {
  try {
    const parsed = hireIntentSchema.parse(input);
    parseBudgetWei(parsed.budgetWei);
    if (!parsed.agentId.trim() || !parsed.task.trim()) {
      commerceError("validation");
      throw new Error(HIRE_USER_ERRORS.agent);
    }
    commerceLog("hire:validation");
    return parsed;
  } catch (err) {
    if (err instanceof Error && Object.values(HIRE_USER_ERRORS).includes(err.message as never)) {
      throw err;
    }
    commerceError("validation", err);
    throw new Error(HIRE_USER_ERRORS.generic);
  }
}

/**
 * `createJob` takes a plain string description, which is what the agent
 * reads to learn what it was hired for. JSON keeps the agent id alongside
 * the task without needing a second call.
 */
export function encodeJobDescription(intent: HireIntent): string {
  return JSON.stringify({ agentId: intent.agentId, task: intent.task });
}

function parseJobId(jobId: string): bigint {
  if (typeof jobId !== "string" || !/^\d+$/.test(jobId)) {
    commerceError("validation");
    throw new Error(HIRE_USER_ERRORS.generic);
  }
  return BigInt(jobId);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = (globalThis as { setTimeout?: (fn: () => void, wait: number) => unknown })
      .setTimeout;
    if (!timer) {
      resolve();
      return;
    }
    timer(resolve, ms);
  });
}

async function requireAccount(
  walletClient: CommerceWriteClients["walletClient"],
): Promise<Address> {
  if (walletClient.account?.address) {
    commerceLog("hire:wallet");
    return walletClient.account.address;
  }
  const [address] = await walletClient.getAddresses();
  if (!address) {
    commerceError("wallet not connected");
    throw new Error(HIRE_USER_ERRORS.connect);
  }
  commerceLog("hire:wallet");
  return address;
}

async function assertExpectedNetwork(
  clients: CommerceWriteClients,
  expected?: number,
): Promise<number> {
  const received = await clients.publicClient.getChainId();
  if (expected == null) {
    commerceLog(`hire:network received=${received}`);
    return received;
  }
  commerceLog(`hire:network expected=${expected} received=${received}`);
  if (received !== expected) {
    commerceError("wrong network");
    throw new Error(HIRE_USER_ERRORS.network);
  }
  return received;
}

export function mapHireError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  if (
    Object.values(HIRE_USER_ERRORS).includes(
      message as (typeof HIRE_USER_ERRORS)[keyof typeof HIRE_USER_ERRORS],
    )
  ) {
    return err instanceof Error ? err : new Error(message);
  }
  const lower = message.toLowerCase();
  if (
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("rejected the request")
  ) {
    commerceError("transaction rejected", err);
    return new Error(HIRE_USER_ERRORS.cancelled);
  }
  if (lower.includes("enforcedpause") || lower.includes("pausable")) {
    commerceError("contract paused", err);
    return new Error(HIRE_USER_ERRORS.paused);
  }
  if (lower.includes("insufficient allowance") || lower.includes("erc20insufficientallowance")) {
    commerceError("insufficient allowance", err);
    return new Error(HIRE_USER_ERRORS.approve);
  }
  if (
    lower.includes("insufficient funds") ||
    lower.includes("exceeds the balance") ||
    lower.includes("erc20insufficientbalance")
  ) {
    commerceError("insufficient funds", err);
    return new Error(HIRE_USER_ERRORS.funds);
  }
  if (lower.includes("gas required exceeds") || lower.includes("intrinsic gas")) {
    commerceError("insufficient gas", err);
    return new Error(HIRE_USER_ERRORS.gas);
  }
  if (
    lower.includes("chain mismatch") ||
    lower.includes("wrong network") ||
    lower.includes("does not match the target chain")
  ) {
    commerceError("wrong network", err);
    return new Error(HIRE_USER_ERRORS.network);
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    commerceError("transaction confirmation failed", err);
    return new Error(HIRE_USER_ERRORS.timeout);
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network request failed") ||
    lower.includes("http request failed") ||
    lower.includes("rpc")
  ) {
    commerceError("RPC failed", err);
    return new Error(HIRE_USER_ERRORS.rpc);
  }
  if (
    lower.includes("returned no data") ||
    lower.includes("not a contract") ||
    lower.includes("contractfunctionexecutionerror") ||
    lower.includes("execution reverted")
  ) {
    commerceError("contract reverted", err);
    return new Error(HIRE_USER_ERRORS.reverted);
  }
  commerceError("unknown", err);
  return new Error(HIRE_USER_ERRORS.generic);
}

/**
 * The budget is denominated in `$U`, not in native currency, so both have
 * to be checked: `$U` covers the escrow, native tBNB covers gas.
 */
export async function assertAffordable(
  clients: CommerceWriteClients,
  amountWei: bigint,
  options?: { paymentToken?: Address; chainId?: number },
): Promise<void> {
  const account = await requireAccount(clients.walletClient);
  const token = getPaymentToken(options?.paymentToken, options?.chainId);
  commerceLog("hire:balance");

  const gas = await clients.publicClient.getBalance({ address: account });
  commerceLog(`hire:balance:gas have=${gas.toString()} need=${GAS_BUFFER_WEI.toString()}`);
  if (gas < GAS_BUFFER_WEI) {
    commerceError("insufficient gas");
    throw new Error(HIRE_USER_ERRORS.gas);
  }

  const balance = (await clients.publicClient.readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account],
  })) as bigint;
  commerceLog(`hire:balance:u have=${balance.toString()} need=${amountWei.toString()}`);
  if (balance < amountWei) {
    commerceError("insufficient funds");
    throw new Error(HIRE_USER_ERRORS.funds);
  }
}

async function writeSimulatedContract(
  clients: CommerceWriteClients,
  call: {
    address: Address;
    abi: Abi | readonly unknown[];
    functionName: string;
    args: readonly unknown[];
    account: Address;
    label: string;
  },
): Promise<{ txHash: Hex; result?: unknown }> {
  const request = {
    address: call.address,
    abi: call.abi,
    functionName: call.functionName,
    args: call.args,
    account: call.account,
  };
  let simulated: {
    request: Parameters<CommerceWriteClients["walletClient"]["writeContract"]>[0];
    result: unknown;
  };
  try {
    simulated = (await clients.publicClient.simulateContract(
      request as Parameters<CommerceWriteClients["publicClient"]["simulateContract"]>[0],
    )) as unknown as typeof simulated;
  } catch (err) {
    commerceError(`${call.label} simulation failed`, err);
    throw mapHireError(err);
  }
  const txHash = await clients.walletClient.writeContract(simulated.request);
  commerceLog(`hire:${call.label}:submitted`);
  commerceLog(`hire:${call.label}:txHash ${txHash}`);
  const receipt = await clients.publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status === "reverted") {
    commerceError("transaction confirmation failed");
    commerceError("contract reverted");
    throw new Error(HIRE_USER_ERRORS.reverted);
  }
  commerceLog(`hire:${call.label}:confirmed`);
  return { txHash, result: simulated.result };
}

function writeCommerce(
  clients: CommerceWriteClients,
  address: Address,
  functionName: WriteFn,
  args: readonly unknown[],
  account: Address,
  label: string,
) {
  return writeSimulatedContract(clients, {
    address,
    abi: ERC8183_ABI,
    functionName,
    args,
    account,
    label,
  });
}

/**
 * Step 1 of the ERC-8183 lifecycle: open the job.
 *
 * The buyer is registered as the `evaluator`, which is what makes
 * settlement a user action rather than something the marketplace does on
 * their behalf. `hook` is the zero address, matching the SDK default.
 */
export async function createRealJob(
  intent: HireIntent,
  clients: CommerceWriteClients,
  options?: RealHireOptions,
): Promise<{ jobId: string; txHash: Hex }> {
  const parsed = parseHireIntent(intent);
  const address = getContractAddress(options?.contractAddress, options?.expectedChainId);
  const amount = parseBudgetWei(
    resolveTestnetAmountWei(options?.amount ?? parsed.budgetWei, options?.expectedChainId),
  );
  const agent = resolveAgentAddress(parsed.agentId, options?.agentAddress);
  const account = await requireAccount(clients.walletClient);
  await assertExpectedNetwork(clients, options?.expectedChainId);
  await assertAffordable(clients, amount, {
    paymentToken: options?.paymentToken,
    chainId: options?.expectedChainId,
  });

  try {
    options?.onPhase?.("creating");
    commerceLog("hire:create:start");
    commerceLog(`hire:create:agent ${agent} amount=${amount.toString()}`);
    const { txHash, result } = await writeCommerce(
      clients,
      address,
      "createJob",
      [agent, account, resolveExpiry(), encodeJobDescription(parsed), ZERO_ADDRESS],
      account,
      "create",
    );
    if (result == null || result === "") {
      commerceError("createJob failed");
      throw new Error(HIRE_USER_ERRORS.reverted);
    }
    const jobId = String(result);
    commerceLog(`hire:jobId ${jobId}`);
    return { jobId, txHash };
  } catch (err) {
    commerceError("createJob failed", err);
    throw mapHireError(err);
  }
}

/** Step 2: record the budget on the job before funding it. */
export async function setJobBudget(
  jobId: string,
  amount: string,
  clients: CommerceWriteClients,
  options?: Pick<RealHireOptions, "contractAddress" | "expectedChainId" | "onPhase">,
): Promise<{ txHash: Hex }> {
  const address = getContractAddress(options?.contractAddress, options?.expectedChainId);
  const value = parseBudgetWei(amount);
  const account = await requireAccount(clients.walletClient);
  try {
    options?.onPhase?.("budgeting");
    commerceLog(`hire:budget:start jobId=${jobId} amount=${value.toString()}`);
    const { txHash } = await writeCommerce(
      clients,
      address,
      "setBudget",
      [parseJobId(jobId), value, "0x"],
      account,
      "budget",
    );
    return { txHash };
  } catch (err) {
    commerceError("setBudget failed", err);
    throw mapHireError(err);
  }
}

/**
 * Step 3: make sure the escrow can pull the budget.
 *
 * Approves the exact amount rather than an unbounded allowance, so a
 * cancelled or expired hire leaves nothing spendable behind. Skipped when
 * the existing allowance already covers the budget.
 */
export async function ensureAllowance(
  amount: string,
  clients: CommerceWriteClients,
  options?: Pick<
    RealHireOptions,
    "contractAddress" | "paymentToken" | "expectedChainId" | "onPhase"
  >,
): Promise<{ txHash?: Hex }> {
  const spender = getContractAddress(options?.contractAddress, options?.expectedChainId);
  const token = getPaymentToken(options?.paymentToken, options?.expectedChainId);
  const value = parseBudgetWei(amount);
  const account = await requireAccount(clients.walletClient);

  const current = (await clients.publicClient.readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [account, spender],
  })) as bigint;
  commerceLog(`hire:allowance have=${current.toString()} need=${value.toString()}`);
  if (current >= value) {
    commerceLog("hire:approve:skipped");
    return {};
  }

  try {
    options?.onPhase?.("approving");
    const { txHash } = await writeSimulatedContract(clients, {
      address: token,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, value],
      account,
      label: "approve",
    });
    return { txHash };
  } catch (err) {
    commerceError("approve failed", err);
    throw mapHireError(err);
  }
}

/**
 * Step 4: move the `$U` into escrow.
 *
 * `fund` is not payable. It pulls the approved ERC-20 budget, so nothing
 * is sent as native value here.
 */
export async function fundRealJob(
  jobId: string,
  amount: string,
  clients: CommerceWriteClients,
  options?: Pick<
    RealHireOptions,
    "contractAddress" | "paymentToken" | "expectedChainId" | "onPhase"
  >,
): Promise<{ txHash: Hex }> {
  const address = getContractAddress(options?.contractAddress, options?.expectedChainId);
  const value = parseBudgetWei(amount);
  const account = await requireAccount(clients.walletClient);
  await assertExpectedNetwork(clients, options?.expectedChainId);

  try {
    options?.onPhase?.("funding");
    commerceLog("hire:fund:start");
    commerceLog(`hire:fund:jobId ${jobId}`);
    commerceLog(`hire:fund:amount ${value.toString()}`);
    const { txHash } = await writeCommerce(
      clients,
      address,
      "fund",
      [parseJobId(jobId), value, "0x"],
      account,
      "fund",
    );
    options?.onPhase?.("confirming");
    return { txHash };
  } catch (err) {
    commerceError("fund failed", err);
    throw mapHireError(err);
  }
}

/** The full buyer lifecycle: create, budget, approve, fund. */
export async function createAndFundJob(
  intent: HireIntent,
  clients: CommerceWriteClients,
  options?: RealHireOptions,
): Promise<RealHireResult> {
  const parsed = parseHireIntent(intent);
  const amount = resolveTestnetAmountWei(
    options?.amount ?? parsed.budgetWei,
    options?.expectedChainId,
  );
  const created = await createRealJob(parsed, clients, { ...options, amount });
  options?.onCreated?.(created.jobId);
  const budget = await setJobBudget(created.jobId, amount, clients, options);
  const approval = await ensureAllowance(amount, clients, options);
  const funded = await fundRealJob(created.jobId, amount, clients, options);
  return {
    jobId: created.jobId,
    txHash: funded.txHash,
    createTxHash: created.txHash,
    budgetTxHash: budget.txHash,
    approveTxHash: approval.txHash,
  };
}

export async function getJobStatus(
  jobId: string,
  publicClient: PublicClient,
  options?: Pick<RealHireOptions, "contractAddress" | "expectedChainId">,
): Promise<{ status: JobOnChainStatus; agent: Address; amount: string }> {
  const address = getContractAddress(options?.contractAddress, options?.expectedChainId);
  const parsedJobId = parseJobId(jobId);
  commerceLog("hire:status");
  try {
    const job = (await publicClient.readContract({
      address,
      abi: ERC8183_ABI,
      functionName: "getJob",
      args: [parsedJobId],
    })) as {
      provider: Address;
      budget: bigint;
      status: number;
    };
    const status = ON_CHAIN_STATUS[Number(job.status)] ?? "Open";
    commerceLog(`hire:status ${status}`);
    return {
      status,
      agent: job.provider,
      amount: job.budget.toString(),
    };
  } catch (err) {
    commerceError("status read failed", err);
    throw mapHireError(err);
  }
}

export async function waitForFundedStatus(
  jobId: string,
  publicClient: PublicClient,
  options?: Pick<RealHireOptions, "contractAddress" | "expectedChainId" | "onPhase">,
): Promise<{ status: JobOnChainStatus; agent: Address; amount: string }> {
  options?.onPhase?.("confirming");
  let last: { status: JobOnChainStatus; agent: Address; amount: string } | undefined;
  for (let attempt = 0; attempt < STATUS_POLL_ATTEMPTS; attempt += 1) {
    last = await getJobStatus(jobId, publicClient, options);
    // Funded is the goal. Submitted and Completed mean the agent already
    // moved past it, which is still a funded job.
    if (last.status === "Funded" || last.status === "Submitted" || last.status === "Completed") {
      return last;
    }
    // Terminal failures. Polling these to the timeout would report
    // "taking longer than expected" for a job that is already dead.
    if (last.status === "Rejected") {
      commerceError("job rejected");
      throw new Error(HIRE_USER_ERRORS.rejected);
    }
    if (last.status === "Expired") {
      commerceError("job expired");
      throw new Error(HIRE_USER_ERRORS.expired);
    }
    await delay(STATUS_POLL_MS);
  }
  commerceError("status not Funded");
  throw new Error(HIRE_USER_ERRORS.timeout);
}

/** Transaction hashes in lifecycle order: create, budget, approve, fund. */
export function toFundedJobView(intent: HireIntent, result: RealHireResult): JobView {
  const parsed = parseHireIntent(intent);
  const txHashes = [
    result.createTxHash,
    result.budgetTxHash,
    result.approveTxHash,
    result.txHash,
  ].filter((hash): hash is Hex => Boolean(hash));
  return {
    jobId: result.jobId,
    agentId: parsed.agentId,
    budgetWei: parsed.budgetWei,
    task: parsed.task,
    status: "Funded",
    txHashes,
    session: null,
    createdAt: new Date().toISOString(),
  };
}

/** The contract's enum already uses the domain's own status names. */
export function onChainStatusToJobStatus(status: JobOnChainStatus): JobStatus {
  return status;
}
