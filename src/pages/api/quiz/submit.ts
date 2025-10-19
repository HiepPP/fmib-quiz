import type { NextApiRequest, NextApiResponse } from 'next'
import { Question, QuizAnswer, QuizResult } from '@/types/quiz'
import { storage } from '@/lib/storage'

interface SubmitRequest {
  userInfo: {
    name: string
    studentNumber: string
    classNumber: string
  }
  answers: QuizAnswer[]
  startTime: number
  endTime: number
  timeExpired?: boolean
}

interface SubmitResponse {
  success: boolean
  message: string
  data?: {
    result: QuizResult
    summary: {
      totalQuestions: number
      correctAnswers: number
      incorrectAnswers: number
      score: number
      percentage: number
      timeSpent: number
      completedAt: string
    }
  }
  error?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubmitResponse>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST requests are supported'
    })
  }

  try {
    const { userInfo, answers, startTime, endTime, timeExpired = false }: SubmitRequest = req.body

    // Validate required fields
    if (!userInfo || !answers || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'userInfo, answers, startTime, and endTime are required'
      })
    }

    // Validate user information
    if (!userInfo.name || !userInfo.studentNumber || !userInfo.classNumber) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user information',
        error: 'All user fields (name, studentNumber, classNumber) are required'
      })
    }

    // Validate time range
    const timeSpent = endTime - startTime
    const maxAllowedTime = 10 * 60 * 1000 // 10 minutes in milliseconds

    if (timeSpent < 0 || timeSpent > maxAllowedTime) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time range',
        error: 'Time spent must be within the allowed quiz duration'
      })
    }

    // Get questions from storage
    const questions = storage.getQuestions()

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No quiz questions available for grading',
        error: 'Quiz questions not found'
      })
    }

    // Verify answers and calculate results
    const result = verifyAnswers(questions, answers)

    // Calculate summary statistics
    const totalQuestions = questions.length
    const correctAnswers = result.answers.filter(a => a.isCorrect).length
    const incorrectAnswers = totalQuestions - correctAnswers
    const score = correctAnswers
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)

    const summary = {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      score,
      percentage,
      timeSpent: Math.round(timeSpent / 1000), // Convert to seconds
      completedAt: new Date(endTime).toISOString()
    }

    // Create quiz result
    const quizResult: QuizResult = {
      score,
      totalQuestions,
      correctAnswers,
      timeSpent: Math.round(timeSpent / 1000),
      answers: result.answers
    }

    // Store result (in production, this would go to a database)
    const submissionData = {
      userInfo,
      result: quizResult,
      summary,
      submittedAt: new Date().toISOString(),
      timeExpired
    }

    // Here you would save to database
    console.log('Quiz submission:', submissionData)

    return res.status(200).json({
      success: true,
      message: timeExpired
        ? 'Quiz submitted automatically due to time limit'
        : 'Quiz submitted successfully',
      data: {
        result: quizResult,
        summary
      }
    })

  } catch (error) {
    console.error('Error submitting quiz:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to submit quiz'
    })
  }
}

function verifyAnswers(questions: Question[], userAnswers: QuizAnswer[]): {
  answers: Array<{
    questionId: string
    question: string
    selectedAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }>
} {
  const results = []

  for (const question of questions) {
    const userAnswer = userAnswers.find(answer => answer.questionId === question.id)

    // Get the correct answer(s) for this question
    const correctAnswers = question.answers.filter(answer => answer.isCorrect)
    const correctAnswerIds = correctAnswers.map(answer => answer.id)

    // Default values for unanswered questions
    let selectedAnswerText = 'Not answered'
    let isCorrect = false

    if (userAnswer) {
      const selectedAnswerObj = question.answers.find(answer => answer.id === userAnswer.answerId)
      selectedAnswerText = selectedAnswerObj?.text || 'Invalid answer'
      isCorrect = correctAnswerIds.includes(userAnswer.answerId)
    }

    results.push({
      questionId: question.id,
      question: question.question,
      selectedAnswer: selectedAnswerText,
      correctAnswer: correctAnswers.map(answer => answer.text).join(', '),
      isCorrect
    })
  }

  return { answers: results }
}