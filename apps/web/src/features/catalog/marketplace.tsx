import { useEffect, useMemo, useState } from "react";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import type { AgentListing, AgentSignal } from "@era/domain";
import {
  AgentSkeleton,
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  Pagination,
  SearchInput,
} from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import {
  activeFilterCount,
  applyCatalogQuery,
  CATALOG_PAGE_SIZE,
  catalogCapabilities,
  DEFAULT_CATALOG_QUERY,
  paginate,
  type CatalogQuery,
} from "@/lib/catalog";
import { friendlyLoadError } from "@/lib/format";
import { AgentCard } from "./agent-card";
import { FilterFields, SortSelect } from "./filter-fields";

type Status = "loading" | "ready" | "error";

export function Marketplace({
  agents,
  signals,
  status,
  onRetry,
  initialSearch = "",
}: {
  agents: AgentListing[];
  signals: Record<string, AgentSignal>;
  status: Status;
  onRetry: () => void;
  initialSearch?: string;
}) {
  const [query, setQuery] = useState<CatalogQuery>({
    ...DEFAULT_CATALOG_QUERY,
    search: initialSearch,
  });
  const [draft, setDraft] = useState<CatalogQuery>(query);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setQuery((current) =>
      current.search === initialSearch ? current : { ...current, search: initialSearch },
    );
  }, [initialSearch]);

  useEffect(() => {
    setPage(1);
  }, [query, agents]);

  const capabilities = catalogCapabilities(agents);
  const filtered = useMemo(() => applyCatalogQuery(agents, query), [agents, query]);
  const paged = paginate(filtered, page, CATALOG_PAGE_SIZE);
  const filterCount = activeFilterCount(query);

  function clearFilters() {
    const next = { ...DEFAULT_CATALOG_QUERY, search: query.search };
    setQuery(next);
    setDraft(next);
  }

  function clearAll() {
    setQuery(DEFAULT_CATALOG_QUERY);
    setDraft(DEFAULT_CATALOG_QUERY);
  }

  function applyDraft() {
    setQuery(draft);
    setFiltersOpen(false);
  }

  if (status === "loading") {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-live="polite">
        <AgentSkeleton />
        <AgentSkeleton />
        <AgentSkeleton />
        <AgentSkeleton />
        <span className="sr-only">Loading agents</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <ErrorState
        title="We could not load the agents"
        action={
          <Button variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        <p>{friendlyLoadError()}</p>
      </ErrorState>
    );
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        title="No agents listed here yet"
        action={
          <Button variant="ghost" onClick={onRetry}>
            Reload
          </Button>
        }
      >
        <p>
          The catalog answered, and it has nothing here. Try another category while this one fills
          up.
        </p>
      </EmptyState>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-6">
      <aside className="hidden lg:block">
        <div className="sticky top-16 space-y-3 rounded-2xl border border-line bg-ink-2 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="section-title">Filters</h2>
            {filterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Clear filters
              </button>
            ) : null}
          </div>
          <FilterFields
            value={query}
            onChange={setQuery}
            showFeatured={capabilities.showFeatured}
            showX402={capabilities.showX402}
            showOffline={capabilities.showOffline}
            namePrefix="desktop"
          />
        </div>
      </aside>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            id="marketplace-search"
            value={query.search}
            onChange={(search) => setQuery((current) => ({ ...current, search }))}
            placeholder="Search agents…"
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="lg:hidden"
              onClick={() => {
                setDraft(query);
                setFiltersOpen(true);
              }}
              aria-expanded={filtersOpen}
              aria-controls="filter-sheet"
            >
              <Icon icon={SlidersHorizontal} />
              Filter
              {filterCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[11px] text-ink">
                  {filterCount}
                </span>
              ) : null}
            </Button>
            <Button
              variant="ghost"
              className="px-3"
              onClick={onRetry}
              aria-label="Reload agents"
            >
              <Icon icon={RefreshCw} />
              <span className="hidden sm:inline">Reload</span>
            </Button>
            <SortSelect
              value={query.sort}
              onChange={(sort) => setQuery((current) => ({ ...current, sort }))}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No agents match"
            action={
              <Button variant="ghost" onClick={clearAll}>
                Clear search and filters
              </Button>
            }
          >
            <p>Try another search or remove some filters.</p>
          </EmptyState>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {paged.slice.map((agent) => (
                <AgentCard key={agent.id} agent={agent} signal={signals[agent.id]} />
              ))}
            </div>
            <Pagination
              page={paged.page}
              pageCount={paged.pageCount}
              total={paged.total}
              start={paged.start}
              end={paged.end}
              onPage={setPage}
            />
          </>
        )}
      </div>

      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        description="Narrow the marketplace, then apply."
        placement="bottom"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                const next = { ...DEFAULT_CATALOG_QUERY, search: query.search };
                setDraft(next);
                setQuery(next);
                setFiltersOpen(false);
              }}
            >
              Clear filters
            </Button>
            <Button className="flex-1" onClick={applyDraft}>
              Apply filters
              {activeFilterCount(draft) > 0 ? ` (${activeFilterCount(draft)})` : ""}
            </Button>
          </div>
        }
      >
        <div id="filter-sheet">
          <FilterFields
            value={draft}
            onChange={setDraft}
            showFeatured={capabilities.showFeatured}
            showX402={capabilities.showX402}
            showOffline={capabilities.showOffline}
            namePrefix="sheet"
          />
        </div>
      </Dialog>
    </div>
  );
}
