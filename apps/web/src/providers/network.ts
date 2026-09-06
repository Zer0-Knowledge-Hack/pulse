import { bsc, bscTestnet, type Chain } from "wagmi/chains";

export function chainMode(): string {
  return import.meta.env.VITE_CHAIN || "local";
}

/** Target chain for hire when `VITE_CHAIN` is a live network. Local mock has none. */
export function targetChain(): Chain | null {
  const mode = chainMode();
  if (mode === "bsc-testnet") return bscTestnet;
  if (mode === "bsc-mainnet") return bsc;
  return null;
}

export function chainStatusLabel(): string {
  const mode = chainMode();
  if (mode === "bsc-mainnet") return "bsc";
  if (mode === "bsc-testnet") return "bsc testnet";
  return "mock commerce";
}
