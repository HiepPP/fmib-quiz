import type { NextApiRequest, NextApiResponse } from 'next'
import { Question } from '@/types/quiz'
import { list } from '@vercel/blob'

// Mock questions for development when localStorage is not available
function getMockQuestions(): Question[] {
  return [
    {
      id: 'q1',
      question: 'What is the capital of France?',
      answers: [
        { id: 'a1', text: 'London', isCorrect: false },
        { id: 'a2', text: 'Berlin', isCorrect: false },
        { id: 'a3', text: 'Paris', isCorrect: true },
        { id: 'a4', text: 'Madrid', isCorrect: false }
      ]
    },
    {
      id: 'q2',
      question: 'Which planet is known as the Red Planet?',
      answers: [
        { id: 'a5', text: 'Venus', isCorrect: false },
        { id: 'a6', text: 'Mars', isCorrect: true },
        { id: 'a7', text: 'Jupiter', isCorrect: false },
        { id: 'a8', text: 'Saturn', isCorrect: false }
      ]
    },
    {
      id: 'q3',
      question: 'What is 2 + 2?',
      answers: [
        { id: 'a9', text: '3', isCorrect: false },
        { id: 'a10', text: '4', isCorrect: true },
        { id: 'a11', text: '5', isCorrect: false },
        { id: 'a12', text: '22', isCorrect: false }
      ]
    },
    {
      id: 'q4',
      question: 'Who painted the Mona Lisa?',
      answers: [
        { id: 'a13', text: 'Vincent van Gogh', isCorrect: false },
        { id: 'a14', text: 'Pablo Picasso', isCorrect: false },
        { id: 'a15', text: 'Leonardo da Vinci', isCorrect: true },
        { id: 'a16', text: 'Michelangelo', isCorrect: false }
      ]
    },
    {
      id: 'q5',
      question: 'What is the largest ocean on Earth?',
      answers: [
        { id: 'a17', text: 'Atlantic Ocean', isCorrect: false },
        { id: 'a18', text: 'Indian Ocean', isCorrect: false },
        { id: 'a19', text: 'Arctic Ocean', isCorrect: false },
        { id: 'a20', text: 'Pacific Ocean', isCorrect: true }
      ]
    }
  ]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET method
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only GET requests are supported'
    })
  }

  // Check BLOB_READ_WRITE_TOKEN
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('📝 BLOB_READ_WRITE_TOKEN not configured, using mock questions')
    const questions = getMockQuestions()
    return sendQuestionsResponse(res, questions, 'mock')
  }

  try {
    // Get questions from blob storage directly (server-side)
    console.log('📥 Fetching questions from Vercel Blob storage...')

    const QUIZ_QUESTIONS_BLOB = 'quiz-questions.json'
    const { blobs } = await list({ prefix: QUIZ_QUESTIONS_BLOB })

    let questions: Question[]

    if (blobs.length === 0) {
      console.log('📝 No questions found in blob storage, using mock questions')
      questions = getMockQuestions()
    } else {
      // Get the most recent version
      const questionsBlob = blobs[0]
      console.log(`📥 Fetching questions from: ${questionsBlob.url}`)

      const response = await fetch(questionsBlob.url)

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`)
      }

      questions = await response.json()

      // Validate the loaded questions
      if (!Array.isArray(questions) || questions.length === 0) {
        console.warn('⚠️ Invalid questions format in blob storage, using mock questions')
        questions = getMockQuestions()
      } else {
        console.log(`✅ Loaded ${questions.length} questions from blob storage`)
      }
    }

    return sendQuestionsResponse(res, questions, blobs.length > 0 ? 'blob' : 'mock')

  } catch (error: any) {
    console.error('❌ Error loading questions from blob storage:', error)

    // Enhanced error analysis
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('🔑 Permission denied - Check your BLOB_READ_WRITE_TOKEN')
    } else if (error.message.includes('404')) {
      console.error('🏪 Blob store not found - Create a blob store in Vercel dashboard')
    }

    console.log('📝 Using mock questions as fallback')
    const questions = getMockQuestions()
    return sendQuestionsResponse(res, questions, 'mock')
  }
}

function sendQuestionsResponse(res: NextApiResponse, questions: Question[], source: string) {
  // Check if questions exist
  if (questions.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No quiz questions available',
      data: {
        questions: [],
        totalQuestions: 0
      }
    })
  }

  // Transform questions for API response (remove correct answers for security)
  const publicQuestions = questions.map(question => ({
    id: question.id,
    question: question.question,
    answers: question.answers.map(answer => ({
      id: answer.id,
      text: answer.text
      // Note: isCorrect is intentionally excluded for security
    }))
  }))

  return res.status(200).json({
    success: true,
    message: source === 'blob'
      ? 'Questions retrieved successfully from Vercel Blob storage'
      : 'Questions retrieved successfully (mock data)',
    data: {
      questions: publicQuestions,
      totalQuestions: questions.length,
      quizSettings: {
        timeLimit: 10, // 10 minutes
        requiresAllQuestions: true,
        allowMultipleCorrect: true
      },
      storageInfo: {
        type: source === 'blob' ? 'vercel-blob' : 'mock',
        persistent: source === 'blob',
        description: source === 'blob'
          ? 'Questions are stored in Vercel Blob storage and persist across deployments'
          : 'Using mock questions for development/testing'
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      storageVersion: source === 'blob' ? 'blob-storage' : 'mock-data'
    }
  })
}