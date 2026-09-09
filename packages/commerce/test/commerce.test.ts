import assert from "node:assert/strict";
import { createJob, getJob, expectedChainId, isLiveCommerceChain } from "../src/adapter";
import {
  COMMERCE_CONTRACTS,
  DEFAULT_EXPIRY_SECONDS,
  EVALUATOR_ROUTERS,
  HIRE_USER_ERRORS,
  MAX_EXPIRY_SECONDS,
  ON_CHAIN_STATUS,
  OPTIMISTIC_POLICIES,
  PAYMENT_TOKENS,
  TESTNET_DEFAULT_AMOUNT_WEI,
  getContractAddress,
  getEvaluatorRouter,
  getOptimisticPolicy,
  getPaymentToken,
  resolveExpiry,
} from "../src/config";
import {
  encodeJobDescription,
  mapHireError,
  onChainStatusToJobStatus,
  parseHireIntent,
  resolveTestnetAmountWei,
} from "../src/real";

const intent = {
  agentId: "range-keeper",
  budgetWei: "100000000000000000",
  task: "Rebalance the range.",
};

async function run(): Promise<void> {
  assert.equal(isLiveCommerceChain("local"), false);
  assert.equal(isLiveCommerceChain("bsc-testnet"), true);
  assert.equal(expectedChainId("bsc-testnet"), 97);
  assert.equal(expectedChainId("bsc-mainnet"), 56);

  parseHireIntent(intent);
  assert.throws(() => parseHireIntent({ ...intent, budgetWei: "0" }));
  assert.throws(() => parseHireIntent({ ...intent, agentId: " " }));

  assert.equal(resolveTestnetAmountWei(intent.budgetWei), intent.budgetWei);
  assert.equal(resolveTestnetAmountWei(intent.budgetWei, 56), intent.budgetWei);
  assert.equal(resolveTestnetAmountWei(intent.budgetWei, 97), TESTNET_DEFAULT_AMOUNT_WEI);
  assert.equal(resolveTestnetAmountWei("500000000000000", 97), "500000000000000");

  const created = await createJob(intent, { chain: "local" });
  assert.equal(created.status, "Funded");
  assert.equal(created.jobId.startsWith("mock-"), true);
  assert.equal(created.txHashes.length, 1);
  const stored = await getJob(created.jobId, { chain: "local" });
  assert.equal(stored?.jobId, created.jobId);
  assert.equal(stored?.status, "Funded");

  // The canonical deployment is the default, and a zero address is refused
  // rather than accepted as configuration.
  assert.equal(getContractAddress(undefined, 97), COMMERCE_CONTRACTS[97]);
  assert.equal(getContractAddress(undefined, 56), COMMERCE_CONTRACTS[56]);
  // Regression: the two chains must never resolve to the same address.
  // Dropping expectedChainId on a read path silently returned the testnet
  // contract while the wallet was on mainnet.
  assert.notEqual(COMMERCE_CONTRACTS[97], COMMERCE_CONTRACTS[56]);
  assert.equal(getPaymentToken(undefined, 97), PAYMENT_TOKENS[97]);
  assert.throws(() => getContractAddress("0x0000000000000000000000000000000000000000"));
  assert.throws(() => getContractAddress("not-an-address"));
  assert.throws(() => getPaymentToken("0x0000000000000000000000000000000000000000"));

  // Expiry must stay inside what the contract accepts.
  assert.equal(resolveExpiry(1_000n), 1_000n + DEFAULT_EXPIRY_SECONDS);
  assert.equal(DEFAULT_EXPIRY_SECONDS <= MAX_EXPIRY_SECONDS, true);

  // createJob takes a plain string description, so the agent can read it.
  const description = encodeJobDescription(intent);
  assert.equal(typeof description, "string");
  assert.deepEqual(JSON.parse(description), { agentId: intent.agentId, task: intent.task });

  // Regression: Submitted means the agent already delivered. Treating it as
  // "not funded" reported a timeout on a hire that had actually succeeded.
  const fundedEnough: readonly (typeof ON_CHAIN_STATUS)[number][] = [
    "Funded",
    "Submitted",
    "Completed",
  ];
  for (const status of fundedEnough) {
    assert.equal(ON_CHAIN_STATUS.includes(status), true, `${status} must be a real contract state`);
  }
  for (const notFunded of ["Open", "Rejected", "Expired"] as const) {
    assert.equal(fundedEnough.includes(notFunded), false);
  }

  // The status indices must line up with the contract's enum order, because
  // getJobStatus indexes this array with the raw uint8.
  assert.equal(ON_CHAIN_STATUS[0], "Open");
  assert.equal(ON_CHAIN_STATUS[1], "Funded");
  assert.equal(ON_CHAIN_STATUS[2], "Submitted");
  assert.equal(ON_CHAIN_STATUS[3], "Completed");
  assert.equal(ON_CHAIN_STATUS[4], "Rejected");
  assert.equal(ON_CHAIN_STATUS[5], "Expired");

  // The contract enum and the domain status names are the same six values.
  assert.equal(onChainStatusToJobStatus("Open"), "Open");
  assert.equal(onChainStatusToJobStatus("Funded"), "Funded");
  assert.equal(onChainStatusToJobStatus("Submitted"), "Submitted");
  assert.equal(onChainStatusToJobStatus("Completed"), "Completed");
  assert.equal(onChainStatusToJobStatus("Rejected"), "Rejected");
  assert.equal(onChainStatusToJobStatus("Expired"), "Expired");

  assert.equal(mapHireError(new Error("user rejected the request")).message, "You cancelled the operation.");
  assert.equal(
    mapHireError(new Error("ERC20InsufficientAllowance")).message,
    "Approve $U spending so the escrow can pull the budget.",
  );
  assert.equal(
    mapHireError(new Error("EnforcedPause()")).message,
    "Hiring is paused on the commerce contract right now.",
  );

  // Canonical EvaluatorRouter + OptimisticPolicy, and the revert selectors
  // that fire when createJob/fund skip them.
  assert.equal(getEvaluatorRouter(97), EVALUATOR_ROUTERS[97]);
  assert.equal(getOptimisticPolicy(97), OPTIMISTIC_POLICIES[97]);
  assert.notEqual(EVALUATOR_ROUTERS[97], EVALUATOR_ROUTERS[56]);
  assert.equal(DEFAULT_EXPIRY_SECONDS, 30n * 24n * 60n * 60n);
  assert.equal(
    mapHireError(new Error("execution reverted: 0x55c45de1")).message,
    HIRE_USER_ERRORS.hook,
  );
  assert.equal(
    mapHireError(new Error("execution reverted: 0x32d53d69")).message,
    HIRE_USER_ERRORS.policy,
  );
  assert.equal(
    mapHireError(new Error("execution reverted: 0xec43ea50")).message,
    HIRE_USER_ERRORS.hook,
  );
}

void run();
