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
  session_id: string;
  cursor: number = 0;
  questions: Question[] = [];
  deck_id: string;
  userResponses: UserResponse[] = [];

  constructor(deck_id: string) {
    this.session_id = crypto.randomUUID();
    this.deck_id = deck_id;
  }

  /**
   * Creates a performance record for a tag if it doesn't exist
   */
  private async createPerformanceRecord(tagId: number): Promise<void> {
    const query_text = `
      INSERT INTO performance(tag_id, corrects, errors) 
      VALUES($1, 0, 0) 
      ON CONFLICT DO NOTHING
    `;
    await query(query_text, [tagId]);
  }

  /**
   * Updates performance based on user responses and updates deck correctness percentage
   */
  async updatePerformance(responses: UserResponse[]): Promise<void> {
    this.userResponses = responses;

    for (let i = 0; i < responses.length; i++) {
      const question = this.questions[i];
      const userResponse = responses[i];
      const isCorrect = question.correct === userResponse.value;

      await this.updatePerformanceCounter(question.tag_id, isCorrect);
    }

    // Update deck correctness percentage after updating individual performances
    await this.updateDeckCorrectnessPercent();
  }

  /**
   * Updates the correct or error counter for a specific tag
   */
  private async updatePerformanceCounter(
    tagId: number,
    isCorrect: boolean,
  ): Promise<void> {
    const column = isCorrect ? "corrects" : "errors";
    const query_text =
      `UPDATE performance SET ${column} = ${column} + 1 WHERE tag_id = $1`;
    await query(query_text, [tagId]);
  }

  /**
   * Calculates and updates the overall correctness percentage for the deck
   * Based on the average correctness across all tags in the deck
   */
  private async updateDeckCorrectnessPercent(): Promise<void> {
    const query_text = `
      UPDATE deck 
      SET correctness_percent = (
        SELECT COALESCE(
          ROUND(
            AVG(
              CASE 
                WHEN (p.corrects + p.errors) = 0 THEN 0
                ELSE (p.corrects::DECIMAL / (p.corrects + p.errors)) * 100
              END
            ), 2
          ), 0
        )
        FROM tag t
        LEFT JOIN performance p ON t.tag_id = p.tag_id
        WHERE t.deck_id = $1
      )
      WHERE deck_id = $1
    `;

    await query(query_text, [this.deck_id]);
  }

  /**
   * Implements Weighted Random Selection algorithm
   * Tags with more errors have higher probability of being selected
   */
  private calculateWeightedRandomSelection(
    maxQuestions: number,
    performances: Performance[],
  ): number[] {
    const tagWeights = this.calculateTagWeights(performances);
    const totalWeight = tagWeights.reduce((sum, item) => sum + item.weight, 0);

    return this.selectRandomTagIds(maxQuestions, tagWeights, totalWeight);
  }

  /**
   * Calculates weights for each tag based on error/success ratio
   */
  private calculateTagWeights(
    performances: Performance[],
  ): { tagId: number; weight: number }[] {
    return performances.map((performance) => {
      const totalAttempts = performance.corrects + performance.errors;
      // Higher weight for tags with more errors relative to total attempts
      const weight = (performance.errors + 1) /
        (totalAttempts + performances.length);

      return { tagId: performance.tag_id, weight };
    });
  }

  /**
   * Selects random tag IDs based on weighted probabilities
   */
  private selectRandomTagIds(
    maxQuestions: number,
    tagWeights: { tagId: number; weight: number }[],
    totalWeight: number,
  ): number[] {
    const selectedTagIds: number[] = [];

    for (let i = 0; i < maxQuestions; i++) {
      const randomValue = Math.random() * totalWeight;
      let accumulator = 0;

      for (const { tagId, weight } of tagWeights) {
        accumulator += weight;
        if (randomValue <= accumulator) {
          selectedTagIds.push(tagId);
          break;
        }
      }
    }

    return selectedTagIds;
  }

  /**
   * Generates questions for the session based on performance or random selection
   */
  async generateQuestions(maxQuestions: number): Promise<void> {
    const deckTags = await this.getDeckTags();
    const performances = await this.getPerformances(deckTags);

    if (performances.length === 0) {
      await this.generateRandomQuestions(maxQuestions);
    } else {
      await this.generateWeightedQuestions(maxQuestions, performances);
    }
  }

  /**
   * Gets all tags for the current deck
   */
  private async getDeckTags(): Promise<Tag[]> {
    const result = await query("SELECT * FROM tag WHERE deck_id = $1", [
      this.deck_id,
    ]);
    return result.rows;
  }

  /**
   * Gets performance data for the given tags
   */
  private async getPerformances(tags: Tag[]): Promise<Performance[]> {
    const tagIds = tags.map((tag) => tag.tag_id);
    const result = await query(
      "SELECT * FROM performance WHERE tag_id = ANY($1::int[])",
      [tagIds],
    );
    return result.rows;
  }

  /**
   * Generates random questions when no performance data exists
   */
  private async generateRandomQuestions(maxQuestions: number): Promise<void> {
    const usedQuestionIds = this.questions.map((q) => q.q_id);

    for (let i = 0; i < maxQuestions; i++) {
      const question = await this.getRandomQuestion(usedQuestionIds);
      if (question) {
        this.questions.push(question);
        await this.createPerformanceRecord(question.tag_id);
        usedQuestionIds.push(question.q_id);
      }
    }
  }

  /**
   * Generates questions based on weighted selection using performance data
   */
  private async generateWeightedQuestions(
    maxQuestions: number,
    performances: Performance[],
  ): Promise<void> {
    const tagDistribution = this.calculateWeightedRandomSelection(
      maxQuestions,
      performances,
    );
    const usedQuestionIds = this.questions.map((q) => q.q_id);

    for (const tagId of tagDistribution) {
      const question = await this.getQuestionByTag(tagId, usedQuestionIds) ||
        await this.getRandomQuestion(usedQuestionIds);

      if (question) {
        this.questions.push(question);
        await this.createPerformanceRecord(question.tag_id);
        usedQuestionIds.push(question.q_id);
      }
    }
  }

  /**
   * Gets a random question from a specific tag, excluding already used questions
   */
  private async getQuestionByTag(
    tagId: number,
    excludeIds: number[],
  ): Promise<Question | null> {
    const result = await query(
      `SELECT * FROM question 
       WHERE tag_id = $1 AND q_id != ALL ($2::int[]) 
       ORDER BY RANDOM() LIMIT 1`,
      [tagId, excludeIds],
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  }

  /**
   * Gets a random question from the current deck, excluding already used questions
   */
  private async getRandomQuestion(
    excludeIds: number[],
  ): Promise<Question | null> {
    const result = await query(
      `SELECT q.* FROM question q
       JOIN tag t ON q.tag_id = t.tag_id
       WHERE t.deck_id = $1 AND q.q_id != ALL ($2::int[]) 
       ORDER BY RANDOM() LIMIT 1`,
      [this.deck_id, excludeIds],
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  }
}
export const Sessions = new Map<string, Session>();
