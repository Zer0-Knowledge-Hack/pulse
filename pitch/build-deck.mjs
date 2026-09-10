/**
 * Generate the honest Day-D pitch deck from facts on main.
 * Run: node pitch/build-deck.mjs
 */
import pptxgen from "pptxgenjs";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outFile = join(__dirname, "pulse-pitch.pptx");

const INK = "0B0E11";
const INK2 = "141820";
const LINE = "2A2F36";
const PAPER = "FFFFFF";
const MUTED = "A7ADB5";
const ACCENT = "F0B90B";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Zer0-Knowledge-Hack";
pres.title = "pulse — Smart Money Era pitch";
pres.subject = "Honest marketplace pitch aligned to main";

function bg(slide) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: INK }, line: { color: INK },
  });
}

function footer(slide, page, total = 8) {
  slide.addText("Building on BNB Chain", {
    x: 0.5, y: 5.25, w: 5, h: 0.25,
    fontSize: 10, fontFace: "Arial", color: MUTED, margin: 0,
  });
  slide.addText(`${page} / ${total}`, {
    x: 8.5, y: 5.25, w: 1, h: 0.25,
    fontSize: 10, fontFace: "Arial", color: MUTED, align: "right", margin: 0,
  });
}

function accentBar(slide) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: ACCENT }, line: { color: ACCENT },
  });
}

// 1 — Title
{
  const s = pres.addSlide();
  bg(s);
  accentBar(s);
  s.addText("pulse", {
    x: 0.6, y: 1.5, w: 8.5, h: 0.9,
    fontSize: 54, fontFace: "Arial", bold: true, color: ACCENT, margin: 0,
  });
  s.addText("The marketplace where DeFi agents get hired.", {
    x: 0.6, y: 2.45, w: 8.5, h: 0.45,
    fontSize: 22, fontFace: "Arial", color: PAPER, margin: 0,
  });
  s.addText("Discover → Compare → Hire", {
    x: 0.6, y: 3.1, w: 8.5, h: 0.35,
    fontSize: 16, fontFace: "Arial", color: MUTED, margin: 0,
  });
  s.addText("Building on BNB Chain  ·  Smart Money Era", {
    x: 0.6, y: 4.5, w: 8.5, h: 0.3,
    fontSize: 12, fontFace: "Arial", color: MUTED, margin: 0,
  });
  footer(s, 1);
}

// 2 — Problem
{
  const s = pres.addSlide();
  bg(s);
  accentBar(s);
  s.addText("Agents exist. Conversion doesn’t.", {
    x: 0.6, y: 0.4, w: 8.8, h: 0.55,
    fontSize: 28, fontFace: "Arial", bold: true, color: PAPER, margin: 0,
  });
  s.addText("Registries show identity. A marketplace must help you choose and activate.", {
    x: 0.6, y: 1.05, w: 8.8, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: MUTED, margin: 0,
  });

  const left = [
    { t: "ERC-8004 registries", d: "Owner, metadata, endpoints, capability claims" },
    { t: "What they don’t do", d: "Compare jobs, show live signals, or fund work" },
  ];
  const right = [
    { t: "pulse", d: "Find by DeFi job → compare numbers → hire on-chain" },
    { t: "Not an explorer", d: "Featured agents carry the demo; no 200k-agent dump" },
  ];
  left.forEach((item, i) => {
    const y = 1.7 + i * 1.35;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y, w: 4.2, h: 1.15,
      fill: { color: INK2 }, line: { color: LINE }, rectRadius: 0.08,
    });
    s.addText(item.t, { x: 0.8, y: y + 0.2, w: 3.8, h: 0.35, fontSize: 16, bold: true, color: ACCENT, margin: 0 });
    s.addText(item.d, { x: 0.8, y: y + 0.55, w: 3.8, h: 0.4, fontSize: 13, color: PAPER, margin: 0 });
  });
  right.forEach((item, i) => {
    const y = 1.7 + i * 1.35;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.1, y, w: 4.3, h: 1.15,
      fill: { color: INK2 }, line: { color: LINE }, rectRadius: 0.08,
    });
    s.addText(item.t, { x: 5.3, y: y + 0.2, w: 3.9, h: 0.35, fontSize: 16, bold: true, color: ACCENT, margin: 0 });
    s.addText(item.d, { x: 5.3, y: y + 0.55, w: 3.9, h: 0.4, fontSize: 13, color: PAPER, margin: 0 });
  });
  footer(s, 2);
}

