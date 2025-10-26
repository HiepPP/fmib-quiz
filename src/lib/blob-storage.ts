import { Question } from './storage';
import { checkBlobStorageConfig, devFallbackStorage, showDevWarning } from './dev-storage';

// Show development warning on module load
if (typeof window !== 'undefined') {
  showDevWarning();
}

// Blob storage configuration (constants moved to API route)

// Error handling utility
class BlobStorageError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'BlobStorageError';
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

// Blob storage utility functions
export const blobStorage = {
  /**
   * Check if blob storage is properly configured
   */
  isConfigured: (): boolean => {
    const config = checkBlobStorageConfig();
    return config.isConfigured;
  },

  /**
   * Save questions to Vercel Blob storage (via API)
   */
  saveQuestions: async (questions: Question[]): Promise<{ url: string; uploadedAt: Date }> => {
    // Check configuration first
    const config = checkBlobStorageConfig();
    if (!config.isConfigured) {
      if (config.canProceed) {
        console.log(config.message);
        // Fallback to localStorage for development
        devFallbackStorage.saveQuestions(questions);
        return {
          url: 'localStorage-fallback',
          uploadedAt: new Date()
        };
      } else {
        throw new BlobStorageError(config.message);
      }
    }

    try {
      // Validate questions structure
      if (!Array.isArray(questions)) {
        throw new BlobStorageError('Questions must be an array');
      }

      // Validate each question
      for (const question of questions) {
        if (!question.id || !question.question || !Array.isArray(question.answers)) {
          throw new BlobStorageError('Invalid question structure detected');
        }

        if (question.answers.length < 2) {
          throw new BlobStorageError('Each question must have at least 2 answers');
        }

        const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
        if (!hasCorrectAnswer) {
          throw new BlobStorageError('Each question must have at least one correct answer');
        }
      }

      console.log(`📤 Saving ${questions.length} questions via API...`);
      console.log('💾 Blob file will be created if it doesn\'t exist');

      // Call API to save questions
      const response = await fetch('/api/blob-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new BlobStorageError(result.error || result.message || 'Failed to save questions');
      }

      console.log(`✅ Successfully saved ${questions.length} questions via API`);
      console.log(`📁 Blob file created/updated at: ${result.data?.url || 'api-success'}`);
      return {
        url: result.data?.url || 'api-success',
        uploadedAt: result.data?.uploadedAt ? new Date(result.data.uploadedAt) : new Date()
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
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        console.error('🔑 Permission denied - Check your BLOB_READ_WRITE_TOKEN');
      } else if (errorMessage.includes('404')) {
        console.error('🏪 Blob store not found - Create a blob store in Vercel dashboard');
      } else if (errorMessage.includes('fetch') || errorMessage.includes('ENOTFOUND')) {
        console.error('🌐 Network error - Check your internet connection');
      } else if (errorMessage.includes('Failed to fetch')) {
        console.error('🌐 API request failed - Check server is running');
      }

      if (error instanceof BlobStorageError) {
        throw error;
      }

      throw new BlobStorageError('Failed to save questions via API', error as Error);
    }
  },

  /**
   * Get questions from Vercel Blob storage (via API)
   */
  getQuestions: async (): Promise<Question[]> => {
    // Check configuration first
    const config = checkBlobStorageConfig();
    if (!config.isConfigured) {
      if (config.canProceed) {
        console.log(config.message);
        // Fallback to localStorage for development
        return devFallbackStorage.getQuestions();
      } else {
        throw new BlobStorageError(config.message);
      }
    }

    try {
      console.log('📥 Loading questions via API...');

      // Call API to get questions
      const response = await fetch('/api/blob-questions', {
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
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        console.error('🔑 Permission denied - Check your BLOB_READ_WRITE_TOKEN');
      } else if (errorMessage.includes('404')) {
        console.error('🏪 Blob store not found - Create a blob store in Vercel dashboard');
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
   * Delete questions from blob storage (via API)
   */
  deleteQuestions: async (): Promise<void> => {
    try {
      console.log('🗑️ Deleting questions via API...');

      const response = await fetch('/api/blob-questions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || result.message || 'Failed to delete questions');
      }

      console.log('✅ Successfully deleted questions via API');

    } catch (error) {
      console.error('❌ Error deleting questions via API:', error);
      throw new BlobStorageError('Failed to delete questions via API', error as Error);
    }
  }
};

// Export types for external use
export type { Question };

// Utility function for migrating from localStorage to blob storage
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

    // Save to blob storage
    await blobStorage.saveQuestions(questions);

    // Clear localStorage questions (optional)
    localStorage.removeItem('fmib_quiz_questions');

    return {
      success: true,
      message: `Successfully migrated ${questions.length} questions to blob storage`,
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