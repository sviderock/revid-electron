import { qrcodesTable } from "@/db/schema";
import type { Context } from "@/electron/trpc/context";
import {
  WHATSAPP_CLIENT_EVENTS,
  type WhatsappClientEvent,
  type WhatsappClientEventReturn,
} from "@/electron/trpc/whatsapp-events";
import { initTRPC } from "@trpc/server";
import { eq } from "drizzle-orm";
import { on } from "events";
import SuperJSON from "superjson";
import z from "zod";

const t = initTRPC.context<Context>().create({
  isServer: true,
  transformer: SuperJSON,
});

export const router = t.router({
  whatsappEvents: t.procedure.subscription(async function* ({ ctx: { whatsappClient }, signal }) {
    whatsappClient;
    // Create merged async iterator
    const mergedAsyncIterator = async function* () {
      // Array to hold our event iterators
      const iterators = WHATSAPP_CLIENT_EVENTS.map((type) => {
        return on(whatsappClient, type, { signal })[Symbol.asyncIterator]();
      });

      // Array to track which iterators are still active
      const activeIterators = WHATSAPP_CLIENT_EVENTS.reduce(
        (acc, type, idx) => acc.set(idx, type),
        new Map<number, keyof WhatsappClientEvent>()
      );

      while (activeIterators.size && !signal?.aborted) {
        // Create promises only for active iterators
        const nextPromises = iterators
          .map((iterator, idx) => {
            const activeIteratorType = activeIterators.get(idx);
            if (!activeIteratorType) return null;
            return iterator.next().then((result) => ({ result, idx, type: activeIteratorType }));
          })
          .filter(Boolean);

        if (nextPromises.length === 0) break;

        // Wait for the first iterator to yield a value
        const response = await Promise.race(nextPromises);
        if (!response) {
          break;
        }

        const { result, idx } = response;
        const type = activeIterators.get(idx);

        // If this iterator is done, mark it as inactive
        if (result.done) {
          activeIterators.delete(idx);
          continue;
        }

        if (!type) {
          console.log("what? how?");
          continue;
        }

        // Extract the event data
        const data = result.value;

        // Yield the event with its type
        yield { type, data } as WhatsappClientEventReturn;
      }
    };

    // Yield all events from our merged iterator
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

  getUserState: t.procedure.query(async ({ ctx }) => {
    const connectionState = await ctx.whatsappClient.getState();
    const [qrcode] = await ctx.db.select().from(qrcodesTable).limit(1);
    return { connectionState, qrcode: qrcode?.code || "" };
  }),
});

export const trpcCreateCaller = t.createCallerFactory(router);

export type AppRouter = typeof router;
