import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Get it from console.neon.tech");
}

export const sql = neon(process.env.DATABASE_URL);
