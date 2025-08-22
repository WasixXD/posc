import { Handlers } from "$fresh/server.ts";
import { query } from "../../../db/client.ts";

export interface Deck {
  deck_id: number;
  name: string;
  total_questions: number;
  correctness_percent: number;
}

export async function get_all_decks(): Promise<Deck[]> {
  const rows = await query("SELECT * FROM deck ORDER BY deck_id");
  return rows.rows;
}

export const handler: Handlers = {
  async GET(_req, _ctx) {
    const rows = await get_all_decks();

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "contenty-type": "application/json" },
    });
  },
};
