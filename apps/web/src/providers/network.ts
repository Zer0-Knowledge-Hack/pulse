import { bscTestnet, type Chain } from "wagmi/chains";

/** Hire is BSC Testnet only. Never target mainnet from this app. */
export function targetChain(): Chain {
  return bscTestnet;
}

export function chainStatusLabel(): string {
  return "bsc testnet";
}

