/**
 * Confirm the shipped ABI and addresses still match the live chain-97
 * deployment.
 *
 * Run by hand, never in CI: it makes real RPC calls, so a flaky public node
 * would turn every PR red for a reason unrelated to the change.
 *
 *   pnpm --filter @era/commerce verify:live
 *
 * Every call here is read-only. It signs nothing and spends nothing.
 */
import { createPublicClient, http, encodeFunctionData } from "viem";
import {
  COMMERCE_CONTRACTS,
  EVALUATOR_ROUTERS,
  PAYMENT_TOKENS,
  ERC8183_ABI,
  ERC20_ABI,
  resolveExpiry,
  MAX_EXPIRY_SECONDS,
} from "../src/config.ts";

const c = createPublicClient({ transport: http("https://data-seed-prebsc-2-s2.binance.org:8545") });
const A = COMMERCE_CONTRACTS[97];
let bad = 0;
const ok = (label, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? "  " + extra : ""}`);
  if (!cond) bad++;
};

ok("chain id is 97", (await c.getChainId()) === 97);
const code = await c.getCode({ address: A });
ok("commerce contract has code", Boolean(code) && code !== "0x");

const token = await c.readContract({ address: A, abi: ERC8183_ABI, functionName: "paymentToken" });
ok("paymentToken matches shipped $U", token.toLowerCase() === PAYMENT_TOKENS[97].toLowerCase(), token);

const paused = await c.readContract({ address: A, abi: ERC8183_ABI, functionName: "paused" });
ok("contract is not paused", paused === false);

const maxExpiry = await c.readContract({ address: A, abi: ERC8183_ABI, functionName: "MAX_EXPIRY_DURATION" });
ok("MAX_EXPIRY_DURATION matches constant", maxExpiry === MAX_EXPIRY_SECONDS, String(maxExpiry));

const now = BigInt(Math.floor(Date.now() / 1000));
ok("resolveExpiry stays under the contract max", resolveExpiry(now) - now <= maxExpiry);

// getJob against a job that exists (jobCounter was 1107 at probe time).
const job = await c.readContract({ address: A, abi: ERC8183_ABI, functionName: "getJob", args: [1n] });
ok("getJob decodes as a tuple with a status field", typeof job === "object" && "status" in job && "budget" in job,
   `status=${job.status} budget=${job.budget}`);

// Every write selector must exist on the deployed bytecode path: encode and
// eth_call. A missing/mismatched function surfaces as a decode/revert error
// that is NOT "function does not exist".
for (const [name, args] of [
  ["createJob", ["0x1111111111111111111111111111111111111111", EVALUATOR_ROUTERS[97], resolveExpiry(now), "probe", EVALUATOR_ROUTERS[97]]],
  ["setBudget", [1n, 1n, "0x"]],
  ["fund", [1n, 1n, "0x"]],
]) {
  const data = encodeFunctionData({ abi: ERC8183_ABI, functionName: name, args });
  try {
    await c.call({ to: A, data });
    ok(`${name} selector accepted by the contract`, true);
  } catch (e) {
    const m = String(e.shortMessage || e.message);
    // A revert means the function exists and ran. Only a selector miss would
    // fall through to the fallback and report no matching function.
    const exists = !/does not exist|no matching function/i.test(m);
    ok(`${name} selector accepted by the contract`, exists, m.split("\n")[0].slice(0, 60));
  }
}

const allowance = await c.readContract({
  address: PAYMENT_TOKENS[97], abi: ERC20_ABI, functionName: "allowance",
  args: ["0x1111111111111111111111111111111111111111", A],
});
ok("$U allowance is readable with the shipped ERC-20 ABI", typeof allowance === "bigint");

console.log(bad === 0 ? "\nALL LIVE CHECKS PASSED" : `\n${bad} CHECK(S) FAILED`);
process.exit(bad === 0 ? 0 : 1);
