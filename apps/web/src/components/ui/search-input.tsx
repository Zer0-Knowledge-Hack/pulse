import { type FormEvent } from "react";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function SearchInput({
  value,
  onChange,
  onSubmit,
  loading = false,
  placeholder = "Search agents…",
  id = "agent-search",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit?.(value.trim());
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cn("w-full", className)}>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <div className="flex min-h-10 items-center gap-2 rounded-full border border-line bg-ink px-3 focus-within:border-accent">
        {loading ? (
          <Icon icon={Loader2} className="animate-spin text-muted" />
        ) : (
          <Icon icon={Search} className="text-muted" />
        )}
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-paper outline-none placeholder:text-muted"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onSubmit?.("");
            }}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:text-paper"
            aria-label="Clear search"
          >
            <Icon icon={X} />
          </button>
        ) : null}
      </div>
    </form>
  );
}
