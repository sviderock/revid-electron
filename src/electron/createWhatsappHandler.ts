import type { Context } from "@/electron/context";
import { trpcCreateCaller } from "@/electron/trpc";

export default function createWhatsappHandler(ctx: Context) {
  const trpcCaller = trpcCreateCaller(ctx);

  ctx.whatsappClient.on("qr", async (code) => {
    await trpcCaller.updateQRCode(code);
  });

  ctx.whatsappClient.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("auth_failure", msg);
  });

  ctx.whatsappClient.on("disconnected", (reason) => {
    console.log("disconnected", reason);
  });

  ctx.whatsappClient.on("ready", async () => {
    await trpcCaller.clearQRCodes();
  });

  ctx.whatsappClient.on("message", async (message) => {
    console.log("message", message);
  });
}
