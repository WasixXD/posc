import { assert } from "$std/assert/assert.ts";
import { pool, query } from "../db/client.ts";
import { Session } from "./session.ts";
import { afterAll, beforeAll, describe, it } from "jsr:@std/testing/bdd";

describe("Session", () => {
  let deck_id: string;
  beforeAll(async () => {
    const result = await query(
      "INSERT INTO deck(name) VALUES ('test') RETURNING deck_id",
    );

    deck_id = result.rows[0].deck_id;

    const tags = await query(
      "INSERT INTO tag(deck_id, name) VALUES ($1, 'calculus'), ($1, 'algebra'), ($1, 'matrices'), ($1, 'discrete math'), ($1, 'probability') RETURNING tag_id",
      [
        deck_id,
      ],
    );

    const [tag1, tag2, tag3, tag4, tag5] = [
      tags.rows[0].tag_id,
      tags.rows[1].tag_id,
      tags.rows[2].tag_id,
      tags.rows[3].tag_id,
      tags.rows[4].tag_id,
    ];

    await query(
      "INSERT INTO performance(tag_id, errors, corrects) VALUES ($1, 6, 4), ($2, 3, 7), ($3, 8, 2), ($4, 1, 9), ($5, 5, 5)",
      [
        tag1,
        tag2,
        tag3,
        tag4,
        tag5,
      ],
    );
  });

  it("generateQuestions()", async () => {
    const questionNumber = 10;
    const session = new Session(deck_id);
    await session.generateQuestions(questionNumber);

    assert(session.questions.length == questionNumber);
  });

  afterAll(async () => {
    await query("TRUNCATE TABLE deck CASCADE");

    await pool.end();
  });
});
