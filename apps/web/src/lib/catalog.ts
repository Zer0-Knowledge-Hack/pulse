import type { AgentListing } from "@era/domain";

export type AvailabilityFilter = "all" | "live" | "offline";
export type SortKey = "featured" | "newest" | "name";

export type CatalogQuery = {
  search: string;
  availability: AvailabilityFilter;
  featuredOnly: boolean;
  x402Only: boolean;
  sort: SortKey;
};

export const DEFAULT_CATALOG_QUERY: CatalogQuery = {
  search: "",
  availability: "all",
  featuredOnly: false,
  x402Only: false,
  sort: "featured",
};

export const CATALOG_PAGE_SIZE = 6;

export function activeFilterCount(query: CatalogQuery): number {
  let count = 0;
  if (query.availability !== "all") count += 1;
  if (query.featuredOnly) count += 1;
  if (query.x402Only) count += 1;
  return count;
}

export function catalogCapabilities(agents: AgentListing[]): {
  showFeatured: boolean;
  showX402: boolean;
  showOffline: boolean;
} {
  return {
    showFeatured: agents.some((agent) => agent.featured) && agents.some((agent) => !agent.featured),
    showX402: agents.some((agent) => agent.commerce.x402),
    showOffline: agents.some((agent) => !agent.live),
  };
}

export function applyCatalogQuery(
  agents: AgentListing[],
  query: CatalogQuery,
): AgentListing[] {
  const needle = query.search.trim().toLowerCase();
  let rows = agents;

  if (needle) {
    rows = rows.filter((agent) => {
      const category = agent.category.replaceAll("_", " ");
      return (
        agent.name.toLowerCase().includes(needle) ||
        agent.description.toLowerCase().includes(needle) ||
        category.includes(needle)
      );
    });
  }

  if (query.availability === "live") {
    rows = rows.filter((agent) => agent.live);
  } else if (query.availability === "offline") {
    rows = rows.filter((agent) => !agent.live);
  }

  if (query.featuredOnly) {
    rows = rows.filter((agent) => agent.featured);
  }

  if (query.x402Only) {
    rows = rows.filter((agent) => agent.commerce.x402);
  }

  return [...rows].sort((a, b) => {
    if (query.sort === "name") return a.name.localeCompare(b.name);
    if (query.sort === "newest") return b.createdAt.localeCompare(a.createdAt);
    const score = (agent: AgentListing) =>
      (agent.featured ? 2 : 0) + (agent.live ? 1 : 0);
    const delta = score(b) - score(a);
    if (delta !== 0) return delta;
    return a.name.localeCompare(b.name);
  });
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): {
  page: number;
  pageCount: number;
  slice: T[];
  start: number;
  end: number;
  total: number;
} {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), pageCount);
  const startIndex = (safePage - 1) * pageSize;
  return {
    page: safePage,
    pageCount,
    slice: items.slice(startIndex, startIndex + pageSize),
    start: total === 0 ? 0 : startIndex + 1,
    end: Math.min(startIndex + pageSize, total),
    total,
  };
}
