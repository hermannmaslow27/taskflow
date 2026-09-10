import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const rawConnectionString = process.env.DATABASE_URL;
const connectionString = rawConnectionString
  ? rawConnectionString
      .replace("&channel_binding=require", "")
      .replace("?channel_binding=require", "")
  : undefined;

let dbInstance: ReturnType<typeof drizzle<typeof schema>>;

if (connectionString) {
  // If running in local or edge environment with Neon
  const pool = new Pool({ connectionString });
  dbInstance = drizzle(pool, { schema });
} else {
  // Graceful fallback for local development before database is provisioned
  // or during CI / static build
  const pool = new Pool({
    connectionString: "postgres://postgres:postgres@localhost:5432/taskflow",
  });
  dbInstance = drizzle(pool, { schema });
}

export const db = dbInstance;
export * from "./schema";
