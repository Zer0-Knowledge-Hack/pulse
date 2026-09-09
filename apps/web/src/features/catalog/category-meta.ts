import { HeartPulse, LayoutGrid, RefreshCw, TrendingUp, type LucideIcon } from "lucide-react";
import { CATEGORY_JOBS, CATEGORY_LABELS, type Category } from "@era/domain";

export const CATEGORY_ORDER: Category[] = [
  "health_factor",
  "rebalancing",
  "grid_trading",
  "yield",
];

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  health_factor: HeartPulse,
  rebalancing: RefreshCw,
  grid_trading: LayoutGrid,
  yield: TrendingUp,
};

export function categoryCopy(category: Category) {
  return {
    label: CATEGORY_LABELS[category],
    job: CATEGORY_JOBS[category],
    icon: CATEGORY_ICONS[category],
  };
}
