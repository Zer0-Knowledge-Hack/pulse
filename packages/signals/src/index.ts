import { getSignal } from "@era/indexer";
import type { AgentSignal } from "@era/domain";

export function getAgentSignal(agentId: string): AgentSignal | undefined {
  return getSignal(agentId);
}
