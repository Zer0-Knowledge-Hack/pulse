import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "@tanstack/react-router";
import { useAccount, useBalance, useDisconnect, useReadContract, useSwitchChain } from "wagmi";
import { ERC20_ABI, getPaymentToken } from "@era/commerce";
import { Copy, Unplug, Wallet } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Lede,
  Meta,
  SectionTitle,
  WalletSkeleton,
} from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { useInbox } from "@/features/account/inbox";
import { formatAddress, formatDateTime, weiToU } from "@/lib/format";
import { chainStatusLabel, targetChain } from "@/providers/network";

export function WalletCard() {
  const { address, isConnected, chain, chainId, status } = useAccount();
  const { disconnect, isPending: disconnecting } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const toast = useToast();
  const { pushNotice, pushActivity, activity } = useInbox();
  const target = targetChain();
  const native = useBalance({ address, query: { enabled: Boolean(address) } });
  let payment: `0x${string}` | undefined;
  try {
    payment = chainId === 56 || chainId === 97 ? getPaymentToken(undefined, chainId) : undefined;
  } catch {
    payment = undefined;
  }
  const token = useReadContract({
    address: payment,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && payment) },
  });

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast.push("Address copied.", "ok");
      pushActivity({
        type: "copy",
        title: "Address copied",
        description: address,
      });
    } catch {
      toast.push("Could not copy the address.", "danger");
    }
  }

  if (status === "connecting" || status === "reconnecting") {
    return <WalletSkeleton />;
  }

  if (!isConnected || !address) {
    return (
      <EmptyState
        title="Wallet not connected"
        icon={
          <span className="icon-well">
            <Icon icon={Wallet} />
          </span>
        }
        action={<ConnectButton showBalance={false} chainStatus="icon" />}
      >
        <p>Connect a buyer wallet to hire on a live chain. Mock commerce does not need one.</p>
      </EmptyState>
    );
  }

  const nativeLabel =
    native.data && !native.isError
      ? `${formatNative(native.data.value.toString(), native.data.decimals)} ${native.data.symbol}`
      : null;
  const tokenLabel =
    typeof token.data === "bigint" && !token.isError ? `${weiToU(token.data.toString())} $U` : null;
  const walletActivity = activity.filter((item) => item.type === "wallet" || item.type === "copy").slice(0, 4);

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="icon-well">
              <Icon icon={Wallet} />
            </span>
            <div>
              <SectionTitle>Wallet</SectionTitle>
              <Meta>Buyer wallet</Meta>
            </div>
          </div>
          <Badge tone="ok">Connected</Badge>
        </div>

        <dl className="grid gap-2 sm:grid-cols-2">
          <Row label="Network" value={chain?.name ?? chainStatusLabel()} />
          <Row label="Address" value={formatAddress(address)} mono />
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => void copyAddress()}>
            <Icon icon={Copy} />
            Copy address
          </Button>
          {target && chainId !== target.id && switchChain ? (
            <Button
              loading={switching}
              onClick={() => {
                switchChain({ chainId: target.id });
                pushNotice({
                  kind: "system",
                  title: "Network switch requested",
                  description: `Switch to ${target.name} in your wallet.`,
                });
              }}
            >
              {switching ? "Switching…" : `Switch to ${target.name}`}
            </Button>
          ) : null}
          <Button variant="danger" loading={disconnecting} onClick={() => disconnect()}>
            <Icon icon={Unplug} />
            {disconnecting ? "Disconnecting…" : "Disconnect"}
          </Button>
        </div>
      </Card>

      <Card className="space-y-2">
        <SectionTitle>Balance</SectionTitle>
        <Lede>On-chain values from the connected network. Unavailable means the read failed.</Lede>
        <dl className="grid gap-2 sm:grid-cols-2">
          <Row label="BNB" value={native.isLoading ? "Loading…" : nativeLabel ?? "Unavailable"} />
          <Row
            label="$U"
            value={
              payment ? (token.isLoading ? "Loading…" : tokenLabel ?? "Unavailable") : "Not on this chain"
            }
          />
        </dl>
      </Card>

      <Card className="space-y-2">
        <SectionTitle>Assets</SectionTitle>
        <ul className="space-y-2">
          <AssetRow
            name={native.data?.symbol ?? "BNB"}
            value={native.isLoading ? "Loading…" : nativeLabel ?? "Unavailable"}
          />
          {payment ? (
            <AssetRow name="$U" value={token.isLoading ? "Loading…" : tokenLabel ?? "Unavailable"} />
          ) : (
            <li className="lede">No $U contract on this network.</li>
          )}
        </ul>
      </Card>

      <Card className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>Activity</SectionTitle>
          <Link to="/profile" search={{ tab: "activity" }} className="text-xs text-accent hover:underline">
            View all
          </Link>
        </div>
        {walletActivity.length === 0 ? (
          <Lede>Wallet events from this browser will list here.</Lede>
        ) : (
          <ul className="space-y-2">
            {walletActivity.map((item) => (
              <li key={item.id} className="rounded-xl border border-line bg-ink px-3 py-2">
                <p className="text-sm">{item.title}</p>
                <p className="meta mt-0.5">{formatDateTime(item.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function AssetRow({ name, value }: { name: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ink px-3 py-2.5">
      <span className="text-sm">{name}</span>
      <span className="font-mono text-xs text-muted">{value}</span>
    </li>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-ink px-3 py-2.5">
      <dt className="meta">{label}</dt>
      <dd className={`mt-1 break-all text-sm ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function formatNative(wei: string, decimals: number): string {
  try {
    const value = BigInt(wei);
    const base = 10n ** BigInt(decimals);
    const whole = value / base;
    const frac = value % base;
    if (frac === 0n) return whole.toString();
    const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "").slice(0, 6);
    return `${whole.toString()}.${fracStr}`;
  } catch {
    return wei;
  }
}
