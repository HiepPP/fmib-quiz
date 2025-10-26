import { Question } from "./storage";

/**
 * Development utility for handling blob storage configuration
 */

export const checkBlobStorageConfig = (): {
  isConfigured: boolean;
  message: string;
  canProceed: boolean;
} => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  // Check if blob token is configured
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (!hasBlobToken) {
    return {
      isConfigured: false,
      message: isDevelopment
        ? "⚠️ Vercel Blob storage is not configured. Using localStorage for development. To use blob storage, set BLOB_READ_WRITE_TOKEN in your .env.local file."
        : "❌ Vercel Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.",
      canProceed: isDevelopment, // Allow proceeding in development with localStorage fallback
    };
  }

  return {
    isConfigured: true,
    message: "✅ Vercel Blob storage is properly configured.",
    canProceed: true,
  };
};

/**
 * Development fallback storage when blob storage is not configured
 */
export const devFallbackStorage = {
  saveQuestions: (questions: Question[]): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "fmib_quiz_questions_dev",
        JSON.stringify(questions),
      );
      console.log("📝 Questions saved to localStorage (development fallback)");
    }
  },

  getQuestions: (): Question[] => {
    if (typeof window !== "undefined") {
      const questionsData = localStorage.getItem("fmib_quiz_questions_dev");
      if (questionsData) {
        const questions = JSON.parse(questionsData);
        console.log(
          "📥 Questions loaded from localStorage (development fallback)",
        );
        return questions;
      }
    }

    // Return default questions if nothing is stored
    const defaultQuestions: Question[] = [
      {
        id: "dev-1",
        question: "What is the capital of France? (Development Mode)",
        answers: [
          { id: "a1", text: "London", isCorrect: false },
          { id: "a2", text: "Berlin", isCorrect: false },
          { id: "a3", text: "Paris", isCorrect: true },
          { id: "a4", text: "Madrid", isCorrect: false },
        ],
      },
      {
        id: "dev-2",
        question: "What is 2 + 2? (Development Mode)",
        answers: [
          { id: "a3", text: "3", isCorrect: false },
          { id: "a4", text: "4", isCorrect: true },
          { id: "a5", text: "5", isCorrect: false },
          { id: "a6", text: "22", isCorrect: false },
        ],
      },
    ];

    console.log("📝 Using default development questions");
    return defaultQuestions;
  },

  clearQuestions: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fmib_quiz_questions_dev");
      console.log("🗑️ Development questions cleared from localStorage");
    }
  },
};

/**
 * Development utility for handling database storage configuration
 */
export const checkDbStorageConfig = (): {
  isConfigured: boolean;
  message: string;
  canProceed: boolean;
} => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  // Check if database is configured
  const hasDbConnection = !!(
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  );

  if (!hasDbConnection) {
    return {
      isConfigured: false,
      message: isDevelopment
        ? "⚠️ Vercel Postgres is not configured. Using localStorage for development. To use database storage, set POSTGRES_URL in your .env.local file."
        : "❌ Vercel Postgres is not configured. Please set POSTGRES_URL environment variable.",
      canProceed: isDevelopment, // Allow proceeding in development with localStorage fallback
    };
  }

  return {
    isConfigured: true,
    message: "✅ Vercel Postgres is properly configured.",
    canProceed: true,
  };
};

/**
 * Show development configuration warning
 */
export const showDevWarning = (): void => {
  const blobConfig = checkBlobStorageConfig();
  const dbConfig = checkDbStorageConfig();

  if ((!blobConfig.isConfigured || !dbConfig.isConfigured) && typeof window !== "undefined") {
    console.log(`
🚀 FMIB Quiz - Development Mode
${!dbConfig.isConfigured ? dbConfig.message : ''}
${!blobConfig.isConfigured ? blobConfig.message : ''}

To configure Vercel Postgres:
1. Go to your Vercel project dashboard
2. Navigate to Storage tab
3. Create a new Postgres database
4. Copy the POSTGRES_URL
5. Add it to your .env.local file

For now, using localStorage for development.
    `);
  }
};
