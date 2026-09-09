import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export function WalletGlyph({ className }: { className?: string }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = Boolean(ready && account && chain);
        const wrong = Boolean(connected && chain?.unsupported);

        return (
          <div className={cn("flex items-center", className)} aria-busy={!ready || undefined}>
            {connected && account && chain && !wrong ? (
              <button
                type="button"
                onClick={openAccountModal}
                aria-label={`Wallet ${account.displayName}`}
                className="header-icon"
              >
                <span
                  aria-hidden
                  className="flex size-7 items-center justify-center rounded-full text-[10px] font-semibold text-ink"
                  style={{ background: identColor(account.address) }}
                >
                  {account.address.slice(2, 4).toUpperCase()}
                </span>
                <span className="absolute top-1 right-1 size-1.5 rounded-full bg-ok" />
              </button>
            ) : connected && wrong ? (
              <button
                type="button"
                onClick={openChainModal}
                aria-label="Wrong network"
                className="header-icon"
              >
                <Icon icon={Wallet} />
                <span className="absolute top-1 right-1 size-1.5 rounded-full bg-danger" />
              </button>
            ) : (
              <button
                type="button"
                onClick={openConnectModal}
                aria-label="Connect wallet"
                className="header-icon"
              >
                <Icon icon={Wallet} />
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function identColor(address: string): string {
  const hue = Number.parseInt(address.slice(2, 8), 16) % 360;
  return `hsl(${hue} 70% 48%)`;
}
