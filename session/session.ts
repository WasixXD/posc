import { query } from "../db/client.ts";
import { Tag } from "../routes/api/list/tag.ts";

interface Question {
  q_id: number;
  deck_id: number;
  tag_id: number;

  question: string;
  correct: string;
}

interface Performance {
  tag_id: number;
  errors: number;
  corrects: number;
}

export class Session {
  session_id: string = "";
  cursor: number = 0;
  questions: Question[] = [];
  deck_id: string = "";

  constructor(deck_id: string) {
    this.session_id = crypto.randomUUID();
    this.deck_id = deck_id;
  }
  current(): Question {
    return this.questions[this.cursor];
  }

  getNext(): Question {
    this.cursor++;
    return this.current();
  }

  // Weighted Random Selection
  private WRS(maxQuestions: number, performances: Performance[]): number[] {
    const result: number[] = [];

    const weightedList = [];
    let weightedSum = 0;
    for (const performance of performances) {
      // assign a weight to each tag, based on the formula (errors / (correct + errors))
      const weight = performance.errors /
        (performance.corrects + performance.errors);
      weightedList.push({ tagId: performance.tag_id, weight });
      // sum the weight
      weightedSum += weight;
    }

    for (let i = 0; i < maxQuestions; i++) {
      // generate a chance from 0 to weightedSum
      const chance = Math.random() * weightedSum;
      let acc = 0;

      for (const { tagId, weight } of weightedList) {
        acc += weight;
        // chance = 0.36
        // weightedList = [0.1, 0.5, 0.7]
        // 1. acc = 0.1
        // 2. acc = (0.1 + 0.5) 0.6 => chance < acc
        if (chance <= acc) {
          result.push(tagId);
          break;
        }
      }
    }

    // return an array indicating the tagId on each question
    return result;
  }

  async generateQuestions(maxQuestions: number) {
    const result = await query("SELECT * FROM tag WHERE deck_id = $1", [
      this.deck_id,
    ]);
    const tags: Tag[] = result.rows;

    const tagsId = tags.map((tag) => tag.tag_id);
    const performancesRows = await query(
      "SELECT * FROM performance where tag_id = ANY($1::int[])",
      [tagsId],
    );

    const performances: Performance[] = performancesRows.rows;
    const questionsDistribuition = this.WRS(maxQuestions, performances);

    for (const tagId of questionsDistribuition) {
      const q = await query(
        "SELECT * FROM question WHERE tag_id = $1 ORDER BY RANDOM() LIMIT 1",
        [tagId],
      );

      const question: Question = q.rows[0];
      this.questions.push(question);
    }
  }
}
