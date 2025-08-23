import { Handlers } from "$fresh/server.ts";
import { query } from "../../../db/client.ts";

export interface Tag {
  tag_id: number;
  name: string;
}

export async function get_all_tags() {
  const rows = await query("SELECT * FROM tag");
  return rows.rows;
}

export const handler: Handlers = {
  async GET(_req, _ctx) {
    const rows = await get_all_tags();

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "contenty-type": "application/json" },
    });
  },
};
