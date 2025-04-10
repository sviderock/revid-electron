import { trpc } from "@/router";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoaderPinwheel } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async ({ context: { queryClient } }) => {
    const state = await queryClient.ensureQueryData(trpc.userState.queryOptions());
    console.log(state);
    if (state.connected) {
      throw redirect({ to: "/dashboard" });
    }

    if (state.qrcode) {
      throw redirect({ to: "/login", search: { code: state.qrcode } });
    }
  },
});

function Index() {
  return (
    <div className="size-full flex flex-col items-center justify-center gap-2">
      <LoaderPinwheel className="size-50 animate-spin text-primary" />
      <span className="text-xl">Connecting to Whatsapp Client...</span>
    </div>
  );
}
