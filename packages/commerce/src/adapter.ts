import type { Address } from "viem";
import type { HireIntent, JobView } from "@era/domain";
import { HIRE_USER_ERRORS } from "./config";
import { commerceError, commerceLog } from "./log";
import { createMockJob, getMockJob, revokeMockSession } from "./mock";
import {
  createAndFundJob,
  getJobStatus,
  mapHireError,
  onChainStatusToJobStatus,
  parseHireIntent,
  resolveTestnetAmountWei,
  toFundedJobView,
  waitForFundedStatus,
  type CommerceWriteClients,
  type HirePhase,
} from "./real";

export type CreateJobOptions = {
  chain?: string;
  clients?: CommerceWriteClients;
  agentAddress?: Address;
  contractAddress?: Address;
  amountInWei?: string;
  onPhase?: (phase: HirePhase) => void;
  onCreated?: (jobId: string) => void;
};

export type GetJobOptions = {
  chain?: string;
  publicClient?: CommerceWriteClients["publicClient"];
  contractAddress?: Address;
  fallback?: JobView;
};

export function resolveCommerceChain(explicit?: string): string {
  if (explicit) return explicit;
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.VITE_CHAIN || "local";
}

export function isLiveCommerceChain(chain: string): boolean {
  return chain === "bsc-testnet" || chain === "bsc-mainnet";
}

export function expectedChainId(chain: string): number {
  return chain === "bsc-mainnet" ? 56 : 97;
}

export function validateHireReady(input: {
  intent: HireIntent;
  chain: string;
  connected?: boolean;
  chainId?: number;
}): HireIntent {
  const parsed = parseHireIntent(input.intent);
  commerceLog(`hire:chain ${input.chain}`);
  if (!isLiveCommerceChain(input.chain)) {
    return parsed;
  }
  if (!input.connected) {
    commerceError("wallet not connected");
    throw new Error(HIRE_USER_ERRORS.connect);
  }
  commerceLog("hire:wallet");
  const expected = expectedChainId(input.chain);
  commerceLog(`hire:network expected=${expected} received=${input.chainId ?? "none"}`);
  if (input.chainId !== expected) {
    commerceError("wrong network");
    throw new Error(HIRE_USER_ERRORS.network);
  }
  return parsed;
}

export async function createJob(
  intent: HireIntent,
  options?: CreateJobOptions,
): Promise<JobView> {
  commerceLog("hire:start");
  const chain = resolveCommerceChain(options?.chain);
  commerceLog(`hire:chain ${chain}`);
  const parsed = parseHireIntent(intent);
  if (!isLiveCommerceChain(chain)) {
    const job = createMockJob(parsed);
    commerceLog(`hire:jobId ${job.jobId}`);
    commerceLog("hire:status Funded");
    commerceLog("hire:complete");
    return job;
  }
  if (!options?.clients) {
    commerceError("wallet not connected");
    throw new Error(HIRE_USER_ERRORS.connect);
  }
  try {
    const expected = expectedChainId(chain);
    const amount = resolveTestnetAmountWei(options.amountInWei ?? parsed.budgetWei, expected);
    const result = await createAndFundJob(parsed, options.clients, {
      amount,
      agentAddress: options.agentAddress,
      contractAddress: options.contractAddress,
      expectedChainId: expected,
      onPhase: options.onPhase,
      onCreated: options.onCreated,
    });
    commerceLog(`hire:create:txHash ${result.createTxHash ?? ""}`);
    commerceLog(`hire:fund:txHash ${result.txHash}`);
    const onChain = await waitForFundedStatus(result.jobId, options.clients.publicClient, {
      contractAddress: options.contractAddress,
      expectedChainId: expected,
      onPhase: options.onPhase,
    });
    const status = onChainStatusToJobStatus(onChain.status);
    // Submitted means the agent already delivered, which is a faster success,
    // not a failure. Only a job still sitting Open failed to fund.
    if (status !== "Funded" && status !== "Submitted" && status !== "Completed") {
      commerceError(`status not Funded (${status})`);
      throw new Error(HIRE_USER_ERRORS.timeout);
    }
    const view = toFundedJobView({ ...parsed, budgetWei: amount }, result);
    commerceLog("hire:complete");
    return { ...view, status };
  } catch (err) {
    throw mapHireError(err);
  }
}

export async function getJob(
  jobId: string,
  options?: GetJobOptions,
): Promise<JobView | undefined> {
  const chain = resolveCommerceChain(options?.chain);
  commerceLog(`hire:chain ${chain}`);
  if (!isLiveCommerceChain(chain)) {
    return getMockJob(jobId);
  }
  if (!options?.publicClient) {
    commerceError("RPC failed");
    throw new Error(HIRE_USER_ERRORS.rpc);
  }
  const onChain = await getJobStatus(jobId, options.publicClient, {
    contractAddress: options.contractAddress,
    expectedChainId: expectedChainId(chain),
  });
  if (options.fallback?.jobId === jobId) {
    return { ...options.fallback, status: onChainStatusToJobStatus(onChain.status) };
  }
  return {
    jobId,
    agentId: options.fallback?.agentId ?? "",
    budgetWei: onChain.amount,
    task: options.fallback?.task ?? "",
    status: onChainStatusToJobStatus(onChain.status),
    txHashes: options.fallback?.txHashes ?? [],
    session: options.fallback?.session ?? null,
    createdAt: options.fallback?.createdAt ?? new Date().toISOString(),
  };
}

/** Stretch: on-chain revoke is out of scope; mock revoke stays available. */
export function revokeJob(jobId: string): JobView | undefined {
  return revokeMockSession(jobId);
}
