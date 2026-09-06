import { createApp, type ApiEnv } from "./app";

const app = createApp();

export default {
  fetch(request: Request, env: ApiEnv): Promise<Response> | Response {
    return app.fetch(request, env);
  },
};
