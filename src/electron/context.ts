import type { DB } from "@/db";
import type { Client } from "whatsapp-web.js";

export type Context = Awaited<ReturnType<typeof createContext>>;

export async function createContext(opts: { whatsappClient: Client; db: DB }) {
  return opts;
}
