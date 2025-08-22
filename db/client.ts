import { Pool, type QueryResult } from "pg";

const pool: Pool = new Pool({
  host: Deno.env.get("POSTGRES_HOST"),
  user: Deno.env.get("POSTGRES_USER"),
  password: Deno.env.get("POSTGRES_PASSWORD"),
  database: Deno.env.get("POSTGRES_DB"),
});

export async function query(
  text: string,
  params: string[] = [],
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
