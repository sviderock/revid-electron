import { trpcCreateCaller } from "@/electron/trpc";
import type { Context } from "@/electron/trpc/context";

export default function createWhatsappHandler(ctx: Context) {
  const trpcCaller = trpcCreateCaller(ctx);

  ctx.whatsappClient.on("qr", async (code) => {
    await trpcCaller.updateQRCode(code);
  });

  ctx.whatsappClient.on("loading_screen", (percent, message) => {
    console.log("loading_screen", percent, message);
  });

  ctx.whatsappClient.on("authenticated", () => {
    console.log("authenticated");
  });

  ctx.whatsappClient.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("auth_failure", msg);
  });

  ctx.whatsappClient.on("disconnected", (reason) => {
    console.log("disconnected", reason);
  });

  ctx.whatsappClient.on("ready", async () => {
    console.log("readY");
  });

  ctx.whatsappClient.on("message", async (message) => {
    console.log("message", message);
  });
}
