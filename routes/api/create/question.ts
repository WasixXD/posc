import { Handlers } from "$fresh/server.ts";
import { query } from "../../../db/client.ts";

async function getTagId(tag: string): Promise<number> {
  const rows = await query("SELECT * FROM tag WHERE name = $1", [tag]);

  if (rows.rowCount <= 0) {
    const result = await query(
      "INSERT INTO tag (name) VALUES ($1) RETURNING tag_id",
      [tag],
    );

    const { id } = result.rows[0];
    return id;
  }

  const { id } = rows.rows[0];

  return id;
}

export const handler: Handlers = {
  async POST(req, _ctx) {
    const formData = await req.formData();

    const [deck_id, file, correct, tag] = [
      formData.get("deck_id") as string,
      formData.get("file") as File,
      formData.get("correct") as string,
      formData.get("tag") as string,
    ];
    const filePath = `./uploads/${file.name}`;
    const tag_id = await getTagId(tag);

    const bytes = new Uint8Array(await file.arrayBuffer());
    await Deno.writeFile(filePath, bytes);

    await query(
      "INSERT INTO question(deck_id, tag_id, question, correct) VALUES ($1, $2, $3, $4)",
      [deck_id, String(tag_id), filePath, correct],
    );

    query(
      `UPDATE deck SET total_questions = (SELECT COUNT(*) FROM question WHERE deck_id = ${deck_id}) WHERE deck_id = ${deck_id};`,
    );

    return new Response(null);
  },
};
