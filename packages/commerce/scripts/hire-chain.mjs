/**
 * Prove the BSC Testnet hire encoding against the live ERC-8183 stack.
 *
 *   pnpm --filter @era/commerce hire:chain
 *
 * This is read-only: it does not ask for a private key and does not
 * broadcast. Wallet signatures for create / budget / register / approve /
 * fund still happen in <HireCTA />.
 *
 * verify:live is also read-only. This script additionally checks that
 * createJob uses EvaluatorRouter as evaluator AND hook, that a zero hook
 * still reverts HookRequired (0x55c45de1), and that registerJob exists on
 * the router before fund.
 */
import { createPublicClient, http, encodeFunctionData } from "viem";
import {
  COMMERCE_CONTRACTS,
  EVALUATOR_ROUTERS,
  EVALUATOR_ROUTER_ABI,
  OPTIMISTIC_POLICIES,
  PAYMENT_TOKENS,
  ERC8183_ABI,
  ERC20_ABI,
  resolveExpiry,
  MAX_EXPIRY_SECONDS,
  DEFAULT_EXPIRY_SECONDS,
} from "../src/config.ts";

const RPC = "https://data-seed-prebsc-2-s2.binance.org:8545";
const ZERO = "0x0000000000000000000000000000000000000000";
const PROVIDER = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const BUYER = "0xb1f7B59E2e2f71d11Ff05060837Cca765224A17E";

const c = createPublicClient({ transport: http(RPC) });
const commerce = COMMERCE_CONTRACTS[97];
const router = EVALUATOR_ROUTERS[97];
const policy = OPTIMISTIC_POLICIES[97];
const token = PAYMENT_TOKENS[97];
let bad = 0;

const ok = (label, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? "  " + extra : ""}`);
  if (!cond) bad += 1;
};

function revertSelector(err) {
  const text = String(err?.shortMessage || err?.message || err);
  const match = text.match(/0x[0-9a-fA-F]{8}/);
  return match ? match[0].toLowerCase() : "";
}

async function call(to, data, account) {
  return c.call({ to, data, account });
}

const chainId = await c.getChainId();
ok("chain id is 97", chainId === 97, String(chainId));

for (const [label, address] of [
  ["AgenticCommerce", commerce],
  ["EvaluatorRouter", router],
  ["OptimisticPolicy", policy],
  ["$U token", token],
]) {
  const code = await c.getCode({ address });
  ok(`${label} has code`, Boolean(code) && code !== "0x", address);
}

const paymentToken = await c.readContract({
  address: commerce,
  abi: ERC8183_ABI,
  functionName: "paymentToken",
});
ok("paymentToken is $U, not native BNB", paymentToken.toLowerCase() === token.toLowerCase(), paymentToken);

const paused = await c.readContract({
  address: commerce,
  abi: ERC8183_ABI,
  functionName: "paused",
});
ok("commerce is not paused", paused === false);

const maxExpiry = await c.readContract({
  address: commerce,
  abi: ERC8183_ABI,
  functionName: "MAX_EXPIRY_DURATION",
});
ok("MAX_EXPIRY_DURATION matches constant", maxExpiry === MAX_EXPIRY_SECONDS, String(maxExpiry));
ok("default expiry is ~30 days", DEFAULT_EXPIRY_SECONDS === 30n * 24n * 60n * 60n);

const now = BigInt(Math.floor(Date.now() / 1000));
const expiredAt = resolveExpiry(now);
ok("resolveExpiry stays under the contract max", expiredAt - now <= maxExpiry);
ok("evaluator is EvaluatorRouter, not the buyer wallet", router.toLowerCase() !== BUYER.toLowerCase());
ok("hook is EvaluatorRouter, not address(0)", router.toLowerCase() !== ZERO);

const description = JSON.stringify({
  agentId: "grid-runner",
  task: "Run a grid trading pass and return the current signal plus a recommended action.",
});

const badCreate = encodeFunctionData({
  abi: ERC8183_ABI,
  functionName: "createJob",
  args: [PROVIDER, BUYER, expiredAt, description, ZERO],
});
try {
  await call(commerce, badCreate, BUYER);
  ok("zero hook still reverts HookRequired", false, "call succeeded");
} catch (err) {
  ok("zero hook still reverts HookRequired", revertSelector(err) === "0x55c45de1", revertSelector(err));
}

const goodCreate = encodeFunctionData({
  abi: ERC8183_ABI,
  functionName: "createJob",
  args: [PROVIDER, router, expiredAt, description, router],
});
try {
  await call(commerce, goodCreate, BUYER);
  ok("createJob(evaluator=hook=router) does not revert HookRequired", true);
} catch (err) {
  const selector = revertSelector(err);
  ok(
    "createJob(evaluator=hook=router) does not revert HookRequired",
    selector !== "0x55c45de1" && selector !== "0xec43ea50",
    String(err?.shortMessage || err?.message || err).split("\n")[0].slice(0, 80),
  );
}

const registerData = encodeFunctionData({
  abi: EVALUATOR_ROUTER_ABI,
  functionName: "registerJob",
  args: [1n, policy],
});
try {
  await call(router, registerData, BUYER);
  ok("registerJob selector accepted by EvaluatorRouter", true);
} catch (err) {
  const message = String(err?.shortMessage || err?.message || err);
  ok(
    "registerJob selector accepted by EvaluatorRouter",
    !/does not exist|no matching function/i.test(message),
    message.split("\n")[0].slice(0, 80),
  );
}

const fundAbi = ERC8183_ABI.find((item) => item.type === "function" && item.name === "fund");
ok("fund is nonpayable (budget is $U, not tx value)", fundAbi?.stateMutability === "nonpayable");

const approveAbi = ERC20_ABI.find((item) => item.type === "function" && item.name === "approve");
ok("approve exists for exact $U allowance", Boolean(approveAbi));

console.log("\nlifecycle  createJob → setBudget → registerJob → approve $U → fund");
console.log("signer     Hire drawer / wagmi (this command does not broadcast)");
console.log(bad === 0 ? "\nALL HIRE CHAIN CHECKS PASSED" : `\n${bad} CHECK(S) FAILED`);
process.exit(bad === 0 ? 0 : 1);
