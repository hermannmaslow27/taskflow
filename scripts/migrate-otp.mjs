import { Pool } from "@neondatabase/serverless";
import fs from "fs";

// Load .env.local
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  const match = content.match(/DATABASE_URL="?([^"\r\n]+)"?/);
  if (match) dbUrl = match[1];
}

if (!dbUrl) {
  console.log("No DATABASE_URL found, skipping DB migration.");
  process.exit(0);
}

const cleanedUrl = dbUrl
  .replace("&channel_binding=require", "")
  .replace("?channel_binding=require", "");

const pool = new Pool({ connectionString: cleanedUrl });

async function migrate() {
  console.log("Running password_reset_tokens migration...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
      "id" text PRIMARY KEY NOT NULL,
      "email" text NOT NULL,
      "otp" text NOT NULL,
      "expires_at" timestamp with time zone NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_email" ON "password_reset_tokens" ("email");
    CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_otp" ON "password_reset_tokens" ("otp");
  `);
  console.log("✓ Migration password_reset_tokens completed successfully!");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
