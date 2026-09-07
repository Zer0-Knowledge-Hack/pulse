import assert from "node:assert/strict";
import { createJob, getJob, expectedChainId, isLiveCommerceChain } from "../src/adapter";
import { getContractAddress, PLACEHOLDER_ERC8183_ADDRESS, TESTNET_DEFAULT_AMOUNT_WEI } from "../src/config";
import { mapHireError, onChainStatusToJobStatus, parseHireIntent, resolveTestnetAmountWei } from "../src/real";

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

  assert.throws(() => getContractAddress(PLACEHOLDER_ERC8183_ADDRESS));
  assert.equal(onChainStatusToJobStatus("Created"), "Open");
  assert.equal(onChainStatusToJobStatus("Funded"), "Funded");
  assert.equal(onChainStatusToJobStatus("Completed"), "Completed");
  assert.equal(mapHireError(new Error("user rejected the request")).message, "You cancelled the operation.");
}

void run();
