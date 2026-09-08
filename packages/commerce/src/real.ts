import {
  keccak256,
  stringToHex,
  toBytes,
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
  ERC8183_ABI,
  getContractAddress,
  HIRE_USER_ERRORS,
  TESTNET_DEFAULT_AMOUNT_WEI,
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
};

export type JobOnChainStatus = "Created" | "Funded" | "Completed";

export type HirePhase = "creating" | "funding" | "confirming";

export type RealHireOptions = {
  amount?: string;
  agentAddress?: Address;
  contractAddress?: Address;
  expectedChainId?: number;
  onPhase?: (phase: HirePhase) => void;
  onCreated?: (jobId: string) => void;
};

const ON_CHAIN_STATUS: JobOnChainStatus[] = ["Created", "Funded", "Completed"];
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

/** BSC Testnet (97) caps at 0.001 tBNB. Mock and mainnet keep the requested amount. */
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

function encodeJobData(intent: HireIntent): Hex {
  return stringToHex(JSON.stringify({ agentId: intent.agentId, task: intent.task }));
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
    const timer = (globalThis as { setTimeout?: (fn: () => void, wait: number) => unknown }).setTimeout;
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
  if (Object.values(HIRE_USER_ERRORS).includes(message as (typeof HIRE_USER_ERRORS)[keyof typeof HIRE_USER_ERRORS])) {
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
  if (lower.includes("insufficient funds") || lower.includes("exceeds the balance")) {
    commerceError("insufficient funds", err);
    return new Error(HIRE_USER_ERRORS.funds);
  }
  if (lower.includes("gas required exceeds") || lower.includes("intrinsic gas")) {
    commerceError("insufficient funds", err);
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

export async function assertAffordable(
  clients: CommerceWriteClients,
  amountWei: bigint,
): Promise<void> {
  const account = await requireAccount(clients.walletClient);
  commerceLog("hire:balance");
  const balance = await clients.publicClient.getBalance({ address: account });
  commerceLog(`hire:balance have=${balance.toString()} need=${(amountWei + GAS_BUFFER_WEI).toString()}`);
  if (balance < amountWei + GAS_BUFFER_WEI) {
    commerceError("insufficient funds");
    throw new Error(HIRE_USER_ERRORS.funds);
  }
}

async function writeSimulatedContract(
  clients: CommerceWriteClients,
  call: {
    address: Address;
    functionName: "createJob" | "fundJob";
    args: readonly unknown[];
    account: Address;
    value?: bigint;
  },
): Promise<{ txHash: Hex; result?: unknown }> {
  const request = {
    address: call.address,
    abi: ERC8183_ABI,
    functionName: call.functionName,
    args: call.args,
    account: call.account,
    ...(call.value != null ? { value: call.value } : {}),
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
    commerceError(`${call.functionName} simulation failed`, err);
    throw mapHireError(err);
  }
  const txHash = await clients.walletClient.writeContract(simulated.request);
  commerceLog(
    call.functionName === "createJob" ? "hire:create:submitted" : "hire:fund:submitted",
  );
  commerceLog(
    call.functionName === "createJob"
      ? `hire:create:txHash ${txHash}`
      : `hire:fund:txHash ${txHash}`,
  );
  const receipt = await clients.publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status === "reverted") {
    commerceError("transaction confirmation failed");
    commerceError("contract reverted");
    throw new Error(HIRE_USER_ERRORS.reverted);
  }
  commerceLog(
    call.functionName === "createJob" ? "hire:create:confirmed" : "hire:fund:confirmed",
  );
  return { txHash, result: simulated.result };
}

export async function createRealJob(
  intent: HireIntent,
  clients: CommerceWriteClients,
  options?: RealHireOptions,
): Promise<RealHireResult> {
  const parsed = parseHireIntent(intent);
  const address = getContractAddress(options?.contractAddress);
  const amount = parseBudgetWei(
    resolveTestnetAmountWei(options?.amount ?? parsed.budgetWei, options?.expectedChainId),
  );
  const agent = resolveAgentAddress(parsed.agentId, options?.agentAddress);
  await requireAccount(clients.walletClient);
  await assertExpectedNetwork(clients, options?.expectedChainId);
  await assertAffordable(clients, amount);

  try {
    options?.onPhase?.("creating");
    commerceLog("hire:create:start");
    commerceLog(`hire:create:agent ${agent} amount=${amount.toString()}`);
    const { txHash, result } = await writeSimulatedContract(clients, {
      address,
      functionName: "createJob",
      args: [agent, amount, encodeJobData(parsed)],
      account: await requireAccount(clients.walletClient),
    });
    options?.onPhase?.("confirming");
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

export async function fundRealJob(
  jobId: string,
  amount: string,
  clients: CommerceWriteClients,
  options?: Pick<RealHireOptions, "contractAddress" | "onPhase" | "expectedChainId">,
): Promise<{ txHash: Hex }> {
  const address = getContractAddress(options?.contractAddress);
  const value = parseBudgetWei(amount);
  const parsedJobId = parseJobId(jobId);
  await requireAccount(clients.walletClient);
  await assertExpectedNetwork(clients, options?.expectedChainId);
  await assertAffordable(clients, value);

  try {
    options?.onPhase?.("funding");
    commerceLog("hire:fund:start");
    commerceLog(`hire:fund:jobId ${jobId}`);
    commerceLog(`hire:fund:amount ${value.toString()}`);
    const { txHash } = await writeSimulatedContract(clients, {
      address,
      functionName: "fundJob",
      args: [parsedJobId],
      account: await requireAccount(clients.walletClient),
      value,
    });
    options?.onPhase?.("confirming");
    return { txHash };
  } catch (err) {
    commerceError("fundJob failed", err);
    throw mapHireError(err);
  }
}

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
  const funded = await fundRealJob(created.jobId, amount, clients, options);
  return { jobId: created.jobId, txHash: funded.txHash, createTxHash: created.txHash };
}

export async function getJobStatus(
  jobId: string,
  publicClient: PublicClient,
  options?: Pick<RealHireOptions, "contractAddress">,
): Promise<{ status: JobOnChainStatus; agent: Address; amount: string }> {
  const address = getContractAddress(options?.contractAddress);
  const parsedJobId = parseJobId(jobId);
  commerceLog("hire:status");
  try {
    const result = await publicClient.readContract({
      address,
      abi: ERC8183_ABI,
      functionName: "getJob",
      args: [parsedJobId],
    });
    const index = Number(result[2]);
    const status = ON_CHAIN_STATUS[index] ?? "Created";
    commerceLog(`hire:status ${status}`);
    return {
      status,
      agent: result[0],
      amount: result[1].toString(),
    };
  } catch (err) {
    commerceError("status read failed", err);
    throw mapHireError(err);
  }
}

export async function waitForFundedStatus(
  jobId: string,
  publicClient: PublicClient,
  options?: Pick<RealHireOptions, "contractAddress" | "onPhase">,
): Promise<{ status: JobOnChainStatus; agent: Address; amount: string }> {
  options?.onPhase?.("confirming");
  let last: { status: JobOnChainStatus; agent: Address; amount: string } | undefined;
  for (let attempt = 0; attempt < STATUS_POLL_ATTEMPTS; attempt += 1) {
    last = await getJobStatus(jobId, publicClient, options);
    if (last.status === "Funded" || last.status === "Completed") {
      return last;
    }
    await delay(STATUS_POLL_MS);
  }
  commerceError("status not Funded");
  throw new Error(HIRE_USER_ERRORS.timeout);
}

/** `txHashes[0]` = createJob, `txHashes[1]` = fundJob when both exist. */
export function toFundedJobView(intent: HireIntent, result: RealHireResult): JobView {
  const parsed = parseHireIntent(intent);
  const txHashes = [result.createTxHash, result.txHash].filter((hash): hash is Hex => Boolean(hash));
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

export function onChainStatusToJobStatus(status: JobOnChainStatus): JobStatus {
  if (status === "Created") return "Open";
  if (status === "Completed") return "Completed";
  return "Funded";
}
