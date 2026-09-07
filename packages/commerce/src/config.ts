import type { Address } from "viem";

/** Replace with the live ERC-8183 commerce contract once Agents publishes it. */
export const PLACEHOLDER_ERC8183_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const satisfies Address;

export const CONTRACT_ADDRESS = PLACEHOLDER_ERC8183_ADDRESS;

/**
 * Minimal ERC-8183 surface used until the squad lands the real ABI.
 * `createJob` records the agent + budget; `fundJob` is payable native for now.
 * Swap this file when the real contract + ABI arrive — do not invent extra methods.
 */
export const ERC8183_ABI = [
  {
    inputs: [
      { internalType: "address", name: "agent", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "createJob",
    outputs: [{ internalType: "uint256", name: "jobId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "jobId", type: "uint256" }],
    name: "fundJob",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "jobId", type: "uint256" }],
    name: "getJob",
    outputs: [
      { internalType: "address", name: "agent", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint8", name: "status", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const HIRE_USER_ERRORS = {
  cancelled: "You cancelled the operation.",
  funds: "You don’t have enough funds.",
  gas: "You need funds to complete this operation.",
  network: "Switch to the correct network (BSC Testnet).",
  connect: "Connect your wallet to hire.",
  amount: "Enter a valid amount.",
  agent: "This agent can’t be hired right now.",
  reverted: "We couldn’t complete the hire. Try again.",
  rpc: "We couldn’t reach the network. Try again.",
  timeout: "This is taking longer than expected. We’re checking it.",
  unavailable: "Hiring on this network isn’t available yet. Try again later.",
  generic: "We couldn’t complete the hire. You can try again.",
} as const;

function readProcessEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[name];
}

export function getContractAddress(override?: string): Address {
  const raw = override || readProcessEnv("VITE_CONTRACT_ADDRESS") || CONTRACT_ADDRESS;
  if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) {
    throw new Error(HIRE_USER_ERRORS.unavailable);
  }
  return raw as Address;
}

export function isPlaceholderContract(address: Address): boolean {
  return address.toLowerCase() === PLACEHOLDER_ERC8183_ADDRESS;
}

export function assertConfiguredContract(address: Address): void {
  if (isPlaceholderContract(address)) {
    throw new Error(HIRE_USER_ERRORS.unavailable);
  }
}
