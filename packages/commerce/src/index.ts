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
} from "./real";
export type {
  CommerceWriteClients,
  HirePhase,
  JobOnChainStatus,
  RealHireOptions,
  RealHireResult,
} from "./real";

export {
  CONTRACT_ADDRESS,
  ERC8183_ABI,
  HIRE_USER_ERRORS,
  TESTNET_DEFAULT_AMOUNT_WEI,
  getContractAddress,
  isPlaceholderContract,
  PLACEHOLDER_ERC8183_ADDRESS,
} from "./config";
