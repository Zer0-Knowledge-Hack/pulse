import { useAccount, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui";
import { targetChain } from "@/providers/network";

export function WrongNetworkBanner() {
  const target = targetChain();
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  if (!target || !isConnected || chainId === target.id) {
    return null;
  }

  return (
    <div className="border-b border-danger bg-ink-2">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          Wrong network. Switch to {target.name} to hire on this demo.
        </p>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Button
            type="button"
            disabled={isPending || !switchChain}
            onClick={() => switchChain({ chainId: target.id })}
          >
            {isPending ? "Switching…" : `Switch to ${target.name}`}
          </Button>
          {error ? (
            <p className="text-sm text-danger">{error.message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
