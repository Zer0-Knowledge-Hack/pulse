import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { Icon } from "./icon";

export function Pagination({
  page,
  pageCount,
  total,
  start,
  end,
  onPage,
  noun = "agents",
}: {
  page: number;
  pageCount: number;
  total: number;
  start: number;
  end: number;
  onPage: (page: number) => void;
  noun?: string;
}) {
  if (total === 0) return null;

  const pages = visiblePages(page, pageCount);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Showing {start}–{end} of {total} {noun}
      </p>
      {pageCount > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-2 sm:justify-end">
          <Button
            variant="ghost"
            className="px-3"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            aria-label="Previous page"
          >
            <Icon icon={ChevronLeft} />
            <span>Previous</span>
          </Button>
          <ol className="hidden items-center gap-1 sm:flex">
            {pages.map((item, index) =>
              item === "…" ? (
                <li key={`ellipsis-${index}`} className="px-1 text-muted">
                  …
                </li>
              ) : (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => onPage(item)}
                    aria-current={item === page ? "page" : undefined}
                    className={cn(
                      "inline-flex size-10 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      item === page
                        ? "bg-accent text-ink"
                        : "text-paper hover:bg-ink-2",
                    )}
                  >
                    {item}
                  </button>
                </li>
              ),
            )}
          </ol>
          <Button
            variant="ghost"
            className="px-3"
            disabled={page >= pageCount}
            onClick={() => onPage(page + 1)}
            aria-label="Next page"
          >
            <span>Next</span>
            <Icon icon={ChevronRight} />
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

function visiblePages(page: number, pageCount: number): Array<number | "…"> {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  const items = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...items]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);
  const result: Array<number | "…"> = [];
  for (const value of sorted) {
    const prev = result[result.length - 1];
    if (typeof prev === "number" && value - prev > 1) result.push("…");
    result.push(value);
  }
  return result;
}
