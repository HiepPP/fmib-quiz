import type { NextApiRequest, NextApiResponse } from "next";
import { put, list, del } from "@vercel/blob";
import { Question } from "@/types/quiz";

const QUIZ_QUESTIONS_BLOB = "quiz-questions.json";

// Default questions fallback
const getDefaultQuestions = (): Question[] => [
  {
    id: "default-1",
    question: "What is the capital of France?",
    answers: [
      { id: "a1", text: "London", isCorrect: false },
      { id: "a2", text: "Berlin", isCorrect: false },
      { id: "a3", text: "Paris", isCorrect: true },
      { id: "a4", text: "Madrid", isCorrect: false },
    ],
  },
  {
    id: "default-2",
    question: "What is 2 + 2?",
    answers: [
      { id: "a1", text: "3", isCorrect: false },
      { id: "a2", text: "4", isCorrect: true },
      { id: "a3", text: "5", isCorrect: false },
      { id: "a4", text: "22", isCorrect: false },
    ],
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Debug: Log the environment variable
  console.log(
    "🔍 Debug - BLOB_READ_WRITE_TOKEN:",
    process.env.BLOB_READ_WRITE_TOKEN ? "SET" : "NOT SET",
  );
  console.log("🔍 Debug - NODE_ENV:", process.env.NODE_ENV);

  // Check BLOB_READ_WRITE_TOKEN
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      success: false,
      error: "BLOB_READ_WRITE_TOKEN not configured",
      message: "Server-side blob storage not properly configured",
    });
  }

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      case "DELETE":
        return await handleDelete(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        return res.status(405).json({
          success: false,
          error: "Method not allowed",
        });
    }
  } catch (error: any) {
    console.error("Blob API error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    return res.json({
      debug: "BLOB_READ_WRITE_TOKEN",
      value: process.env.BLOB_READ_WRITE_TOKEN,
      message: "Debug: Environment variable value"
    });
    // List blobs to find our questions file
    const { blobs } = await list({ prefix: QUIZ_QUESTIONS_BLOB });

    if (blobs.length === 0) {
      console.log(
        "📝 No questions found in blob storage, using default questions",
      );
      return res.status(200).json({
        success: true,
        data: getDefaultQuestions(),
        source: "default",
        message: "Using default questions (no questions found in blob storage)",
      });
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
      console.warn(
        "⚠️ Invalid questions format in blob storage, using defaults",
      );
      return res.status(200).json({
        success: true,
        data: getDefaultQuestions(),
        source: "default",
        message: "Using default questions (invalid format in blob storage)",
      });
    }

    console.log(`✅ Loaded ${questions.length} questions from blob storage`);
    return res.status(200).json({
      success: true,
      data: questions,
      source: "blob",
      message: `Successfully loaded ${questions.length} questions from blob storage`,
    });
  } catch (error) {
    console.error("❌ Error loading questions from blob storage:", error);
    console.log("📝 Using default questions as fallback");

    return res.status(200).json({
      success: true,
      data: getDefaultQuestions(),
      source: "default",
      message: "Using default questions (blob storage error)",
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { questions } = req.body;

    // Validate questions structure
    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: "Questions must be an array",
      });
    }

    // Validate each question
    for (const question of questions) {
      if (
        !question.id ||
        !question.question ||
        !Array.isArray(question.answers)
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid question structure detected",
        });
      }

      if (question.answers.length < 2) {
        return res.status(400).json({
          success: false,
          error: "Each question must have at least 2 answers",
        });
      }

      const hasCorrectAnswer = question.answers.some(
        (answer: any) => answer.isCorrect,
      );
      if (!hasCorrectAnswer) {
        return res.status(400).json({
          success: false,
          error: "Each question must have at least one correct answer",
        });
      }
    }

    // Create backup before saving new version
    await createBackup(questions);

    // Save to blob storage (file will be created if it doesn't exist)
    console.log(`💾 Creating/updating blob file: ${QUIZ_QUESTIONS_BLOB}`);
    const blob = await put(
      QUIZ_QUESTIONS_BLOB,
      JSON.stringify(questions, null, 2),
      {
        access: "public",
        contentType: "application/json",
        allowOverwrite: true,
      },
    );

    console.log(`✅ Saved ${questions.length} questions to blob storage`);
    console.log(`📁 Blob file created/updated: ${blob.url}`);
    return res.status(200).json({
      success: true,
      message: `Successfully saved ${questions.length} questions (file created/updated)`,
      data: {
        url: blob.url,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ Error saving questions to blob storage:", error);

    // Enhanced error analysis
    if (error.message.includes("401") || error.message.includes("403")) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
        message: "Check your BLOB_READ_WRITE_TOKEN permissions",
      });
    }

    if (error.message.includes("404")) {
      return res.status(404).json({
        success: false,
        error: "Blob store not found",
        message: "Ensure you created a blob store in Vercel dashboard",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to save questions",
      message: error.message,
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { blobs } = await list({ prefix: QUIZ_QUESTIONS_BLOB });

    if (blobs.length > 0) {
      await del(blobs.map((blob) => blob.url));
      console.log("🗑️ Deleted questions from blob storage");
    }

    return res.status(200).json({
      success: true,
      message: "Questions deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting questions from blob storage:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete questions",
      message: error.message,
    });
  }
}

async function createBackup(questions: Question[]) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilename = `quiz-questions-backup-${timestamp}.json`;

    await put(backupFilename, JSON.stringify(questions, null, 2), {
      access: "public",
      contentType: "application/json",
    });

    console.log(`💾 Created backup: ${backupFilename}`);
  } catch (error) {
    console.warn("⚠️ Failed to create backup:", error);
    // Don't throw here - backup failure shouldn't stop the main operation
  }
}
