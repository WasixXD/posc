import { Handlers } from "$fresh/server.ts";
import { query } from "../../../db/client.ts";

async function getTagId(tag: string, deck_id: string): Promise<number> {
  const rows = await query("SELECT * FROM tag WHERE name = $1", [tag]);

  if (rows.rowCount <= 0) {
    const result = await query(
      "INSERT INTO tag (deck_id, name) VALUES ($1, $2) RETURNING tag_id",
      [deck_id, tag],
    );

    const { tag_id } = result.rows[0];
    return tag_id;
  }

  const { tag_id } = rows.rows[0];

  return tag_id;
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
    const filePath = `static/uploads/${file.name}`;
    const actualPath = `/uploads/${file.name}`;
    await Deno.mkdir("static/uploads/", { recursive: true });

    const tag_id = await getTagId(tag, deck_id);

    const bytes = new Uint8Array(await file.arrayBuffer());
    await Deno.writeFile(filePath, bytes);

    await query(
      "INSERT INTO question(deck_id, tag_id, question, correct) VALUES ($1, $2, $3, $4)",
      [deck_id, String(tag_id), actualPath, correct],
    );

    query(
      `UPDATE deck SET total_questions = (SELECT COUNT(*) FROM question WHERE deck_id = ${deck_id}) WHERE deck_id = ${deck_id};`,
    );

    return new Response(null);
  },
};
