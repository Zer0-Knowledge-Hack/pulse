/**
 * ERC-8004 identity registration for the four seed agents on BSC Testnet
 * (chain id 97).
 *
 * Workstream A owns this script. It is an operator tool, not part of any
 * agent runtime and not part of the root pnpm workspace, so nothing here can
 * change how an agent serves traffic.
 *
 * Only the holder of an agent's keystore can run this. The keystores live in
 * each agent workspace under `.studio/wallets`, which is gitignored, so a
 * fresh clone cannot run it at all. `WALLET_PASSWORD` is required even for
 * `--check`, because the runtime unlocks the key to build the provider before
 * any read reaches the chain.
 *
 * `--check` is still the safe mode: it reads the registration and writes
 * nothing on-chain. Run it first.
 *
 * Usage from this directory (`agents/scripts`):
 *
 *   pnpm install
 *   WALLET_PASSWORD=... pnpm register -- --agent hfwatch --check
 *   WALLET_PASSWORD=... pnpm register -- --agent hfwatch --endpoint https://host
 *
 * See REGISTRATION.md for the full runbook and for the `bag` CLI equivalent.
 */

import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

import { loadStudioToml, type TomlTable } from "@bnbagent/studio-runtime/config";
import { buildWallet } from "@bnbagent/studio-runtime/wallet";
import {
  AlreadyRegisteredError,
  ERC8004PartialRegistrationError,
  ERC8004TransactionPendingError,
  NotRegisteredError,
  register,
  show,
} from "@bnbagent/studio-runtime/erc8004";

const AGENTS_DIR = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");

/** Directory name -> marketplace category, mirroring agents/README.md. */
const CATEGORY_BY_AGENT: Readonly<Record<string, string>> = {
  hfwatch: "health_factor",
  rangekeeper: "rebalancing",
  yieldrouter: "yield",
  gridrunner: "grid_trading",
};

interface Args {
  agent: string;
  endpoint: string | null;
  network: string;
  check: boolean;
  noPaymaster: boolean;
}

function parseArgs(argv: string[]): Args {
  const out: Args = {
    agent: "",
    endpoint: null,
    network: "bsc-testnet",
    check: false,
    noPaymaster: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--agent":
        out.agent = argv[++i] ?? "";
        break;
      case "--endpoint":
        out.endpoint = argv[++i] ?? null;
        break;
      case "--network":
        out.network = argv[++i] ?? "bsc-testnet";
        break;
      case "--check":
        out.check = true;
        break;
      case "--no-paymaster":
        out.noPaymaster = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!(out.agent in CATEGORY_BY_AGENT)) {
    throw new Error(
      `--agent must be one of ${Object.keys(CATEGORY_BY_AGENT).join(", ")}`,
    );
  }
  if (!out.check && !out.endpoint) {
    throw new Error("--endpoint is required unless --check is passed");
  }
  return out;
}

function readString(table: TomlTable | undefined, key: string): string {
  const value = table?.[key];
  return typeof value === "string" ? value : "";
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = join(AGENTS_DIR, args.agent, "app", "agent");
  const tomlPath = join(projectRoot, "studio.toml");
  if (!existsSync(tomlPath)) {
    throw new Error(`No studio.toml at ${tomlPath}`);
  }

  const cfg = loadStudioToml(tomlPath);
  const walletCfg = (cfg.wallet ?? {}) as TomlTable;
  const declaredAddress = readString(walletCfg, "address");
  const name = readString((cfg.project ?? {}) as TomlTable, "name") || args.agent;

  if (!declaredAddress) {
    throw new Error(
      `studio.toml for ${args.agent} has no [wallet].address. Run \`bag wallet new\` in that workspace first.`,
    );
  }

  const wallet = buildWallet(walletCfg, projectRoot, { network: args.network });
  await run(args, wallet, name, declaredAddress);
}

async function run(
  args: Args,
  wallet: ReturnType<typeof buildWallet>,
  name: string,
  declaredAddress: string,
): Promise<void> {
  const category = CATEGORY_BY_AGENT[args.agent];

  let agentId: number;
  try {
    const record = await show(wallet, { network: args.network });
    agentId = record.agentId;
    console.log(
      `${args.agent}: already registered as agent_id=${agentId} (${record.address})`,
    );
    if (!args.check) {
      console.log(
        "Nothing written. To move its endpoint use `bag erc8004 update-endpoint --endpoint <url>`.",
      );
    }
  } catch (err) {
    if (!(err instanceof NotRegisteredError)) {
      throw err;
    }
    if (args.check) {
      console.log(`${args.agent}: not registered on ${args.network}`);
      return;
    }
    agentId = await registerAgent(args, wallet, name);
  }

  printListingFacts(args, agentId, category, declaredAddress);
}

async function registerAgent(
  args: Args,
  wallet: ReturnType<typeof buildWallet>,
  name: string,
): Promise<number> {
  try {
    const agentId = await register(wallet, args.endpoint as string, {
      network: args.network,
      name,
      description: `pulse seed agent for the ${CATEGORY_BY_AGENT[args.agent]} category on BNB Smart Chain.`,
      protocol: "A2A",
      noPaymaster: args.noPaymaster,
    });
    console.log(`${args.agent}: registered as agent_id=${agentId}`);
    return agentId;
  } catch (err) {
    if (err instanceof AlreadyRegisteredError && err.agentId !== null) {
      console.log(`${args.agent}: wallet already owns agent_id=${err.agentId}`);
      return err.agentId;
    }
    if (err instanceof ERC8004PartialRegistrationError) {
      console.error(
        `${args.agent}: minted agent_id=${err.agentId} but the URI did not complete. ` +
          "Re-run `bag erc8004 update-endpoint --endpoint <url>` before handing the id to Catalog.",
      );
      return err.agentId;
    }
    if (err instanceof ERC8004TransactionPendingError) {
      console.error(
        `${args.agent}: register tx ${err.txHash} was broadcast but not confirmed. ` +
          "Check it on BscScan testnet before retrying, or you will mint a second identity.",
      );
    }
    throw err;
  }
}

/**
 * Print the record Catalog needs. Workstream A hands these facts over;
 * Catalog is the only stream that edits
 * `packages/indexer/fixtures/featured.json`.
 */
function printListingFacts(
  args: Args,
  agentId: number,
  category: string,
  ownerAddress: string,
): void {
  const facts = {
    agent: args.agent,
    category,
    chainId: args.network === "bsc-mainnet" ? 56 : 97,
    erc8004TokenId: String(agentId),
    owner: ownerAddress,
    endpoints: {
      a2a: args.endpoint
        ? `${args.endpoint.replace(/\/$/, "")}/.well-known/agent-card.json`
        : null,
      mcp: args.endpoint ? `${args.endpoint.replace(/\/$/, "")}/mcp` : null,
    },
  };
  console.log("\nListing facts for Catalog (workstream C):");
  console.log(JSON.stringify(facts, null, 2));
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
