import {
  hireIntentSchema,
  type HireIntent,
  type JobView,
  type SessionView,
} from "@era/domain";

const jobs = new Map<string, JobView>();
let seq = 1;

function isoNow(): string {
  return new Date().toISOString();
}

function mockSession(agentId: string): SessionView {
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return {
    keyId: `mock:${agentId}`,
    spendCapWei: "100000000000000000",
    expiry,
    allowlist: ["AgenticCommerce.fund", "Venus.repay", "PancakeV3.increaseLiquidity"],
    revoked: false,
  };
}

export function createMockJob(input: HireIntent): JobView {
  const intent = hireIntentSchema.parse(input);
  const job: JobView = {
    jobId: `mock-${seq}`,
    agentId: intent.agentId,
    budgetWei: intent.budgetWei,
    task: intent.task,
    status: "Funded",
    txHashes: [`0xmock${String(seq).padStart(62, "0")}`],
    session: mockSession(intent.agentId),
    createdAt: isoNow(),
  };
  seq += 1;
  jobs.set(job.jobId, job);
  return job;
}

export function getMockJob(jobId: string): JobView | undefined {
  return jobs.get(jobId);
}

export function revokeMockSession(jobId: string): JobView | undefined {
  const job = jobs.get(jobId);
  if (!job?.session) {
    return job;
  }
  const next: JobView = {
    ...job,
    session: { ...job.session, revoked: true },
  };
  jobs.set(jobId, next);
  return next;
}

export function listMockJobs(): JobView[] {
  return [...jobs.values()];
}
