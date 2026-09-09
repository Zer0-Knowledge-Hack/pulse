import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORY_JOBS, CATEGORY_LABELS, type Category } from "@era/domain";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { CATEGORY_ICONS, CATEGORY_ORDER } from "./category-meta";

export { CATEGORY_ORDER } from "./category-meta";

export function CategoryNav({
  active,
  variant = "grid",
}: {
  active?: Category;
  variant?: "grid" | "pills";
}) {
  if (variant === "pills") {
    return <CategoryPills active={active} />;
  }

  return (
    <>
      <div className="lg:hidden">
        <CategorySlider active={active} />
      </div>
      <nav aria-label="Job categories" className="hidden gap-2 lg:grid lg:grid-cols-4">
        {CATEGORY_ORDER.map((category) => (
          <CategoryCard key={category} category={category} active={active === category} />
        ))}
      </nav>
    </>
  );
}

function CategoryPills({ active }: { active?: Category }) {
  return (
    <nav aria-label="Job categories" className="hide-scrollbar -mx-4 overflow-x-auto px-4">
      <ul className="flex snap-x snap-mandatory gap-2">
        {CATEGORY_ORDER.map((category) => (
          <li key={category} className="shrink-0 snap-start">
            <Link
              to="/browse/$category"
              params={{ category }}
              aria-current={active === category ? "page" : undefined}
              className={cn(
                "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
                active === category
                  ? "border-accent bg-accent/15 text-paper"
                  : "border-line text-muted hover:border-accent/50 hover:text-paper",
              )}
            >
              <Icon icon={CATEGORY_ICONS[category]} className="text-accent" />
              {CATEGORY_LABELS[category]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CategorySlider({ active }: { active?: Category }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const scroller = scrollerRef.current;
    const first = scroller?.firstElementChild as HTMLElement | null;
    if (!scroller || !first) return;
    const width = first.offsetWidth + 8;
    setIndex(Math.round(scroller.scrollLeft / width));
  }

  function go(next: number) {
    const card = scrollerRef.current?.children[next] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="lede">Swipe to pick a job</p>
        <div className="flex gap-1">
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-line"
            aria-label="Previous jobs"
            onClick={() => go(Math.max(0, index - 1))}
          >
            <Icon icon={ChevronLeft} />
          </button>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-line"
            aria-label="Next jobs"
            onClick={() => go(Math.min(CATEGORY_ORDER.length - 1, index + 1))}
          >
            <Icon icon={ChevronRight} />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4"
      >
        {CATEGORY_ORDER.map((category) => (
          <div key={category} className="w-[min(72vw,16.5rem)] shrink-0 snap-center">
            <CategoryCard category={category} active={active === category} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {CATEGORY_ORDER.map((category, i) => (
          <button
            key={category}
            type="button"
            aria-label={`Go to ${CATEGORY_LABELS[category]}`}
            onClick={() => go(i)}
            className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-accent" : "w-1.5 bg-line")}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ category, active }: { category: Category; active?: boolean }) {
  return (
    <Link
      to="/browse/$category"
      params={{ category }}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-full flex-col rounded-2xl border p-3.5 transition-colors",
        active ? "border-accent bg-ink-2" : "border-line bg-ink-2/80 hover:border-accent/50",
      )}
    >
      <span className="icon-well">
        <Icon icon={CATEGORY_ICONS[category]} />
      </span>
      <p className="mt-2 text-sm font-medium">{CATEGORY_LABELS[category]}</p>
      <p className="lede mt-1">{CATEGORY_JOBS[category]}</p>
    </Link>
  );
}