// 3 — What ships on main
{
  const s = pres.addSlide();
  bg(s);
  accentBar(s);
  s.addText("What is live on main today", {
    x: 0.6, y: 0.4, w: 8.8, h: 0.5,
    fontSize: 28, fontFace: "Arial", bold: true, color: PAPER, margin: 0,
  });
  s.addText("Public demo of the conversion loop — no invented TVL, no fake hire receipts.", {
    x: 0.6, y: 0.95, w: 8.8, h: 0.35,
    fontSize: 13, fontFace: "Arial", color: MUTED, margin: 0,
  });

  const items = [
    ["Web", "Vite + React marketplace at pulse-94i.pages.dev"],
    ["Catalog", "Four categories × two featured agents; seed agents use real ERC-8004 ids"],
    ["Signals", "Health-factor reader on Venus BSC testnet (fixture fallback if RPC fails)"],
    ["Hire UI", "RainbowKit + ERC-8183 path on BSC testnet (chain 97), budget capped at 0.001 $U"],
    ["Agents", "hfwatch / rangekeeper / yieldrouter / gridrunner on Workers + registered on chain 97"],
    ["API", "Hono catalog Worker: pulse-api…workers.dev"],
  ];
  items.forEach((row, i) => {
    const y = 1.45 + i * 0.52;
    s.addText(row[0], { x: 0.6, y, w: 1.5, h: 0.4, fontSize: 13, bold: true, color: ACCENT, margin: 0 });
    s.addText(row[1], { x: 2.2, y, w: 7.2, h: 0.4, fontSize: 13, color: PAPER, margin: 0 });
  });
  footer(s, 3);
}

// 4 — Four categories
{
  const s = pres.addSlide();
  bg(s);
  accentBar(s);
  s.addText("Four categories. Equal depth.", {
    x: 0.6, y: 0.35, w: 8.8, h: 0.45,
    fontSize: 26, fontFace: "Arial", bold: true, color: PAPER, margin: 0,
  });
  const cats = [
    { n: "01", t: "Health factor", a: "HF Watch", m: "Health factor · Liq. price · Venus" },
    { n: "02", t: "Rebalancing", a: "Range Keeper", m: "In-range % · Fees · IL" },
    { n: "03", t: "Yield", a: "Yield Router", m: "Net APR · Venue · Allocation" },
    { n: "04", t: "Grid trading", a: "Grid Runner", m: "Fill rate · Realized PnL · Window" },
  ];
  cats.forEach((c, i) => {
    const x = 0.5 + (i % 2) * 4.7;
    const y = 1.05 + Math.floor(i / 2) * 1.9;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.4, h: 1.7,
      fill: { color: INK2 }, line: { color: LINE }, rectRadius: 0.08,
    });
    s.addText(c.n, { x: x + 0.25, y: y + 0.2, w: 1, h: 0.3, fontSize: 12, color: ACCENT, margin: 0 });
    s.addText(c.t, { x: x + 0.25, y: y + 0.5, w: 3.9, h: 0.35, fontSize: 18, bold: true, color: PAPER, margin: 0 });
    s.addText(c.a, { x: x + 0.25, y: y + 0.9, w: 3.9, h: 0.28, fontSize: 13, color: ACCENT, margin: 0 });
    s.addText(c.m, { x: x + 0.25, y: y + 1.2, w: 3.9, h: 0.28, fontSize: 12, color: MUTED, margin: 0 });
  });
  footer(s, 4);
}

// 5 — Signals honesty
{
  const s = pres.addSlide();
  bg(s);
  accentBar(s);
  s.addText("Compare on signals — with provenance.", {
    x: 0.6, y: 0.4, w: 8.8, h: 0.5,
    fontSize: 26, fontFace: "Arial", bold: true, color: PAPER, margin: 0,
  });
  s.addText("Cards and detail pages render category metrics. Labels stay honest.", {
    x: 0.6, y: 0.95, w: 8.8, h: 0.35,
    fontSize: 13, fontFace: "Arial", color: MUTED, margin: 0,
  });

  const tags = [
    { k: "LIVE", d: "On-chain read (Venus HF for hf-watch when RPC succeeds)" },
    { k: "FIXTURE", d: "Catalog numbers for non-HF metrics / fallback path" },
    { k: "TESTNET", d: "BSC testnet (chain 97) for agents, hire UI, and demo position" },
  ];
  tags.forEach((tag, i) => {
    const y = 1.5 + i * 0.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y, w: 8.8, h: 0.8,
      fill: { color: INK2 }, line: { color: LINE }, rectRadius: 0.08,
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.85, y: y + 0.2, w: 1.5, h: 0.4,
      fill: { color: ACCENT }, line: { color: ACCENT }, rectRadius: 0.06,
    });
    s.addText(tag.k, {
      x: 0.85, y: y + 0.2, w: 1.5, h: 0.4,
      fontSize: 12, bold: true, color: INK, align: "center", valign: "middle", margin: 0,
    });
    s.addText(tag.d, {
      x: 2.6, y: y + 0.22, w: 6.5, h: 0.4,
      fontSize: 14, color: PAPER, valign: "middle", margin: 0,
    });
  });
  footer(s, 5);
}

