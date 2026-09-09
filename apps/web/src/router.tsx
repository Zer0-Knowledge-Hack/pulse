import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { RouteErrorState, RouteNotFoundState } from "@/components/ui";
import { AppShell } from "@/routes/__root";
import { HomePage } from "@/routes/index";
import { BrowsePage } from "@/routes/browse/$category";
import { AgentDetailPage } from "@/routes/agents/$agentId";
import { LockupsPage } from "@/routes/lockups";
import { ProfilePage } from "@/routes/profile";

export type CatalogSearch = {
  q?: string;
};

export type ProfileSearch = {
  tab?: string;
};

function catalogSearch(search: Record<string, unknown>): CatalogSearch {
  return {
    q: typeof search.q === "string" && search.q.length > 0 ? search.q : undefined,
  };
}

function profileSearch(search: Record<string, unknown>): ProfileSearch {
  return {
    tab: typeof search.tab === "string" ? search.tab : undefined,
  };
}

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: catalogSearch,
  component: HomePage,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/browse/$category",
  validateSearch: catalogSearch,
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

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  validateSearch: profileSearch,
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  agentRoute,
  lockupsRoute,
  profileRoute,
]);

export const router = createRouter({
  routeTree,
  defaultErrorComponent: RouteErrorState,
  defaultNotFoundComponent: RouteNotFoundState,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
