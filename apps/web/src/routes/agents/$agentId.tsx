import { useEffect } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { BarChart3, ChevronRight, CircleCheck, Home, Info, Radio } from "lucide-react";
import { CATEGORY_JOBS, CATEGORY_LABELS } from "@era/domain";
import { Badge, Button, Card, DetailSkeleton, ErrorState } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { Lede, PageTitle, SectionTitle } from "@/components/ui/heading";
import { AgentAvatar } from "@/features/catalog/agent-avatar";
import { useAgent } from "@/features/catalog/use-agent";
import { CategorySignal } from "@/features/signals/category-signal";
import { SignalChart } from "@/features/signals/signal-chart";
import { HirePanel, HireStickyBar } from "@/features/hire/hire-cta";
import { isLocalAgentEndpoint, isPlaceholderAddress } from "@/features/hire/hire-provider";
import { chainLabel, formatAddress, formatDate, friendlyLoadError } from "@/lib/format";

const agentRoute = getRouteApi("/agents/$agentId");

export function AgentDetailPage() {
  const { agentId } = agentRoute.useParams();
  const {
    agent,
    signal,
    loading,
    notFound,
    error,
    signalStatus,
    signalRefreshing,
    reload,
    reloadSignal,
  } = useAgent(agentId);

  useEffect(() => {
    if (!agent) return;
    if (window.location.hash !== "#hire") return;
    document.getElementById("hire")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [agent]);

  if (error) {
    return (
      <ErrorState
        title={notFound ? "This agent was not found" : "This agent could not be loaded"}
        action={
          <div className="flex flex-wrap gap-2">
            {notFound ? null : (
              <Button variant="ghost" onClick={() => void reload()}>
                Retry
              </Button>
            )}
            <Link to="/">
              <Button variant="ghost">Back to the marketplace</Button>
            </Link>
          </div>
        }
      >
        <p>{notFound ? "It is not in the catalog. Start from the marketplace." : friendlyLoadError(error)}</p>
      </ErrorState>
    );
  }
  if (loading || !agent) {
    return <DetailSkeleton />;
  }

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <p className="flex flex-wrap items-center gap-1 lede">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-paper">
          <Icon icon={Home} className="size-3.5" />
          Marketplace
        </Link>
        <Icon icon={ChevronRight} className="size-3.5" />
        <Link to="/browse/$category" params={{ category: agent.category }} className="hover:text-paper">
          {CATEGORY_LABELS[agent.category]}
        </Link>
        <Icon icon={ChevronRight} className="size-3.5" />
        <span className="text-paper">{agent.name}</span>
      </p>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="space-y-3">
          <Card className="space-y-3 p-4">
            <div className="flex items-start gap-3">
              <AgentAvatar name={agent.name} category={agent.category} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1">
                  <Badge tone={agent.live ? "ok" : "muted"}>
                    <Icon icon={Radio} className="mr-1 size-3" />
                    {agent.live ? "Live" : "Offline"}
                  </Badge>
                  {agent.featured ? (
                    <Badge tone="accent">
                      <Icon icon={CircleCheck} className="mr-1 size-3" />
                      Featured
                    </Badge>
                  ) : null}
                  <Badge>{CATEGORY_LABELS[agent.category]}</Badge>
                </div>
                <PageTitle className="mt-1.5">{agent.name}</PageTitle>
              </div>
            </div>
            <Lede>{agent.description}</Lede>
            <p className="lede">{CATEGORY_JOBS[agent.category]}</p>
          </Card>

          <Card className="space-y-3 p-4">
            <SectionTitle className="flex items-center gap-2">
              <Icon icon={BarChart3} className="text-accent" />
              Live signal
            </SectionTitle>
            {signalStatus === "ready" && signal ? <CategorySignal signal={signal} /> : null}
            <SignalChart
              signal={signal}
              loading={signalStatus === "loading"}
              refreshing={signalRefreshing}
              onRefresh={reloadSignal}
            />
          </Card>

          <Card className="space-y-1 p-0 sm:p-0">
            <SectionTitle className="flex items-center gap-2 px-4 pt-3">
              <Icon icon={Info} className="text-accent" />
              Agent details
            </SectionTitle>
            <dl className="divide-y divide-line">
              <Fact label="A2A" value={endpointLabel(agent.endpoints.a2a)} mono={isPublicEndpoint(agent.endpoints.a2a)} />
              <Fact label="MCP" value={endpointLabel(agent.endpoints.mcp)} mono={isPublicEndpoint(agent.endpoints.mcp)} />
              <Fact label="Payment" value={agent.commerce.x402 ? "x402 + ERC-8183" : "ERC-8183"} />
              <Fact label="Network" value={chainLabel(agent.chainId)} />
              <Fact label="Owner" value={formatAddress(agent.owner)} mono />
              <Fact
                label="Provider"
                value={providerLabel(agent.commerce.erc8183Provider)}
                mono={Boolean(agent.commerce.erc8183Provider && !isPlaceholderAddress(agent.commerce.erc8183Provider))}
              />
              <Fact label="Token" value={agent.erc8004TokenId} mono />
              <Fact label="Listed" value={formatDate(agent.createdAt)} />
            </dl>
          </Card>
        </div>
        <HirePanel agent={agent} />
      </div>
      <HireStickyBar agent={agent} visible />
    </div>
  );
}

function endpointLabel(url: string | null | undefined): string {
  if (!url) return "Not configured";
  if (isLocalAgentEndpoint(url)) return "Unavailable";
  return url;
}

function isPublicEndpoint(url: string | null | undefined): boolean {
  return Boolean(url) && !isLocalAgentEndpoint(url);
}

function providerLabel(value: string | null | undefined): string {
  if (!value || isPlaceholderAddress(value)) return "Not configured";
  return formatAddress(value);
}

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd className={`min-w-0 text-right text-sm ${mono ? "break-all font-mono text-xs" : "break-words"}`}>
        {value}
      </dd>
    </div>
  );
}
