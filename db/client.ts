import { Pool, type QueryResult } from "pg";

export const pool: Pool = new Pool({
  host: Deno.env.get("POSTGRES_HOST") || "localhost",
  user: Deno.env.get("POSTGRES_USER") || "postgres",
  password: Deno.env.get("POSTGRES_PASSWORD") || "postgres",
  database: Deno.env.get("POSTGRES_DB") || "posc",
});

export async function query(
  text: string,
  params: any[] = [],
): Promise<QueryResult> {
  const now = Date.now();
  const res = await pool.query(text, params);
  const end = Date.now() - now;

  console.log("[LOG] query executed", {
    text,
    duration: end,
    rows: res.rowCount,
  });
  return res;
}
