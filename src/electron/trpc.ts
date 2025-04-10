import type { DB } from "@/db";
import {
  mediaTable,
  qrcodesTable,
  usersTable,
  type MediaSelect,
  type UserInsert,
  type UserSelect,
} from "@/db/schema";
import type { Context } from "@/electron/context";
import { STORAGE_DIR } from "@/electron/main";
import { WHATSAPP_CLIENT_EVENTS, type WhatsappClientEventReturn } from "@/electron/whatsapp-events";
import { initTRPC } from "@trpc/server";
import { format, startOfYesterday } from "date-fns";
import { eq, inArray } from "drizzle-orm";
import Logger from "electron-log";
import { on } from "events";
import { filesize } from "filesize";
import fs from "fs/promises";
import { extension } from "mime-types";
import path from "path";
import SuperJSON from "superjson";
import WAWebJS, { type Contact, type Message } from "whatsapp-web.js";
import z from "zod";

async function getAllUsersForChatAndCreateMissingOnes(
  messages: Array<Message & { mediaKey: string }>,
  db: DB
) {
  const allUsersWhatsappIds = messages.flatMap((message) => message.author!).filter(Boolean);
  const existingUsers = await db
    .select()
    .from(usersTable)
    .where(inArray(usersTable.userWhatsappId, allUsersWhatsappIds));

  const existingUserWhatsappIds = existingUsers.map((user) => user.userWhatsappId);
  const missingContactsPromises = await Promise.allSettled(
    messages
      .filter((message) => !!message.author && !existingUserWhatsappIds.includes(message.author))
      .map((message) => message.getContact())
  );

  const newContactsPromises = await Promise.allSettled(
    missingContactsPromises
      .filter(
        (promise): promise is PromiseFulfilledResult<Contact> => promise.status === "fulfilled"
      )
      .map(async ({ value: contact }): Promise<UserInsert> => {
        return {
          userWhatsappId: contact.id._serialized,
          displayName: contact.pushname,
          profilePicUrl: await contact.getProfilePicUrl(),
        };
      })
  );

  const newContacts = newContactsPromises
    .filter(
      (promise): promise is PromiseFulfilledResult<UserInsert> => promise.status === "fulfilled"
    )
    .map(({ value: contact }) => contact);

  await db.insert(usersTable).values(newContacts);
  const newAllUsers = await db
    .select()
    .from(usersTable)
    .where(inArray(usersTable.userWhatsappId, allUsersWhatsappIds));

  const usersByWhatsappId = Object.values(newAllUsers).reduce(
    (acc, user) => {
      acc[user.userWhatsappId] = user;
      return acc;
    },
    {} as { [userWhatsappId: string]: UserSelect }
  );

  return usersByWhatsappId;
}

async function getMedia({
  message,
  contact,
  idx,
  db,
}: {
  message: Message;
  contact: UserSelect;
  idx: number;
  db: DB;
}): Promise<MediaSelect | null> {
  if (!message.mediaKey) {
    Logger.error(
      "[getMedia]: mediaKey not available, why is this function called?",
      message.id._serialized
    );
    return null;
  }
  const [mediaFile] = await db
    .select()
    .from(mediaTable)
    .where(eq(mediaTable.mediaKey, message.mediaKey))
    .limit(1);

  if (mediaFile) {
    return mediaFile;
  }

  const media = await message.downloadMedia();
  const ext = extension(media.mimetype);
  if (!ext) {
    Logger.error("[getMedia]: File without extension:", media.filename || "file_unnamed");
    return null;
  }

  const timestamp = message.timestamp * 1000;
  const contactName = contact.displayName.replaceAll(" ", "_");
  const time = format(timestamp, "HH_mm");
  const filename = `${contactName}_${time}_${idx}.${ext}`;
  const size = media.filesize ? filesize(media.filesize) : "";
  const dirPath = path.join(STORAGE_DIR, "files", format(timestamp, "dd.MM.yyyy"));
  const filepath = path.join(dirPath, filename);

  try {
    // if file exists then just ignore
    await fs.access(filepath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
    const base64String = media.data.replace(/^data:.*;base64,/, "");
    const buffer = Buffer.from(base64String, "base64");
    await fs.writeFile(filepath, buffer);
  }

  const [newFile] = await db
    .insert(mediaTable)
    .values({
      ext,
      filename,
      filepath,
      filesize: size,
      timestamp,
      userId: contact.id,
      mediaKey: message.mediaKey,
    })
    .returning();

  if (!newFile) {
    Logger.error("[getMedia]: No file after creation?");
    return null;
  }

  return newFile;
}

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

  getChats: t.procedure.query(async ({ ctx: { whatsappClient } }) => {
    const chats = await whatsappClient.getChats();
    const chatsWithProfilePic = await Promise.allSettled(
      chats.map(async (chat) => {
        try {
          const contact = await chat.getContact();
          const profilePicUrl = await contact.getProfilePicUrl();
          return { ...chat, profilePicUrl };
        } catch (_error) {
          return { ...chat, profilePicUrl: undefined };
        }
      })
    );

    const resolvedChats = chatsWithProfilePic
      .map((chat) => chat.status === "fulfilled" && chat.value)
      .filter(Boolean);

    return resolvedChats as Array<(typeof chats)[number] & { profilePicUrl: string | undefined }>;
  }),

  getChatById: t.procedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx: { whatsappClient, db }, input }) => {
      const chat = await whatsappClient.getChatById(input.chatId);
      await chat.syncHistory();
      const messages = await chat.fetchMessages({ limit: 100 });
      const todaysMediaMessages = messages
        // .filter((message) => message.timestamp >= startOfToday().valueOf() / 1000)
        .filter((message) => message.timestamp >= startOfYesterday().valueOf() / 1000)
        .filter(
          (message): message is Message & { mediaKey: string } =>
            message.hasMedia && !!message.mediaKey
        );

      const contacts = await getAllUsersForChatAndCreateMissingOnes(todaysMediaMessages, db);
      const timegroups = {} as {
        [time: string]: {
          [userId: string]: { info: UserSelect; media: Array<MediaSelect | null> };
        };
      };

      for (const message of todaysMediaMessages) {
        const author = message.author!;
        const contact = contacts[author]!;
        const time = format(message.timestamp * 1000, "HH:mm");
        const mediaIdx = timegroups[time]?.[author]?.media.length ?? 1;
        const file = await getMedia({ message, contact, idx: mediaIdx, db });

        if (!timegroups[time]) {
          timegroups[time] = {};
        }

        if (!timegroups[time][author]) {
          timegroups[time][author] = { info: contact, media: [] };
        }

        timegroups[time][author].media.push(file);
      }

      return { chat, timegroups };
    }),
});

export type AppRouter = typeof router;

export const trpcCreateCaller = t.createCallerFactory(router);
