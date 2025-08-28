import { query } from "../db/client.ts";
import { Tag } from "../routes/api/list/tag.ts";

export interface Question {
  q_id: number;
  deck_id: number;
  tag_id: number;

  question: string;
  correct: string;
}

export interface Performance {
  tag_id: number;
  errors: number;
  corrects: number;
}

export interface UserResponse {
  value: string;
  tagId: number;
}

export class Session {
  session_id: string = "";
  cursor: number = 0;
  questions: Question[] = [];
  deck_id: string = "";
  userResponses: UserResponse[] = [];

  constructor(deck_id: string) {
    this.session_id = crypto.randomUUID();
    this.deck_id = deck_id;
  }

  async createPerformance(tag: number) {
    await query(
      "INSERT INTO performance(tag_id, corrects, errors) VALUES($1, 0, 0) ON CONFLICT DO NOTHING",
      [tag],
    );
  }

  async updatePerformance(responses: UserResponse[]) {
    this.userResponses = responses;
    for (let i = 0; i < responses.length; i++) {
      const correct = this.questions[i];
      const userQ = responses[i];
      const row = correct.correct === userQ.value ? "corrects" : "errors";

      await query(
        `UPDATE performance SET ${row} = ${row} + 1 WHERE tag_id = $1`,
        [correct.tag_id],
      );
    }
  }

  // Weighted Random Selection
  private WRS(maxQuestions: number, performances: Performance[]): number[] {
    const result: number[] = [];

    const weightedList = [];
    let weightedSum = 0;
    for (const performance of performances) {
      // assign a weight to each tag, based on the formula (errors / (correct + errors + length))
      const weight = (performance.errors + 1) /
        (performance.corrects + performance.errors + performances.length);
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

    // if doesnt exist a performance we random select a question and create the performance for that tag
    if (performancesRows.rowCount <= 0) {
      for (let i = 0; i < maxQuestions; i++) {
        const q = await query(
          "SELECT * FROM question WHERE q_id != ALL ($1::int[]) ORDER BY RANDOM() LIMIT 1",
          [this.questions.map((q) => q.q_id)],
        );

        const question: Question = q.rows[0];
        this.questions.push(question);

        await this.createPerformance(question.tag_id);
      }
      return;
    }

    const performances: Performance[] = performancesRows.rows;
    const questionsDistribuition = this.WRS(maxQuestions, performances);

    for (const tagId of questionsDistribuition) {
      let q = await query(
        "SELECT * FROM question WHERE tag_id = $1 AND q_id != ALL ($2::int[]) ORDER BY RANDOM() LIMIT 1",
        [tagId, this.questions.map((q) => q.q_id)],
      );

      // if we already put it all questions from one tag, then get a random from any tag
      if (q.rowCount === 0) {
        q = await query("SELECT * FROM question ORDER BY RANDOM() LIMIT 1");
      }

      const question: Question = q.rows[0];
      this.questions.push(question);
      await this.createPerformance(question.tag_id);
    }
  }
}

export const Sessions = new Map<string, Session>();
