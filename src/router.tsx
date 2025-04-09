import type { AppRouter } from "@/electron/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter as createTanStackRouter } from "@tanstack/react-router";
import { createTRPCClient } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import SuperJSON from "superjson";
import { ipcLink } from "trpc-electron/renderer";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

const memoryHistory = createMemoryHistory({
  initialEntries: ["/"],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  queryClient,
  client: createTRPCClient({
    links: [ipcLink({ transformer: SuperJSON })],
  }),
});

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    history: memoryHistory,
    context: {
      trpc,
      queryClient,
    },
    defaultPreload: "intent",
    // Since we're using React Query, we don't want loader calls to ever be stale
    // This will ensure that the loader is always called when the route is preloaded or visited
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    Wrap: function WrapComponent({ children }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
