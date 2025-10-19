import type { NextApiRequest, NextApiResponse } from 'next'
import { Question } from '@/types/quiz'
import { storage } from '@/lib/storage'

export default function handler(
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

  try {
    // Get questions from localStorage (in production, this would be from a database)
    const questions = storage.getQuestions()

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
      message: 'Questions retrieved successfully',
      data: {
        questions: publicQuestions,
        totalQuestions: questions.length,
        quizSettings: {
          timeLimit: 10, // 10 minutes
          requiresAllQuestions: true,
          allowMultipleCorrect: true
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })

  } catch (error) {
    console.error('Error fetching quiz questions:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve quiz questions'
    })
  }
}