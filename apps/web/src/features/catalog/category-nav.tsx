import { CATEGORY_JOBS, CATEGORY_LABELS, type Category } from "@era/domain";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

const ORDER: Category[] = [
  "health_factor",
  "rebalancing",
  "grid_trading",
  "yield",
];

export function CategoryNav({ active }: { active?: Category }) {
  return (
    <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ORDER.map((category) => (
        <Link
          key={category}
          to="/browse/$category"
          params={{ category }}
          className={cn(
            "rounded-md border p-4 transition-colors",
            active === category
              ? "border-accent bg-ink-2"
              : "border-line hover:border-accent/60",
          )}
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-accent">
            {CATEGORY_LABELS[category]}
          </p>
          <p className="mt-2 text-sm text-muted">{CATEGORY_JOBS[category]}</p>
        </Link>
      ))}
    </nav>
  );
}
