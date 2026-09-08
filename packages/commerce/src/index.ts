export {
  createMockJob,
  getMockJob,
  revokeMockSession,
  listMockJobs,
} from "./mock";

export {
  createJob,
  getJob,
  revokeJob,
  resolveCommerceChain,
  isLiveCommerceChain,
  expectedChainId,
  validateHireReady,
} from "./adapter";
export type { CreateJobOptions, GetJobOptions } from "./adapter";

export {
  createRealJob,
  setJobBudget,
  ensureAllowance,
  fundRealJob,
  createAndFundJob,
  getJobStatus,
  waitForFundedStatus,
  mapHireError,
  parseHireIntent,
  parseBudgetWei,
  resolveAgentAddress,
  resolveTestnetAmountWei,
  toFundedJobView,
  onChainStatusToJobStatus,
  assertAffordable,
  encodeJobDescription,
} from "./real";
export type {
  CommerceWriteClients,
  HirePhase,
  JobOnChainStatus,
  RealHireOptions,
  RealHireResult,
} from "./real";

export {
  COMMERCE_CONTRACTS,
  PAYMENT_TOKENS,
  ERC8183_ABI,
  ERC20_ABI,
  HIRE_USER_ERRORS,
  ON_CHAIN_STATUS,
  TESTNET_DEFAULT_AMOUNT_WEI,
  MAX_EXPIRY_SECONDS,
  DEFAULT_EXPIRY_SECONDS,
  ZERO_ADDRESS,
  getContractAddress,
  getPaymentToken,
  resolveExpiry,
} from "./config";
