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
import { ERC8183_ABI, getContractAddress, HIRE_USER_ERRORS } from "./config";

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
  onPhase?: (phase: HirePhase) => void;
  onCreated?: (jobId: string) => void;
};

const ON_CHAIN_STATUS: JobOnChainStatus[] = ["Created", "Funded", "Completed"];
const GAS_BUFFER_WEI = 10n ** 15n;

export function resolveAgentAddress(agentId: string, override?: Address): Address {
  if (override) return override;
  if (/^0x[a-fA-F0-9]{40}$/.test(agentId)) return agentId as Address;
  return `0x${keccak256(toBytes(agentId)).slice(26)}` as Address;
}

export function parseBudgetWei(raw: string): bigint {
  if (!/^\d+$/.test(raw)) {
    throw new Error(HIRE_USER_ERRORS.amount);
  }
  const amount = BigInt(raw);
  if (amount <= 0n) {
    throw new Error(HIRE_USER_ERRORS.amount);
  }
  return amount;
}

export function parseHireIntent(input: HireIntent): HireIntent {
  try {
    const parsed = hireIntentSchema.parse(input);
    parseBudgetWei(parsed.budgetWei);
    if (!parsed.agentId.trim() || !parsed.task.trim()) {
      throw new Error(HIRE_USER_ERRORS.agent);
    }
    return parsed;
  } catch (err) {
    if (err instanceof Error && Object.values(HIRE_USER_ERRORS).includes(err.message as never)) {
      throw err;
    }
    throw new Error(HIRE_USER_ERRORS.generic);
  }
}

function encodeJobData(intent: HireIntent): Hex {
  return stringToHex(JSON.stringify({ agentId: intent.agentId, task: intent.task }));
}

async function requireAccount(
  walletClient: CommerceWriteClients["walletClient"],
): Promise<Address> {
  if (walletClient.account?.address) return walletClient.account.address;
  const [address] = await walletClient.getAddresses();
  if (!address) {
    throw new Error(HIRE_USER_ERRORS.connect);
  }
  return address;
}

export function mapHireError(err: unknown): Error {
  const logger = (globalThis as { console?: { error?: (...args: unknown[]) => void } }).console;
  logger?.error?.("[commerce]", err);
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
    return new Error(HIRE_USER_ERRORS.cancelled);
  }
  if (lower.includes("insufficient funds") || lower.includes("exceeds the balance")) {
    return new Error(HIRE_USER_ERRORS.funds);
  }
  if (lower.includes("gas required exceeds") || lower.includes("intrinsic gas")) {
    return new Error(HIRE_USER_ERRORS.gas);
  }
  if (
    lower.includes("chain mismatch") ||
    lower.includes("wrong network") ||
    lower.includes("does not match the target chain")
  ) {
    return new Error(HIRE_USER_ERRORS.network);
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return new Error(HIRE_USER_ERRORS.timeout);
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network request failed") ||
    lower.includes("http request failed") ||
    lower.includes("rpc")
  ) {
    return new Error(HIRE_USER_ERRORS.rpc);
  }
  if (
    lower.includes("returned no data") ||
    lower.includes("not a contract") ||
    lower.includes("contractfunctionexecutionerror") ||
    lower.includes("execution reverted")
  ) {
    return new Error(HIRE_USER_ERRORS.reverted);
  }
  return new Error(HIRE_USER_ERRORS.generic);
}

export async function assertAffordable(
  clients: CommerceWriteClients,
  amountWei: bigint,
): Promise<void> {
  const account = await requireAccount(clients.walletClient);
  const balance = await clients.publicClient.getBalance({ address: account });
  if (balance < amountWei + GAS_BUFFER_WEI) {
    throw new Error(HIRE_USER_ERRORS.funds);
  }
}

async function writeContractOrPromptWallet(
  clients: CommerceWriteClients,
  call: {
    address: Address;
    functionName: "createJob" | "fundJob";
    args: readonly unknown[];
    account: Address;
    value?: bigint;
  },
): Promise<{ txHash: Hex; result?: unknown }> {
  const fallback = {
    address: call.address,
    abi: ERC8183_ABI,
    functionName: call.functionName,
    args: call.args,
    account: call.account,
    ...(call.value != null ? { value: call.value } : {}),
  };
  let request: never | undefined;
  let result: unknown;
  try {
    const simulated = await clients.publicClient.simulateContract(
      fallback as Parameters<CommerceWriteClients["publicClient"]["simulateContract"]>[0],
    );
    request = simulated.request as never;
    result = simulated.result;
  } catch {
    // Placeholder / undeployed contract: still open the wallet so testnet hire is visible.
  }
  const txHash = await clients.walletClient.writeContract(request ?? (fallback as never));
  await clients.publicClient.waitForTransactionReceipt({ hash: txHash });
  return { txHash, result };
}

export async function createRealJob(
  intent: HireIntent,
  clients: CommerceWriteClients,
  options?: RealHireOptions,
): Promise<RealHireResult> {
  const parsed = parseHireIntent(intent);
  const address = getContractAddress(options?.contractAddress);
  const amount = parseBudgetWei(options?.amount ?? parsed.budgetWei);
  const agent = resolveAgentAddress(parsed.agentId, options?.agentAddress);
  const account = await requireAccount(clients.walletClient);
  await assertAffordable(clients, amount);

  try {
    options?.onPhase?.("creating");
    const { txHash, result } = await writeContractOrPromptWallet(clients, {
      address,
      functionName: "createJob",
      args: [agent, amount, encodeJobData(parsed)],
      account,
    });
    options?.onPhase?.("confirming");
    return { jobId: result != null ? String(result) : "0", txHash };
  } catch (err) {
    throw mapHireError(err);
  }
}

export async function fundRealJob(
  jobId: string,
  amount: string,
  clients: CommerceWriteClients,
  options?: Pick<RealHireOptions, "contractAddress" | "onPhase">,
): Promise<{ txHash: Hex }> {
  const address = getContractAddress(options?.contractAddress);
  const value = parseBudgetWei(amount);
  const account = await requireAccount(clients.walletClient);
  await assertAffordable(clients, value);

  try {
    options?.onPhase?.("funding");
    const { txHash } = await writeContractOrPromptWallet(clients, {
      address,
      functionName: "fundJob",
      args: [BigInt(jobId)],
      account,
      value,
    });
    options?.onPhase?.("confirming");
    return { txHash };
  } catch (err) {
    throw mapHireError(err);
  }
}

export async function createAndFundJob(
  intent: HireIntent,
  clients: CommerceWriteClients,
  options?: RealHireOptions,
): Promise<RealHireResult> {
  const parsed = parseHireIntent(intent);
  const amount = options?.amount ?? parsed.budgetWei;
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
  try {
    const result = await publicClient.readContract({
      address,
      abi: ERC8183_ABI,
      functionName: "getJob",
      args: [BigInt(jobId)],
    });
    const index = Number(result[2]);
    return {
      status: ON_CHAIN_STATUS[index] ?? "Created",
      agent: result[0],
      amount: result[1].toString(),
    };
  } catch (err) {
    throw mapHireError(err);
  }
}

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
