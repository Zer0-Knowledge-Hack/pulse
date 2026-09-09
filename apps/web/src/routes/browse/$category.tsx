import { getRouteApi, Link } from "@tanstack/react-router";
import { CATEGORY_JOBS, CATEGORY_LABELS, categorySchema, type Category } from "@era/domain";
import { Button, Lede, PageTitle, RouteNotFoundState } from "@/components/ui";
import { CategoryNav } from "@/features/catalog/category-nav";
import { Marketplace } from "@/features/catalog/marketplace";
import { PromoBanner } from "@/features/catalog/promo-banner";
import { useCatalog } from "@/features/catalog/use-catalog";

const browseRoute = getRouteApi("/browse/$category");

export function BrowsePage() {
  const { category: raw } = browseRoute.useParams();
  const parsed = categorySchema.safeParse(raw);

  if (!parsed.success) {
    return <RouteNotFoundState />;
  }
  return <BrowseCategory category={parsed.data} />;
}

function BrowseCategory({ category }: { category: Category }) {
  const { q } = browseRoute.useSearch();
  const catalog = useCatalog(category);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="meta">
          <Link to="/" className="hover:text-paper">
            Marketplace
          </Link>
          <span aria-hidden> / </span>
          {CATEGORY_LABELS[category]}
        </p>
        <PageTitle>{CATEGORY_LABELS[category]}</PageTitle>
        <Lede>{CATEGORY_JOBS[category]} Featured agents first. Compare the signal, then hire.</Lede>
      </div>
      <CategoryNav active={category} variant="pills" />
      <PromoBanner agents={catalog.agents} />
      <Marketplace
        agents={catalog.agents}
        signals={catalog.signals}
        status={catalog.status}
        onRetry={catalog.retry}
        initialSearch={q ?? ""}
        error={catalog.error}
      />
      {catalog.status === "ready" && catalog.agents.length === 0 ? (
        <div className="flex justify-start">
          <Link to="/">
            <Button variant="ghost">See the other categories</Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
