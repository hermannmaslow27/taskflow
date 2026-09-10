import { defineConfig } from "drizzle-kit";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    try {
      process.loadEnvFile(".env");
    } catch {}
  }
}

const rawUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/taskflow";
const url = rawUrl
  .replace("&channel_binding=require", "")
  .replace("?channel_binding=require", "");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
  strict: true,
  verbose: true,
});
