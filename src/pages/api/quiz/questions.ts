import type { NextApiRequest, NextApiResponse } from 'next'
import { Question } from '@/types/quiz'
import { storage } from '@/lib/storage'

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
    // Get questions from localStorage or use mock questions for development
    let questions: Question[] = []

    // Check if we're on server-side (no localStorage available)
    if (typeof window === 'undefined') {
      console.log('Server-side detected, using mock questions')
      questions = getMockQuestions()
    } else {
      try {
        questions = storage.getQuestions()
        // If no questions in localStorage, use mock questions
        if (questions.length === 0) {
          console.log('No questions in localStorage, using mock questions')
          questions = getMockQuestions()
        }
      } catch (error) {
        console.log('Error accessing localStorage, using mock questions:', error)
        questions = getMockQuestions()
      }
    }

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