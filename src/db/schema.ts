import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const qrcodesTable = sqliteTable("qrcodes", {
  id: int().primaryKey({ autoIncrement: true }),
  code: text().notNull(),
});

export const chatsTable = sqliteTable("chats", {
  id: int().primaryKey({ autoIncrement: true }),
});

export type UserSelect = typeof usersTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;
export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  userWhatsappId: text().unique().notNull(),
  displayName: text().notNull(),
  profilePicUrl: text().notNull().default(""),
});

export type MediaSelect = typeof mediaTable.$inferSelect;
export type MediaInsert = typeof mediaTable.$inferInsert;
export const mediaTable = sqliteTable("media", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().references(() => usersTable.id),
  mediaKey: text().unique().notNull(),
  filepath: text().unique().notNull(),
  filename: text().notNull(),
  filesize: text().notNull(),
  ext: text().notNull(),
  timestamp: int().notNull(),
});
