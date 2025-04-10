import "dotenv/config";
import { drizzle } from "drizzle-orm/better-sqlite3";

export type DB = typeof db;
export const db = drizzle(process.env.DB_FILE_NAME!);