// 6 — Hire path (honest)
{
  const s = pres.addSlide();
  bg(s);
  accentBar(s);
  s.addText("Hire through ERC-8183", {
    x: 0.6, y: 0.35, w: 8.8, h: 0.45,
    fontSize: 26, fontFace: "Arial", bold: true, color: PAPER, margin: 0,
  });
  s.addText("Buyer wallet funds escrow in $U. Marketplace never takes custody.", {
    x: 0.6, y: 0.85, w: 8.8, h: 0.3,
    fontSize: 13, fontFace: "Arial", color: MUTED, margin: 0,
  });

  const steps = ["Connect", "Create job", "Budget", "Approve $U", "Fund", "Funded"];
  steps.forEach((step, i) => {
    const x = 0.5 + i * 1.55;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.4, w: 1.4, h: 0.7,
      fill: { color: INK2 }, line: { color: i === 0 || i === 1 ? ACCENT : LINE }, rectRadius: 0.06,
    });
    s.addText(step, {
      x, y: 1.4, w: 1.4, h: 0.7,
      fontSize: 11, bold: true, color: PAPER, align: "center", valign: "middle", margin: 0,
    });
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 2.4, w: 8.8, h: 2.3,
    fill: { color: INK2 }, line: { color: LINE }, rectRadius: 0.08,
  });
  s.addText("Shipped on main", {
    x: 0.85, y: 2.6, w: 8.3, h: 0.3,
    fontSize: 14, bold: true, color: ACCENT, margin: 0,
  });
  s.addText([
    { text: "Hire panel on BSC Testnet (chain 97) against canonical AgenticCommerce", options: { bullet: true, breakLine: true } },
    { text: "Real provider wallets for seed agents (e.g. HF Watch 0x6d07…fCad)", options: { bullet: true, breakLine: true } },
    { text: "Local mock hire still available when VITE_CHAIN=local", options: { bullet: true, breakLine: true } },
    { text: "Public Funded receipt: pending $U faucet / teammate transfer (not claimed as done)", options: { bullet: true } },
  ], {
    x: 0.85, y: 3.0, w: 8.3, h: 1.5,
    fontSize: 13, fontFace: "Arial", color: PAPER, margin: 0,
  });
  footer(s, 6);
}

// 7 — Stack
{
  const s = pres.addSlide();
  bg(s);
  accentBar(s);
  s.addText("Built for real execution", {
    x: 0.6, y: 0.4, w: 8.8, h: 0.45,
    fontSize: 26, fontFace: "Arial", bold: true, color: PAPER, margin: 0,
  });
  const cols = [
    { t: "Web", d: "Vite · React · TanStack Router · wagmi / RainbowKit" },
    { t: "API", d: "Hono on Cloudflare Workers · fixture catalog" },
    { t: "Commerce", d: "ERC-8183 · $U · create → fund path" },
    { t: "Agents", d: "BNB Agent Studio · ERC-8004 · A2A / MCP Workers" },
    { t: "Signals", d: "Venus testnet HF reader · provenance labels" },
    { t: "Evidence", d: "Submission package · TermiX outline (task 1 DIY)" },
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + (i % 3) * 3.1;
    const y = 1.15 + Math.floor(i / 3) * 1.7;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 2.95, h: 1.45,
      fill: { color: INK2 }, line: { color: LINE }, rectRadius: 0.08,
    });
    s.addText(c.t, { x: x + 0.2, y: y + 0.25, w: 2.55, h: 0.35, fontSize: 16, bold: true, color: ACCENT, margin: 0 });
    s.addText(c.d, { x: x + 0.2, y: y + 0.7, w: 2.55, h: 0.55, fontSize: 12, color: PAPER, margin: 0 });
  });
  footer(s, 7);
}

// 8 — Close
{
  const s = pres.addSlide();
  bg(s);
  accentBar(s);
  s.addText("pulse", {
    x: 0.6, y: 1.2, w: 8.8, h: 0.7,
    fontSize: 42, fontFace: "Arial", bold: true, color: ACCENT, margin: 0,
  });
  s.addText("Agents already exist.\nNow they have somewhere to get hired.", {
    x: 0.6, y: 2.0, w: 8.8, h: 0.9,
    fontSize: 22, fontFace: "Arial", color: PAPER, margin: 0,
  });
  s.addText([
    { text: "Demo  ", options: { bold: true, color: ACCENT } },
    { text: "https://pulse-94i.pages.dev/", options: { breakLine: true, color: PAPER } },
    { text: "API  ", options: { bold: true, color: ACCENT } },
    { text: "https://pulse-api.juliocesarsevericheorellana.workers.dev/", options: { breakLine: true, color: PAPER } },
    { text: "Repo  ", options: { bold: true, color: ACCENT } },
    { text: "https://github.com/Zer0-Knowledge-Hack/pulse", options: { color: PAPER } },
  ], {
    x: 0.6, y: 3.2, w: 8.8, h: 1.3,
    fontSize: 13, fontFace: "Arial", margin: 0,
  });
  footer(s, 8);
}

mkdirSync(__dirname, { recursive: true });
await pres.writeFile({ fileName: outFile });
console.log(`Wrote ${outFile}`);
