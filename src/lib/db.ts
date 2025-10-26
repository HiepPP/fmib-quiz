import { sql } from '@vercel/postgres';

// Database connection utility for Vercel Postgres

export interface QuizQuestion {
  id: string;
  question_text: string;
  created_at: string;
  updated_at: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  created_at: string;
}

// Database operations for quiz questions
export const quizQuestionDB = {
  // Get all questions with their answers
  getAllQuestions: async (): Promise<QuizQuestion[]> => {
    try {
      const result = await sql`
        SELECT
          q.id,
          q.question_text,
          q.created_at,
          q.updated_at,
          json_agg(
            json_build_object(
              'id', a.id,
              'answer_text', a.answer_text,
              'is_correct', a.is_correct,
              'created_at', a.created_at
            ) ORDER BY a.created_at
          ) as answers
        FROM quiz_questions q
        LEFT JOIN question_answers a ON q.id = a.question_id
        GROUP BY q.id, q.question_text, q.created_at, q.updated_at
        ORDER BY q.created_at
      `;

      return result.rows.map(row => ({
        ...row,
        answers: row.answers || []
      }));
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  // Create a new question with answers
  createQuestion: async (questionText: string, answers: Array<{ text: string; isCorrect: boolean }>): Promise<QuizQuestion> => {
    try {
      // Start transaction
      await sql`BEGIN`;

      // Insert the question
      const questionResult = await sql`
        INSERT INTO quiz_questions (question_text)
        VALUES (${questionText})
        RETURNING id, question_text, created_at, updated_at
      `;

      const question = questionResult.rows[0];

      // Insert the answers
      if (answers && answers.length > 0) {
        const answerValues = answers.map(answer =>
          sql`${question.id}, ${answer.text}, ${answer.isCorrect}`
        ).join(', ');

        await sql`
          INSERT INTO question_answers (question_id, answer_text, is_correct)
          VALUES ${answerValues}
        `;
      }

      await sql`COMMIT`;

      // Get the complete question with answers
      const completeQuestion = await quizQuestionDB.getQuestionById(question.id);
      return completeQuestion!;
    } catch (error) {
      await sql`ROLLBACK`;
      console.error('Error creating question:', error);
      throw error;
    }
  },

  // Get a single question by ID with answers
  getQuestionById: async (id: string): Promise<QuizQuestion | null> => {
    try {
      const result = await sql`
        SELECT
          q.id,
          q.question_text,
          q.created_at,
          q.updated_at,
          json_agg(
            json_build_object(
              'id', a.id,
              'answer_text', a.answer_text,
              'is_correct', a.is_correct,
              'created_at', a.created_at
            ) ORDER BY a.created_at
          ) as answers
        FROM quiz_questions q
        LEFT JOIN question_answers a ON q.id = a.question_id
        WHERE q.id = ${id}
        GROUP BY q.id, q.question_text, q.created_at, q.updated_at
      `;

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...row,
        answers: row.answers || []
      };
    } catch (error) {
      console.error('Error fetching question by ID:', error);
      throw error;
    }
  },

  // Update a question and its answers
  updateQuestion: async (id: string, questionText: string, answers: Array<{ id?: string; text: string; isCorrect: boolean }>): Promise<QuizQuestion> => {
    try {
      // Start transaction
      await sql`BEGIN`;

      // Update the question
      await sql`
        UPDATE quiz_questions
        SET question_text = ${questionText}
        WHERE id = ${id}
      `;

      // Delete existing answers and insert new ones
      await sql`DELETE FROM question_answers WHERE question_id = ${id}`;

      if (answers && answers.length > 0) {
        const answerValues = answers.map(answer =>
          sql`${id}, ${answer.text}, ${answer.isCorrect}`
        ).join(', ');

        await sql`
          INSERT INTO question_answers (question_id, answer_text, is_correct)
          VALUES ${answerValues}
        `;
      }

      await sql`COMMIT`;

      // Get the updated question with answers
      const updatedQuestion = await quizQuestionDB.getQuestionById(id);
      return updatedQuestion!;
    } catch (error) {
      await sql`ROLLBACK`;
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Delete a question and its answers
  deleteQuestion: async (id: string): Promise<void> => {
    try {
      await sql`
        DELETE FROM quiz_questions WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // Delete all questions and answers
  deleteAllQuestions: async (): Promise<void> => {
    try {
      await sql`BEGIN`;
      await sql`DELETE FROM question_answers`;
      await sql`DELETE FROM quiz_questions`;
      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      console.error('Error deleting all questions:', error);
      throw error;
    }
  },

  // Save multiple questions (batch operation)
  saveAllQuestions: async (questions: Array<{ id?: string; question: string; answers: Array<{ id?: string; text: string; isCorrect: boolean }> }>): Promise<void> => {
    try {
      await sql`BEGIN`;

      // Delete all existing questions and answers
      await sql`DELETE FROM question_answers`;
      await sql`DELETE FROM quiz_questions`;

      // Insert new questions and answers
      for (const q of questions) {
        // Insert question
        const questionResult = await sql`
          INSERT INTO quiz_questions (question_text)
          VALUES (${q.question})
          RETURNING id
        `;
        const questionId = questionResult.rows[0].id;

        // Insert answers
        if (q.answers && q.answers.length > 0) {
          const answerValues = q.answers.map(answer =>
            sql`${questionId}, ${answer.text}, ${answer.isCorrect}`
          ).join(', ');

          await sql`
            INSERT INTO question_answers (question_id, answer_text, is_correct)
            VALUES ${answerValues}
          `;
        }
      }

      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      console.error('Error saving all questions:', error);
      throw error;
    }
  },

  // Check database connection
  testConnection: async (): Promise<boolean> => {
    try {
      await sql`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
};