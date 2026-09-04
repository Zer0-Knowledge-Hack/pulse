import {
  categorySchema,
  featuredAgentSchema,
  type AgentListing,
  type AgentSignal,
  type Category,
  type FeaturedAgent,
} from "@era/domain";
import featuredJson from "../fixtures/featured.json";

const catalog = featuredAgentSchema.array().parse(featuredJson.agents);

export function listFeaturedAgents(category?: Category): FeaturedAgent[] {
  const parsed = category ? categorySchema.parse(category) : undefined;
  return parsed
    ? catalog.filter((agent) => agent.category === parsed)
    : catalog;
}

export function getFeaturedAgent(id: string): FeaturedAgent | undefined {
  return catalog.find((agent) => agent.id === id);
}

export function toListing(agent: FeaturedAgent): AgentListing {
  const { signal: _signal, ...listing } = agent;
  return listing;
}

export function getSignal(id: string): AgentSignal | undefined {
  return getFeaturedAgent(id)?.signal;
}
