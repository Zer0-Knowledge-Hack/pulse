import type { Address } from "viem";
import { commerceError, commerceLog } from "./log";

/**
 * Canonical ERC-8183 AgenticCommerce deployment, as shipped by
 * `@bnbagent/sdk` — the same contract the seed agents under `agents/` sell
 * through.
 *
 * Verified live on chain 97 rather than copied on faith: the address has
 * code, `paused()` is false, `platformFeeBP()` is 0, and `paymentToken()`
 * returns the `$U` address configured in every agent's `studio.toml`.
 *
 * Pointing this at a separately deployed contract would disconnect the
 * marketplace from the agents it lists, because those agents only watch
 * this one.
 */
export const COMMERCE_CONTRACTS = {
  97: "0xa206c0517b6371c6638cd9e4a42cc9f02a33b0de",
  56: "0xea4daa3100a767e86fded867729ae7446476eba6",
} as const satisfies Record<number, Address>;

/** `$U`, the ERC-8183 payment token. 18 decimals, not 6. */
export const PAYMENT_TOKENS = {
  97: "0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565",
  56: "0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565",
} as const satisfies Record<number, Address>;

/** `MAX_EXPIRY_DURATION()` read from chain 97. The contract rejects more. */
export const MAX_EXPIRY_SECONDS = 31_536_000n;

/** How long a hired job stays open before it can expire. */
export const DEFAULT_EXPIRY_SECONDS = 24n * 60n * 60n;

/** Sentinel for `hook`, matching the SDK's own default. */
export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const satisfies Address;

/** 0.001 `$U`. Caps BSC Testnet hire so faucet wallets can fund. */
export const TESTNET_DEFAULT_AMOUNT_WEI = "1000000000000000";

/**
 * On-chain job status enum, in contract order. This matches
 * `jobStatusSchema` in `@era/domain` one for one, because the domain was
 * written against this contract from the start.
 */
export const ON_CHAIN_STATUS = [
  "Open",
  "Funded",
  "Submitted",
  "Completed",
  "Rejected",
  "Expired",
] as const;

/** The subset of the AgenticCommerce ABI this package calls. */
export const ERC8183_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "jobId", type: "uint256" },
      { indexed: true, internalType: "address", name: "client", type: "address" },
      { indexed: true, internalType: "address", name: "provider", type: "address" },
      { indexed: false, internalType: "address", name: "evaluator", type: "address" },
      { indexed: false, internalType: "uint256", name: "expiredAt", type: "uint256" },
      { indexed: false, internalType: "address", name: "hook", type: "address" },
    ],
    name: "JobCreated",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_EXPIRY_DURATION",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "provider", type: "address" },
      { internalType: "address", name: "evaluator", type: "address" },
      { internalType: "uint256", name: "expiredAt", type: "uint256" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "address", name: "hook", type: "address" },
    ],
    name: "createJob",
    outputs: [{ internalType: "uint256", name: "jobId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "jobId", type: "uint256" },
      { internalType: "uint256", name: "expectedBudget", type: "uint256" },
      { internalType: "bytes", name: "optParams", type: "bytes" },
    ],
    name: "fund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "jobId", type: "uint256" }],
    name: "getJob",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "client", type: "address" },
          { internalType: "address", name: "provider", type: "address" },
          { internalType: "address", name: "evaluator", type: "address" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "uint256", name: "budget", type: "uint256" },
          { internalType: "uint256", name: "expiredAt", type: "uint256" },
          { internalType: "enum IACP.JobStatus", name: "status", type: "uint8" },
          { internalType: "address", name: "hook", type: "address" },
          { internalType: "uint256", name: "submittedAt", type: "uint256" },
          { internalType: "bytes32", name: "deliverable", type: "bytes32" },
        ],
        internalType: "struct IACP.Job",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paymentToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "jobId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes", name: "optParams", type: "bytes" },
    ],
    name: "setBudget",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/** Minimal ERC-20 surface for the `$U` approve the escrow requires. */
export const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const HIRE_USER_ERRORS = {
  cancelled: "You cancelled the operation.",
  funds: "You don’t have enough $U to fund this job.",
  gas: "You need tBNB for gas to complete this operation.",
  network: "Switch to the correct network (BSC Testnet).",
  connect: "Connect your wallet to hire.",
  amount: "Enter a valid amount.",
  agent: "This agent can’t be hired right now.",
  approve: "Approve $U spending so the escrow can pull the budget.",
  reverted: "We couldn’t complete the hire. Try again.",
  rpc: "We couldn’t reach the network. Try again.",
  timeout: "This is taking longer than expected. We’re checking it.",
  paused: "Hiring is paused on the commerce contract right now.",
  unavailable: "Hiring on this network isn’t available yet. Try again later.",
  generic: "We couldn’t complete the hire. You can try again.",
} as const;

function readProcessEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process;
  return proc?.env?.[name];
}

function isZeroAddress(value: string): boolean {
  return /^0x0{40}$/.test(value);
}

/**
 * Resolve the commerce contract for a chain.
 *
 * An explicit override still wins, so a squad can point at their own
 * deployment, but the canonical address is the default. A zero address is
 * rejected rather than treated as configuration.
 */
export function getContractAddress(override?: string, chainId = 97): Address {
  const fallback = COMMERCE_CONTRACTS[chainId as keyof typeof COMMERCE_CONTRACTS];
  const raw = override || readProcessEnv("VITE_CONTRACT_ADDRESS") || fallback;
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) {
    commerceError("invalid contract address");
    throw new Error(HIRE_USER_ERRORS.unavailable);
  }
  if (isZeroAddress(raw)) {
    commerceError("contract not configured");
    throw new Error(HIRE_USER_ERRORS.unavailable);
  }
  const address = raw as Address;
  commerceLog(`hire:contract ${address}`);
  return address;
}

/** Resolve the `$U` payment token the escrow pulls from. */
export function getPaymentToken(override?: string, chainId = 97): Address {
  const fallback = PAYMENT_TOKENS[chainId as keyof typeof PAYMENT_TOKENS];
  const raw = override || readProcessEnv("VITE_PAYMENT_TOKEN") || fallback;
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw) || isZeroAddress(raw)) {
    commerceError("invalid payment token");
    throw new Error(HIRE_USER_ERRORS.unavailable);
  }
  return raw as Address;
}

/** Job expiry, clamped to what the contract accepts. */
export function resolveExpiry(
  nowSeconds: bigint = BigInt(Math.floor(Date.now() / 1000)),
): bigint {
  const span =
    DEFAULT_EXPIRY_SECONDS > MAX_EXPIRY_SECONDS ? MAX_EXPIRY_SECONDS : DEFAULT_EXPIRY_SECONDS;
  return nowSeconds + span;
}
