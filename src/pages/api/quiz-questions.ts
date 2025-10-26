import type { NextApiRequest, NextApiResponse } from 'next'
import { quizQuestionDB } from '@/lib/db'
import { Question } from '@/types/quiz'

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
]

// Convert database question to frontend Question format
const dbQuestionToFrontend = (dbQuestion: any): Question => {
  return {
    id: dbQuestion.id,
    question: dbQuestion.question_text,
    answers: dbQuestion.answers.map((answer: any, index: number) => ({
      id: answer.id || `answer-${index}`,
      text: answer.answer_text,
      isCorrect: answer.is_correct
    }))
  }
}

// Convert frontend Question to database format
const frontendQuestionToDb = (question: Question): any => {
  return {
    id: question.id,
    question_text: question.question,
    answers: question.answers.map(answer => ({
      id: answer.id,
      answer_text: answer.text,
      is_correct: answer.isCorrect
    }))
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Debug: Log the environment variables
  console.log('🔍 Debug - POSTGRES_URL present:', !!process.env.POSTGRES_URL);
  console.log('🔍 Debug - POSTGRES_PRISMA_URL present:', !!process.env.POSTGRES_PRISMA_URL);
  console.log('🔍 Debug - POSTGRES_URL_NON_POOLING present:', !!process.env.POSTGRES_URL_NON_POOLING);
  console.log('🔍 Debug - NODE_ENV:', process.env.NODE_ENV);

  // Check if database is configured
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_PRISMA_URL) {
    return res.status(500).json({
      success: false,
      error: 'Database not configured',
      message: 'Vercel Postgres not properly configured'
    })
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  } catch (error: any) {
    console.error('Quiz Questions API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('📥 Fetching questions from database...')

    // Test database connection first
    const isConnected = await quizQuestionDB.testConnection();
    if (!isConnected) {
      console.log('📝 Database connection failed, using default questions')
      return res.status(200).json({
        success: true,
        data: getDefaultQuestions(),
        source: 'default',
        message: 'Using default questions (database connection failed)'
      })
    }

    const dbQuestions = await quizQuestionDB.getAllQuestions()

    if (dbQuestions.length === 0) {
      console.log('📝 No questions found in database, using default questions')
      return res.status(200).json({
        success: true,
        data: getDefaultQuestions(),
        source: 'default',
        message: 'Using default questions (no questions found in database)'
      })
    }

    // Convert to frontend format
    const questions = dbQuestions.map(dbQuestionToFrontend)

    console.log(`✅ Successfully loaded ${questions.length} questions from database`)
    return res.status(200).json({
      success: true,
      data: questions,
      source: 'database',
      count: questions.length,
      message: `Loaded ${questions.length} questions from database`
    })
  } catch (error: any) {
    console.error('❌ Error fetching questions from database:', error)

    // Fallback to default questions on database error
    console.log('📝 Using default questions due to database error')
    return res.status(200).json({
      success: true,
      data: getDefaultQuestions(),
      source: 'default',
      message: 'Using default questions (database error)',
      error: error.message
    })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { questions } = req.body

    // Validate questions structure
    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: 'Questions must be an array'
      })
    }

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one question is required'
      })
    }

    // Validate each question
    for (const question of questions) {
      if (!question.question || typeof question.question !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Each question must have a valid question text'
        })
      }

      if (!Array.isArray(question.answers) || question.answers.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Each question must have at least 2 answers'
        })
      }

      const hasCorrectAnswer = question.answers.some((answer: any) => answer.isCorrect)
      if (!hasCorrectAnswer) {
        return res.status(400).json({
          success: false,
          error: 'Each question must have at least one correct answer'
        })
      }

      // Validate answer structure
      for (const answer of question.answers) {
        if (!answer.text || typeof answer.text !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Each answer must have valid text'
          })
        }
      }
    }

    console.log(`💾 Saving ${questions.length} questions to database...`)

    // Save all questions to database (replaces existing questions)
    await quizQuestionDB.saveAllQuestions(questions)

    console.log(`✅ Successfully saved ${questions.length} questions to database`)

    return res.status(200).json({
      success: true,
      message: `Successfully saved ${questions.length} questions to database`,
      data: {
        count: questions.length,
        savedAt: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('❌ Error saving questions to database:', error)

    // Enhanced error analysis
    if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({
        success: false,
        error: 'Database connection failed',
        message: 'Unable to connect to Vercel Postgres'
      })
    }

    if (error.message.includes('permission') || error.message.includes('access denied')) {
      return res.status(403).json({
        success: false,
        error: 'Database permission denied',
        message: 'Check your database credentials and permissions'
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to save questions',
      message: error.message
    })
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🗑️ Deleting all questions from database...')

    await quizQuestionDB.deleteAllQuestions()

    console.log('✅ Successfully deleted all questions from database')

    return res.status(200).json({
      success: true,
      message: 'Successfully deleted all questions from database'
    })
  } catch (error: any) {
    console.error('❌ Error deleting questions from database:', error)

    return res.status(500).json({
      success: false,
      error: 'Failed to delete questions',
      message: error.message
    })
  }
}