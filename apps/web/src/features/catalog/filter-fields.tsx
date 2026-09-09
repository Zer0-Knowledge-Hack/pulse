import type { CatalogQuery, SortKey } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export function FilterFields({
  value,
  onChange,
  showFeatured,
  showX402,
  showOffline,
  namePrefix = "filters",
}: {
  value: CatalogQuery;
  onChange: (next: CatalogQuery) => void;
  showFeatured: boolean;
  showX402: boolean;
  showOffline: boolean;
  namePrefix?: string;
}) {
  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Availability</legend>
        <Radio
          name={`${namePrefix}-availability`}
          checked={value.availability === "all"}
          onChange={() => onChange({ ...value, availability: "all" })}
          label="All agents"
        />
        <Radio
          name={`${namePrefix}-availability`}
          checked={value.availability === "live"}
          onChange={() => onChange({ ...value, availability: "live" })}
          label="Live"
        />
        {showOffline ? (
          <Radio
            name={`${namePrefix}-availability`}
            checked={value.availability === "offline"}
            onChange={() => onChange({ ...value, availability: "offline" })}
            label="Offline"
          />
        ) : null}
      </fieldset>

      {showFeatured || showX402 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Listing</legend>
          {showFeatured ? (
            <Checkbox
              checked={value.featuredOnly}
              onChange={(featuredOnly) => onChange({ ...value, featuredOnly })}
              label="Featured only"
            />
          ) : null}
          {showX402 ? (
            <Checkbox
              checked={value.x402Only}
              onChange={(x402Only) => onChange({ ...value, x402Only })}
              label="x402 payment"
            />
          ) : null}
        </fieldset>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Sort</legend>
        {(
          [
            ["featured", "Featured first"],
            ["newest", "Newest"],
            ["name", "Name A–Z"],
          ] as Array<[SortKey, string]>
        ).map(([sort, label]) => (
          <Radio
            key={sort}
            name={`${namePrefix}-sort`}
            checked={value.sort === sort}
            onChange={() => onChange({ ...value, sort })}
            label={label}
          />
        ))}
      </fieldset>
    </div>
  );
}

function Radio({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-4 accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      {label}
    </label>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      {label}
    </label>
  );
}

export function SortSelect({
  value,
  onChange,
  id = "catalog-sort",
}: {
  value: SortKey;
  onChange: (sort: SortKey) => void;
  id?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <label htmlFor={id} className="sr-only sm:not-sr-only sm:text-sm sm:text-muted">
        Sort
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)}
        className={cn(
          "min-h-11 min-w-0 flex-1 rounded-full border border-line bg-ink px-3 text-sm text-paper",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        )}
      >
        <option value="featured">Featured first</option>
        <option value="newest">Newest</option>
        <option value="name">Name A–Z</option>
      </select>
    </div>
  );
}
