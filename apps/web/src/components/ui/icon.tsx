import { type LucideIcon, type LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";

export function Icon({
  icon: Glyph,
  className,
  ...props
}: { icon: LucideIcon } & LucideProps) {
  return <Glyph className={cn("size-4 shrink-0", className)} strokeWidth={1.75} {...props} />;
}
