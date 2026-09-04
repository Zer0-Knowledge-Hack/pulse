import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppShell } from "@/routes/__root";
import { HomePage } from "@/routes/index";
import { BrowsePage } from "@/routes/browse/$category";
import { AgentDetailPage } from "@/routes/agents/$agentId";
import { LockupsPage } from "@/routes/lockups";

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/browse/$category",
  component: BrowsePage,
});

const agentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/agents/$agentId",
  component: AgentDetailPage,
});

const lockupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lockups",
  component: LockupsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  agentRoute,
  lockupsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
