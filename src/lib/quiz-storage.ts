import { Question } from './storage';
import { checkDbStorageConfig, devFallbackStorage, showDevWarning } from './dev-storage';

// Show development warning on module load
if (typeof window !== 'undefined') {
  showDevWarning();
}

// Error handling utility
class QuizStorageError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'QuizStorageError';
  }
}

// Default questions fallback
const getDefaultQuestions = (): Question[] => [
  {
    id: 'default-1',
    question: 'What is the capital of France?',
    answers: [
      { id: 'a1', text: 'London', isCorrect: false },
      { id: 'a2', text: 'Berlin', isCorrect: false },
      { id: 'a3', text: 'Paris', isCorrect: true },
      { id: 'a4', text: 'Madrid', isCorrect: false }
    ]
  },
  {
    id: 'default-2',
    question: 'What is 2 + 2?',
    answers: [
      { id: 'a1', text: '3', isCorrect: false },
      { id: 'a2', text: '4', isCorrect: true },
      { id: 'a3', text: '5', isCorrect: false },
      { id: 'a4', text: '22', isCorrect: false }
    ]
  }
];

// Quiz storage utility functions using Vercel Postgres
export const quizStorage = {
  /**
   * Check if database storage is properly configured
   */
  isConfigured: (): boolean => {
    const config = checkDbStorageConfig();
    return config.isConfigured;
  },

  /**
   * Save questions to Vercel Postgres database (via API)
   */
  saveQuestions: async (questions: Question[]): Promise<{ success: boolean; timestamp: Date }> => {
    // Check configuration first
    const config = checkDbStorageConfig();
    if (!config.isConfigured) {
      if (config.canProceed) {
        console.log(config.message);
        // Fallback to localStorage for development
        devFallbackStorage.saveQuestions(questions);
        return {
          success: true,
          timestamp: new Date()
        };
      } else {
        throw new QuizStorageError(config.message);
      }
    }

    try {
      // Validate questions structure
      if (!Array.isArray(questions)) {
        throw new QuizStorageError('Questions must be an array');
      }

      if (questions.length === 0) {
        throw new QuizStorageError('At least one question is required');
      }

      // Validate each question
      for (const question of questions) {
        if (!question.question || typeof question.question !== 'string') {
          throw new QuizStorageError('Each question must have valid question text');
        }

        if (!Array.isArray(question.answers)) {
          throw new QuizStorageError('Invalid question structure detected');
        }

        if (question.answers.length < 2) {
          throw new QuizStorageError('Each question must have at least 2 answers');
        }

        const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
        if (!hasCorrectAnswer) {
          throw new QuizStorageError('Each question must have at least one correct answer');
        }

        // Validate answer structure
        for (const answer of question.answers) {
          if (!answer.text || typeof answer.text !== 'string') {
            throw new QuizStorageError('Each answer must have valid text');
          }
        }
      }

      console.log(`📤 Saving ${questions.length} questions to database via API...`);
      console.log('💾 Database will be updated with new questions');

      // Call API to save questions
      const response = await fetch('/api/quiz-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new QuizStorageError(result.error || result.message || 'Failed to save questions');
      }

      console.log(`✅ Successfully saved ${questions.length} questions to database via API`);
      console.log(`📁 Database updated at: ${result.data?.savedAt || 'unknown'}`);

      return {
        success: true,
        timestamp: result.data?.savedAt ? new Date(result.data.savedAt) : new Date()
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error saving questions via API:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        questionsCount: questions.length,
        timestamp: new Date().toISOString()
      });

      // Enhanced error analysis
      if (errorMessage.includes('503') || errorMessage.includes('connection')) {
        console.error('🔗 Database connection failed - Check your POSTGRES_URL');
      } else if (errorMessage.includes('403') || errorMessage.includes('permission')) {
        console.error('🔑 Database permission denied - Check your database credentials');
      } else if (errorMessage.includes('fetch') || errorMessage.includes('ENOTFOUND')) {
        console.error('🌐 Network error - Check your internet connection');
      } else if (errorMessage.includes('Failed to fetch')) {
        console.error('🌐 API request failed - Check server is running');
      }

      if (error instanceof QuizStorageError) {
        throw error;
      }

      throw new QuizStorageError('Failed to save questions via API', error as Error);
    }
  },

  /**
   * Get questions from Vercel Postgres database (via API)
   */
  getQuestions: async (): Promise<Question[]> => {
    // Check configuration first
    const config = checkDbStorageConfig();
    if (!config.isConfigured) {
      if (config.canProceed) {
        console.log(config.message);
        // Fallback to localStorage for development
        return devFallbackStorage.getQuestions();
      } else {
        throw new QuizStorageError(config.message);
      }
    }

    try {
      console.log('📥 Loading questions from database via API...');

      // Call API to get questions
      const response = await fetch('/api/quiz-questions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || result.message || 'API returned error');
      }

      const questions = result.data;

      console.log(`✅ Successfully loaded ${questions.length} questions via API (${result.source})`);
      return questions;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error loading questions via API:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });

      // Enhanced error analysis
      if (errorMessage.includes('503') || errorMessage.includes('connection')) {
        console.error('🔗 Database connection failed - Check your POSTGRES_URL');
      } else if (errorMessage.includes('403') || errorMessage.includes('permission')) {
        console.error('🔑 Database permission denied - Check your database credentials');
      } else if (errorMessage.includes('fetch') || errorMessage.includes('ENOTFOUND')) {
        console.error('🌐 Network error - Check your internet connection');
      } else if (errorMessage.includes('Failed to fetch')) {
        console.error('🌐 API request failed - Check server is running');
      }

      console.log('📝 Using default questions as fallback');
      return getDefaultQuestions();
    }
  },

  /**
   * Delete all questions from database (via API)
   */
  deleteAllQuestions: async (): Promise<void> => {
    try {
      console.log('🗑️ Deleting all questions from database via API...');

      const response = await fetch('/api/quiz-questions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || result.message || 'Failed to delete questions');
      }

      console.log('✅ Successfully deleted all questions from database via API');

    } catch (error) {
      console.error('❌ Error deleting questions via API:', error);
      throw new QuizStorageError('Failed to delete questions via API', error as Error);
    }
  }
};

// Export types for external use
export type { Question };

// Utility function for migrating from localStorage to database storage
export const migrateFromLocalStorage = async (): Promise<{
  success: boolean;
  message: string;
  questionsMigrated: number;
}> => {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        message: 'Migration can only be performed in the browser',
        questionsMigrated: 0
      };
    }

    // Get questions from localStorage
    const questionsData = localStorage.getItem('fmib_quiz_questions');

    if (!questionsData) {
      return {
        success: false,
        message: 'No questions found in localStorage to migrate',
        questionsMigrated: 0
      };
    }

    const questions: Question[] = JSON.parse(questionsData);

    if (!Array.isArray(questions) || questions.length === 0) {
      return {
        success: false,
        message: 'Invalid questions data in localStorage',
        questionsMigrated: 0
      };
    }

    // Save to database storage
    await quizStorage.saveQuestions(questions);

    // Clear localStorage questions (optional)
    localStorage.removeItem('fmib_quiz_questions');

    return {
      success: true,
      message: `Successfully migrated ${questions.length} questions to database storage`,
      questionsMigrated: questions.length
    };

  } catch (error) {
    console.error('❌ Error migrating from localStorage:', error);
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      questionsMigrated: 0
    };
  }
};