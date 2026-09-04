import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { type ReactNode, useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";

const projectId = import.meta.env.VITE_WC_PROJECT_ID || "era-marketplace-dev";

const wagmiConfig = getDefaultConfig({
  appName: "Era Marketplace",
  projectId,
  chains: [bscTestnet, bsc],
  ssr: false,
});

export function WalletProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#f0b90b", accentColorForeground: "#0b0e11", borderRadius: "small" })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
