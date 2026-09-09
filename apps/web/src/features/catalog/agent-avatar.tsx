import { CATEGORY_LABELS, type Category } from "@era/domain";
import { cn } from "@/lib/cn";
import { agentInitials } from "@/lib/format";

export function AgentAvatar({
  name,
  category,
  size = "md",
}: {
  name: string;
  category: Category;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-ink font-mono font-medium text-accent",
        size === "sm" && "size-10 text-xs",
        size === "md" && "size-12 text-sm",
        size === "lg" && "size-16 text-lg",
      )}
      title={`${name} · ${CATEGORY_LABELS[category]}`}
    >
      {agentInitials(name)}
    </div>
  );
}
