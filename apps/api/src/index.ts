import { serve } from "@hono/node-server";
import { createApp } from "./app";

const app = createApp();
const port = Number(process.env.PORT ?? 3001);

serve(
  {
    fetch: (request) =>
      app.fetch(request, { WEB_ORIGIN: process.env.WEB_ORIGIN }),
    port,
  },
  () => {
    console.log(`api listening on http://localhost:${port}`);
  },
);
