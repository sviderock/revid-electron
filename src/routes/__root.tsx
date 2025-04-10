import { ThemeProvider } from "@/components/theme-provider";
import type { AppRouter } from "@/electron/trpc";
import { trpc } from "@/router";
import { type QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useSubscription, type TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { LoaderPinwheel } from "lucide-react";

export const Route = createRootRouteWithContext<{
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  errorComponent: (error) => (
    <div className="size-full flex flex-col justify-center items-center gap-4 p-16">
      <span className="text-5xl">Error</span>

      <pre className="w-full h-60 overflow-auto text-sm">{JSON.stringify(error, null, 2)}</pre>
    </div>
  ),
  notFoundComponent: () => {
    return <div className="size-full flex flex-col justify-center items-center">Not Found</div>;
  },
});

function RootComponent() {
  const router = useRouter();

  useSubscription(
    trpc.whatsappEvents.subscriptionOptions(void 0, {
      onError: console.log,
      onStarted: console.log,
      onConnectionStateChange: console.log,
      onData: (data) => {
        console.log(data);
        if (data.type === "ready") {
          if (!router.matchRoute({ to: "/dashboard" })) {
            router.navigate({ to: "/dashboard" });
          }
          return;
        }

        if (data.type === "qr") {
          const [code] = data.data;
          return router.navigate({ to: "/login", search: { code } });
        }

        if (data.type === "loading_screen") {
          return;
        }
      },
    })
  );

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Outlet />
      <div className="size-full flex flex-col items-center justify-center gap-2">
        <LoaderPinwheel className="size-50 animate-spin text-primary" />
        <span className="text-xl">Connecting to Whatsapp Client...</span>
      </div>
    </ThemeProvider>
  );
}
