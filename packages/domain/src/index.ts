import { z } from "zod";

export const categorySchema = z.enum([
  "rebalancing",
  "grid_trading",
  "yield",
  "health_factor",
]);

export type Category = z.infer<typeof categorySchema>;

export const CATEGORY_LABELS: Record<Category, string> = {
  rebalancing: "Rebalancing",
  grid_trading: "Grid trading",
  yield: "Yield",
  health_factor: "Health factor",
};

export const CATEGORY_JOBS: Record<Category, string> = {
  rebalancing: "Keep LP ranges in market and reset when they drift.",
  grid_trading: "Run bounded grid orders and show whether they actually fill.",
  yield: "Park idle capital where net APR is highest right now.",
  health_factor: "Watch lending positions and act before liquidation.",
};

export const chainIdSchema = z.union([z.literal(56), z.literal(97)]);
export type ChainId = z.infer<typeof chainIdSchema>;

export const agentListingSchema = z.object({
  id: z.string().min(1),
  chainId: chainIdSchema,
  erc8004TokenId: z.string().min(1),
  category: categorySchema,
  name: z.string().min(1),
  description: z.string().min(1),
  owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  endpoints: z.object({
    a2a: z.string().url().nullable(),
    mcp: z.string().url().nullable(),
  }),
  commerce: z.object({
    erc8183Provider: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    x402: z.boolean(),
  }),
  featured: z.boolean(),
  live: z.boolean(),
  createdAt: z.string().datetime(),
});

export type AgentListing = z.infer<typeof agentListingSchema>;

export const rebalancingSignalSchema = z.object({
  category: z.literal("rebalancing"),
  inRangePct: z.number(),
  feesUsd: z.number(),
  impermanentLossUsd: z.number(),
  lastRebalanceAt: z.string().datetime(),
});

export const gridTradingSignalSchema = z.object({
  category: z.literal("grid_trading"),
  lowerBound: z.number(),
  upperBound: z.number(),
  fillRatePct: z.number(),
  realizedPnlUsd: z.number(),
  windowHours: z.number(),
});

export const yieldSignalSchema = z.object({
  category: z.literal("yield"),
  venue: z.string(),
  netAprPct: z.number(),
  allocationPct: z.number(),
  lastHopAt: z.string().datetime(),
});

export const healthFactorSignalSchema = z.object({
  category: z.literal("health_factor"),
  healthFactor: z.number(),
  liquidationPrice: z.number(),
  protocol: z.string(),
  lastActionAt: z.string().datetime(),
});

export const agentSignalSchema = z.discriminatedUnion("category", [
  rebalancingSignalSchema,
  gridTradingSignalSchema,
  yieldSignalSchema,
  healthFactorSignalSchema,
]);

export type AgentSignal = z.infer<typeof agentSignalSchema>;

export const featuredAgentSchema = agentListingSchema.extend({
  signal: agentSignalSchema,
});

export type FeaturedAgent = z.infer<typeof featuredAgentSchema>;

export const jobStatusSchema = z.enum([
  "Open",
  "Funded",
  "Submitted",
  "Completed",
  "Rejected",
  "Expired",
]);

export type JobStatus = z.infer<typeof jobStatusSchema>;

export const hireIntentSchema = z.object({
  agentId: z.string().min(1),
  budgetWei: z.string().regex(/^\d+$/),
  task: z.string().min(1),
});

export type HireIntent = z.infer<typeof hireIntentSchema>;

export const sessionViewSchema = z.object({
  keyId: z.string(),
  spendCapWei: z.string(),
  expiry: z.string().datetime(),
  allowlist: z.array(z.string()),
  revoked: z.boolean(),
});

export type SessionView = z.infer<typeof sessionViewSchema>;

export const jobViewSchema = z.object({
  jobId: z.string(),
  agentId: z.string(),
  budgetWei: z.string(),
  task: z.string(),
  status: jobStatusSchema,
  txHashes: z.array(z.string()),
  session: sessionViewSchema.nullable(),
  createdAt: z.string().datetime(),
});

export type JobView = z.infer<typeof jobViewSchema>;
