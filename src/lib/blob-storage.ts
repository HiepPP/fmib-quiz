import { put, list, del } from '@vercel/blob';
import { Question } from './storage';
import { checkBlobStorageConfig, devFallbackStorage, showDevWarning } from './dev-storage';

// Show development warning on module load
if (typeof window !== 'undefined') {
  showDevWarning();
}

// Blob storage configuration
const QUIZ_QUESTIONS_BLOB = 'quiz-questions.json';
const QUIZ_QUESTIONS_BACKUP_PREFIX = 'quiz-questions-backup-';

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
   * Save questions to Vercel Blob storage
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

      // Create backup before saving new version
      await blobStorage.createBackup(questions);

      // Save to blob storage
      const blob = await put(QUIZ_QUESTIONS_BLOB, JSON.stringify(questions, null, 2), {
        access: 'public',
        contentType: 'application/json',
      });

      console.log(`✅ Saved ${questions.length} questions to blob storage`);
      return {
        url: blob.url,
        uploadedAt: new Date()
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error saving questions to blob storage:', {
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
      }

      if (error instanceof BlobStorageError) {
        throw error;
      }

      throw new BlobStorageError('Failed to save questions to blob storage', error as Error);
    }
  },

  /**
   * Get questions from Vercel Blob storage
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
      // List blobs to find our questions file
      const { blobs } = await list({ prefix: QUIZ_QUESTIONS_BLOB });

      if (blobs.length === 0) {
        console.log('📝 No questions found in blob storage, using default questions');
        return getDefaultQuestions();
      }

      // Get the most recent version
      const questionsBlob = blobs[0];
      console.log(`📥 Fetching questions from: ${questionsBlob.url}`);

      const response = await fetch(questionsBlob.url);

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }

      const questions: Question[] = await response.json();

      // Validate the loaded questions
      if (!Array.isArray(questions) || questions.length === 0) {
        console.warn('⚠️ Invalid questions format in blob storage, using defaults');
        return getDefaultQuestions();
      }

      console.log(`✅ Loaded ${questions.length} questions from blob storage`);
      return questions;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error loading questions from blob storage:', {
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
      }

      console.log('📝 Using default questions as fallback');
      return getDefaultQuestions();
    }
  },

  /**
   * Delete questions from blob storage
   */
  deleteQuestions: async (): Promise<void> => {
    try {
      const { blobs } = await list({ prefix: QUIZ_QUESTIONS_BLOB });

      if (blobs.length > 0) {
        await del(blobs.map(blob => blob.url));
        console.log('🗑️ Deleted questions from blob storage');
      }
    } catch (error) {
      console.error('❌ Error deleting questions from blob storage:', error);
      throw new BlobStorageError('Failed to delete questions from blob storage', error as Error);
    }
  },

  /**
   * Create a backup of current questions
   */
  createBackup: async (questions: Question[]): Promise<void> => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `${QUIZ_QUESTIONS_BACKUP_PREFIX}${timestamp}.json`;

      await put(backupFilename, JSON.stringify(questions, null, 2), {
        access: 'public',
        contentType: 'application/json',
      });

      console.log(`💾 Created backup: ${backupFilename}`);
    } catch (error) {
      console.warn('⚠️ Failed to create backup:', error);
      // Don't throw here - backup failure shouldn't stop the main operation
    }
  },

  /**
   * List all available backups
   */
  listBackups: async (): Promise<Array<{ filename: string; uploadedAt: Date; size: number }>> => {
    try {
      const { blobs } = await list({ prefix: QUIZ_QUESTIONS_BACKUP_PREFIX });

      return blobs.map(blob => ({
        filename: blob.pathname,
        uploadedAt: blob.uploadedAt,
        size: blob.size
      })).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    } catch (error) {
      console.error('❌ Error listing backups:', error);
      return [];
    }
  },

  /**
   * Restore from a backup
   */
  restoreFromBackup: async (backupFilename: string): Promise<Question[]> => {
    try {
      const { blobs } = await list({ prefix: backupFilename });

      if (blobs.length === 0) {
        throw new Error(`Backup not found: ${backupFilename}`);
      }

      const response = await fetch(blobs[0].url);
      const questions: Question[] = await response.json();

      // Save as current questions
      await blobStorage.saveQuestions(questions);

      console.log(`🔄 Restored questions from backup: ${backupFilename}`);
      return questions;

    } catch (error) {
      console.error('❌ Error restoring from backup:', error);
      throw new BlobStorageError('Failed to restore from backup', error as Error);
    }
  },

  /**
   * Get storage information
   */
  getStorageInfo: async (): Promise<{
    totalQuestions: number;
    backupsCount: number;
    totalSize: number;
  }> => {
    try {
      const { blobs } = await list();

      const mainQuestions = blobs.find(b => b.pathname === QUIZ_QUESTIONS_BLOB);
      const backups = blobs.filter(b => b.pathname.startsWith(QUIZ_QUESTIONS_BACKUP_PREFIX));

      let totalQuestions = 0;
      if (mainQuestions) {
        const response = await fetch(mainQuestions.url);
        const questions: Question[] = await response.json();
        totalQuestions = questions.length;
      }

      return {
        totalQuestions,
        backupsCount: backups.length,
        totalSize: blobs.reduce((sum, blob) => sum + blob.size, 0)
      };

    } catch (error) {
      console.error('❌ Error getting storage info:', error);
      return {
        totalQuestions: 0,
        backupsCount: 0,
        totalSize: 0
      };
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