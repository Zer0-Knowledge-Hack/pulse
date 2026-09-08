import assert from "node:assert/strict";
import { createJob, getJob, expectedChainId, isLiveCommerceChain } from "../src/adapter";
import {
  COMMERCE_CONTRACTS,
  DEFAULT_EXPIRY_SECONDS,
  MAX_EXPIRY_SECONDS,
  PAYMENT_TOKENS,
  TESTNET_DEFAULT_AMOUNT_WEI,
  getContractAddress,
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
}

void run();
