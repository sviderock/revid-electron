import { ThemeProvider } from "@/components/theme-provider";
import type { AppRouter } from "@/electron/trpc";
import { trpc } from "@/router";
import { type QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useSubscription, type TRPCOptionsProxy } from "@trpc/tanstack-react-query";

export const Route = createRootRouteWithContext<{
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return <div className="w-full h-full flex-col justify-center items-center">Not Found</div>;
  },
});

function RootComponent() {
  const router = useRouter();

  console.log(1);
  const { data } = useSubscription(
    trpc.whatsappEvents.subscriptionOptions(void 0, {
      onError: console.log,
      onStarted: console.log,
      onConnectionStateChange: console.log,
      onData: (data) => {
        console.log(data);
        if (data.type === "qr") {
          const [code] = data.data;
          router.navigate({ to: "/login", search: { code } });
        }
      },
    })
  );
  console.log(2);
  console.log(data);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  );
}
