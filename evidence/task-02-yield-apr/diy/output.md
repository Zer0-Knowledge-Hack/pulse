# DIY leg — task 2, 2026-09-09

- **Rail:** `no-agent competitor` (public third-party aggregation; marketplace not involved, agent not involved)
- **Input:** $10,000 USDT notional, BSC venues: Lista staking, Venus money market, PancakeSwap farms
- **Tool:** DefiLlama public yields endpoint (`https://yields.llama.fi/pools`), all BSC pools scanned and sorted by APY (unfiltered — includes every pool of the three venues, not cherry-picked)

## Raw scan (unedited, exact API output — timestamps 2026-09-09)

**Venus (top-4 by TVL):**

- BTCB — TVL $354,074,940 — APY 0.18861%
- WBNB — TVL $336,409,890 — APY 0.07062%
- SOLVBTC — TVL $199,783,267 — APY 0%
- **USDT — TVL $70,191,415 — APY 2.52743%**  ← USDT venue for the task

**Lista staking (top-4 by TVL):**

- SLISBNB — TVL $751,587,428 — APY 0.98241%
- BNB — TVL $368,747,740 — APY 0.18884%
- USD1 — TVL $138,124,104 — APY 1.19768%
- SLISBNB (second pool) — TVL $90,262,750 — APY 0%

**PancakeSwap farms (top-4 by TVL, non-smart pools):**

- **CAKE-WBNB — TVL $10,250,219 — APY 4.19947%**  ← highest LP APY of the scan
- WBNB-BUSD — TVL $1,253,148 — APY 2.38303%
- BTCB-WBNB — TVL $932,346 — APY 2.43796%
- ETH-WBNB — TVL $574,981 — APY 1.97469%

## Comparison the DIY leg produces

1. **Top net-APR venue (stable-compatible):** PancakeSwap `CAKE-WBNB` LP at **4.20%** —
   but it is *not* USDT-denominated (impermanent-loss exposure on a $10k USDT plan
   requires the second pick: **Venus USDT at 2.53%**, USDT supply direct).
2. **Runner-up:** Venus USDT 2.53% (stable-native, no IL) — arguably the true nets pick
   for idle USDT; CAKE-WBNB wins gross APY but carries IL risk on one side.
3. **Allocation verdict:** **`split`** — 100% USDT direct would be the "safe park";
   the DIY answer: park 100% in Venus USDT (2.53%) unless IL is accepted, in which
   case split 50/50 CAKE-WBNB / Venus-USDT for the extra ~170 bps.
4. **Provenance:** DefiLlama yields API, 2026-09-09 scan (machine time); numbers are
   third-party aggregates of on-chain state, not the venues' own dashboards.

## Human manual cost (same query, no script)

Venus dashboard + Lista staking page + PancakeSwap info pages: est. **10–20 min**
first pass, ~5 min per repeat; output = one-shot table without a timestamped
aggregation trail unless the human freezes numbers manually.
