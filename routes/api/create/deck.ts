import { type Handlers } from "$fresh/server.ts";
import * as db from "../../../db/client.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const formData = await req.formData();

    const deck_name = formData.get("deck_name");
    if (!deck_name || deck_name === "") {
      return new Response(
        JSON.stringify({ msg: "Please provide a deck name" }),
        { status: 403 },
      );
    }

    const result = await db.query(
      "INSERT INTO deck(name) VALUES ($1) RETURNING name",
      [
        deck_name.toString(),
      ],
    );

    const row = result.rows[0];

    // @ts-ignore: it does exist
    const name = row.name;

    const headers = new Headers();

    headers.set("location", `/?deckname=${name}`);

    return new Response(null, {
      status: 303,
      headers,
    });
  },
};
