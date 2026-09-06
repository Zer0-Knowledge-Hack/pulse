import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { categorySchema, hireIntentSchema } from "@era/domain";
import {
  getFeaturedAgent,
  listFeaturedAgents,
  toListing as listingFromFeatured,
} from "@era/indexer";
import { createMockJob, getMockJob, revokeMockSession } from "@era/commerce";
import { getAgentSignal } from "@era/signals";

export type ApiEnv = {
  WEB_ORIGIN?: string;
};

const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

export function parseOrigins(raw?: string): string[] {
  const configured = raw
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured?.length ? configured : defaultOrigins;
}

export function createApp() {
  const app = new Hono<{ Bindings: ApiEnv }>();

  app.use("*", (c, next) =>
    cors({
      origin: parseOrigins(c.env?.WEB_ORIGIN),
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    })(c, next),
  );

  app.get("/health", (c) => c.json({ ok: true, mode: "fixtures" }));

  app.get("/agents", (c) => {
    const raw = c.req.query("category");
    const category = raw ? categorySchema.parse(raw) : undefined;
    const agents = listFeaturedAgents(category).map(listingFromFeatured);
    return c.json({ agents });
  });

  app.get("/agents/:id", (c) => {
    const agent = getFeaturedAgent(c.req.param("id"));
    if (!agent) {
      throw new HTTPException(404, { message: "Agent not found" });
    }
    return c.json({ agent: listingFromFeatured(agent) });
  });

  app.get("/agents/:id/signal", (c) => {
    const signal = getAgentSignal(c.req.param("id"));
    if (!signal) {
      throw new HTTPException(404, { message: "Signal not found" });
    }
    return c.json({ signal });
  });

  app.post("/jobs", async (c) => {
    const body = hireIntentSchema.parse(await c.req.json());
    if (!getFeaturedAgent(body.agentId)) {
      throw new HTTPException(404, { message: "Agent not found" });
    }
    const job = createMockJob(body);
    return c.json({ job }, 201);
  });

  app.get("/jobs/:jobId", (c) => {
    const job = getMockJob(c.req.param("jobId"));
    if (!job) {
      throw new HTTPException(404, { message: "Job not found" });
    }
    return c.json({ job });
  });

  app.post("/jobs/:jobId/revoke", (c) => {
    const job = revokeMockSession(c.req.param("jobId"));
    if (!job) {
      throw new HTTPException(404, { message: "Job not found" });
    }
    return c.json({ job });
  });

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status);
    }
    console.error(err);
    return c.json({ error: "Internal error" }, 500);
  });

  return app;
}
