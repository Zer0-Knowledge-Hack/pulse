import type { Address } from "viem";
import type { HireIntent, JobView } from "@era/domain";
import { HIRE_USER_ERRORS } from "./config";
import { createMockJob, getMockJob, revokeMockSession } from "./mock";
import {
  createAndFundJob,
  getJobStatus,
  mapHireError,
  onChainStatusToJobStatus,
  parseHireIntent,
  toFundedJobView,
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
  if (!isLiveCommerceChain(input.chain)) {
    return parsed;
  }
  if (!input.connected) {
    throw new Error(HIRE_USER_ERRORS.connect);
  }
  if (input.chainId !== expectedChainId(input.chain)) {
    throw new Error(HIRE_USER_ERRORS.network);
  }
  return parsed;
}

export async function createJob(
  intent: HireIntent,
  options?: CreateJobOptions,
): Promise<JobView> {
  const chain = resolveCommerceChain(options?.chain);
  const parsed = parseHireIntent(intent);
  if (!isLiveCommerceChain(chain)) {
    return createMockJob(parsed);
  }
  if (!options?.clients) {
    throw new Error(HIRE_USER_ERRORS.connect);
  }
  try {
    const result = await createAndFundJob(parsed, options.clients, {
      amount: options.amountInWei ?? parsed.budgetWei,
      agentAddress: options.agentAddress,
      contractAddress: options.contractAddress,
      onPhase: options.onPhase,
      onCreated: options.onCreated,
    });
    const view = toFundedJobView(parsed, result);
    try {
      const onChain = await getJobStatus(result.jobId, options.clients.publicClient, {
        contractAddress: options.contractAddress,
      });
      return { ...view, status: onChainStatusToJobStatus(onChain.status) };
    } catch {
      return view;
    }
  } catch (err) {
    throw mapHireError(err);
  }
}

export async function getJob(
  jobId: string,
  options?: GetJobOptions,
): Promise<JobView | undefined> {
  const chain = resolveCommerceChain(options?.chain);
  if (!isLiveCommerceChain(chain)) {
    return getMockJob(jobId);
  }
  if (!options?.publicClient) {
    throw new Error(HIRE_USER_ERRORS.rpc);
  }
  const onChain = await getJobStatus(jobId, options.publicClient, {
    contractAddress: options.contractAddress,
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
