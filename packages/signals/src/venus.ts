import { batchEthCall, decodeAddressArray, padAddress, word } from "./rpc";

const WAD = 10n ** 18n;
const MAX_HEALTH_FACTOR = 999;

const SELECTOR_GET_ASSETS_IN = "abfceffc";
const SELECTOR_MARKETS = "8e8f294b";
const SELECTOR_BALANCE_OF = "70a08231";
const SELECTOR_BORROW_BALANCE_STORED = "95dd9193";
const SELECTOR_EXCHANGE_RATE_STORED = "182df0f5";
const SELECTOR_GET_UNDERLYING_PRICE = "fc57d4df";

export type VenusNetwork = {
  id: string;
  rpcUrl: string;
  comptroller: string;
  oracle: string;
};

const NETWORKS: Record<string, VenusNetwork> = {
  mainnet: {
    id: "mainnet",
    rpcUrl: "https://bsc-dataseed.bnbchain.org",
    comptroller: "0xfD36E2c2a6789Db23113685031d7F16329158384",
    oracle: "0x6592b5de802159f3e74b2486b091d11a8256ab8a",
  },
  testnet: {
    id: "testnet",
    rpcUrl: "https://bsc-testnet-rpc.publicnode.com",
    comptroller: "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D",
    oracle: "0x3cd69251d04a28d887ac14cbe2e14c52f3d57823",
  },
};

function envValue(name: string): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.[name];
}

export function resolveVenusNetwork(): VenusNetwork {
  const requested = (envValue("VENUS_NETWORK") ?? "").trim().toLowerCase();
  if (requested === "") {
    return NETWORKS.testnet as VenusNetwork;
  }
  const network = NETWORKS[requested];
  if (!network) {
    throw new Error(`Unknown VENUS_NETWORK "${requested}"`);
  }
  return network;
}

export type VenusPositionHealth = {
  healthFactor: number;
  liquidationPrice: number;
  marketCount: number;
};

type MarketReading = {
  collateralFactorWad: bigint;
  vTokenBalance: bigint;
  borrowBalance: bigint;
  exchangeRateWad: bigint;
  priceWad: bigint;
};

function selectMarketReading(results: (string | null)[], marketIndex: number): MarketReading | null {
  const base = marketIndex * 5;
  const rows = [
    results[base],
    results[base + 1],
    results[base + 2],
    results[base + 3],
    results[base + 4],
  ];
  if (rows.some((row) => row === null)) {
    return null;
  }
  return {
    collateralFactorWad: word(rows[0] as string, 1),
    vTokenBalance: word(rows[1] as string, 0),
    borrowBalance: word(rows[2] as string, 0),
    exchangeRateWad: word(rows[3] as string, 0),
    priceWad: word(rows[4] as string, 0),
  };
}

export async function readVenusPositionHealth(
  account: string,
  network: VenusNetwork = resolveVenusNetwork(),
): Promise<VenusPositionHealth | null> {
  const [assetsHex] = await batchEthCall(network.rpcUrl, [
    { to: network.comptroller, data: "0x" + SELECTOR_GET_ASSETS_IN + padAddress(account) },
  ]);
  if (!assetsHex) {
    throw new Error("Venus getAssetsIn call failed");
  }
  const enteredMarkets = decodeAddressArray(assetsHex);
  if (enteredMarkets.length === 0) {
    return null;
  }

  const calls = enteredMarkets.flatMap((vToken) => [
    { to: network.comptroller, data: "0x" + SELECTOR_MARKETS + padAddress(vToken) },
    { to: vToken, data: "0x" + SELECTOR_BALANCE_OF + padAddress(account) },
    { to: vToken, data: "0x" + SELECTOR_BORROW_BALANCE_STORED + padAddress(account) },
    { to: vToken, data: "0x" + SELECTOR_EXCHANGE_RATE_STORED },
    { to: network.oracle, data: "0x" + SELECTOR_GET_UNDERLYING_PRICE + padAddress(vToken) },
  ]);
  const results = await batchEthCall(network.rpcUrl, calls);

  let collateralWad = 0n;
  let borrowWad = 0n;
  let collateralCount = 0;
  let singleCollateralPriceWad = 0n;

  for (let index = 0; index < enteredMarkets.length; index += 1) {
    const reading = selectMarketReading(results, index);
    if (!reading) {
      throw new Error(`Venus market read failed for index ${index}`);
    }
    const underlyingWad = (reading.vTokenBalance * reading.exchangeRateWad) / WAD;
    const positionWad = (underlyingWad * reading.priceWad) / WAD;
    const borrowWadMarket = (reading.borrowBalance * reading.priceWad) / WAD;
    borrowWad += borrowWadMarket;
    if (reading.vTokenBalance > 0n) {
      collateralWad += (positionWad * reading.collateralFactorWad) / WAD;
      collateralCount += 1;
      singleCollateralPriceWad = reading.priceWad;
    }
  }

  if (collateralWad === 0n && borrowWad === 0n) {
    return null;
  }

  const healthFactor =
    borrowWad === 0n
      ? MAX_HEALTH_FACTOR
      : Math.min(Number((collateralWad * WAD) / borrowWad) / Number(WAD), MAX_HEALTH_FACTOR);

  const liquidationPrice =
    borrowWad > 0n && collateralCount === 1
      ? Number(singleCollateralPriceWad) / Number(WAD) / healthFactor
      : 0;

  return {
    healthFactor,
    liquidationPrice,
    marketCount: enteredMarkets.length,
  };
}
