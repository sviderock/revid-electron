import "dotenv/config";
import { defineConfig } from "drizzle-kit";

console.log(process.env.DB_FILE_NAME!, __dirname);
export default defineConfig({
  out: "./src/db",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  strict: true,
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
