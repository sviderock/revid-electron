import { qrcodesTable } from "@/db/schema";
import type { Context } from "@/electron/trpc/context";
import {
  WHATSAPP_CLIENT_EVENTS,
  type WhatsappClientEventReturn,
} from "@/electron/trpc/whatsapp-events";
import { initTRPC } from "@trpc/server";
import { eq } from "drizzle-orm";
import { on } from "events";
import SuperJSON from "superjson";
import WAWebJS from "whatsapp-web.js";
import z from "zod";

async function* processPromises<D, T extends Promise<D>>(promises: T[]) {
  // Create a map to store pending promises
  const pending = new Map(
    promises.map((promise, index) => [index, promise.then((result) => ({ result, index }))])
  );

  while (pending.size > 0) {
    const { result, index } = await Promise.race(pending.values());
    pending.delete(index);
    yield result;
  }
}

const t = initTRPC.context<Context>().create({
  isServer: true,
  transformer: SuperJSON,
});

export const router = t.router({
  whatsappEvents: t.procedure.subscription(async function* ({ ctx: { whatsappClient }, signal }) {
    const mergedAsyncIterator = async function* () {
      const iterators = WHATSAPP_CLIENT_EVENTS.map((type) => {
        return on(whatsappClient, type, { signal })[Symbol.asyncIterator]();
      });

      while (!signal?.aborted) {
        const nextPromises = iterators.map((iterator, idx) => {
          const activeIteratorType = WHATSAPP_CLIENT_EVENTS[idx]!;
          return iterator.next().then((result) => ({ result, idx, type: activeIteratorType }));
        });

        for await (const response of processPromises(nextPromises)) {
          const { result, idx } = response as Awaited<(typeof nextPromises)[number]>;
          yield {
            type: WHATSAPP_CLIENT_EVENTS[idx]!,
            data: result.value,
          } as WhatsappClientEventReturn;
        }
      }
    };

    yield* mergedAsyncIterator();
  }),

  updateQRCode: t.procedure.input(z.string().min(1)).mutation(async ({ ctx: { db }, input }) => {
    const [existingCode] = await db.select().from(qrcodesTable).limit(1);

    if (existingCode) {
      await db
        .update(qrcodesTable)
        .set({ code: input })
        .where(eq(qrcodesTable.id, existingCode!.id));
    } else {
      await db.insert(qrcodesTable).values({ code: input });
    }
  }),

  clearQRCodes: t.procedure.mutation(async ({ ctx: { db } }) => {
    await db.delete(qrcodesTable);
  }),

  userState: t.procedure.query(async ({ ctx }) => {
    const connectionState = await ctx.whatsappClient.getState();
    if (connectionState === WAWebJS.WAState.CONNECTED) {
      return { connected: true };
    }

    const [qrcode] = await ctx.db.select().from(qrcodesTable).limit(1);
    return { connected: false, qrcode: qrcode?.code || "" };
  }),

  getChats: t.procedure.query(async ({ ctx }) => {
    const chats = await ctx.whatsappClient.getChats();
    return chats;
  }),
});

export const trpcCreateCaller = t.createCallerFactory(router);

export type AppRouter = typeof router;
