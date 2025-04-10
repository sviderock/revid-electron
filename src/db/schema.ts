import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const qrcodesTable = sqliteTable("qrcodes", {
  id: int().primaryKey({ autoIncrement: true }),
  code: text().notNull(),
});
