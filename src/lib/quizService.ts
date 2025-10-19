import { quizApi, handleApiError, ApiError } from './api'
import { Question, QuizAnswer, QuizResult, UserInfo } from '@/types/quiz'

export interface QuizSubmission {
  userInfo: UserInfo
  answers: QuizAnswer[]
  questions: Question[]
  startTime: number
  endTime: number
  timeExpired?: boolean
}

export interface QuizServiceResponse {
  success: boolean
  message: string
  data?: {
    questions?: Question[]
    result?: QuizResult
    summary?: {
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

class QuizService {
  /**
   * Fetch quiz questions from the API
   */
  async fetchQuestions(): Promise<QuizServiceResponse> {
    try {
      const data = await quizApi.getQuestions()

      return {
        success: true,
        message: 'Questions fetched successfully',
        data: {
          questions: data.questions,
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      return {
        success: false,
        message: 'Failed to fetch questions',
        error: handleApiError(error)
      }
    }
  }

  /**
   * Submit quiz answers to the API
   */
  async submitQuiz(submission: QuizSubmission): Promise<QuizServiceResponse> {
    try {
      const data = await quizApi.submitQuiz(submission)

      return {
        success: true,
        message: submission.timeExpired
          ? 'Quiz submitted automatically due to time limit'
          : 'Quiz submitted successfully',
        data: {
          result: data.result,
          summary: data.summary
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      return {
        success: false,
        message: 'Failed to submit quiz',
        error: handleApiError(error)
      }
    }
  }

  /**
   * Simulate quiz submission (fallback for when API is unavailable)
   * This can be used for offline mode or during development
   */
  async simulateSubmission(submission: QuizSubmission): Promise<QuizServiceResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Use actual questions for grading if available
      let totalQuestions = submission.answers.length
      let correctAnswers = 0
      const answers = []

      if (submission.questions && submission.questions.length > 0) {
        totalQuestions = submission.questions.length

        for (const question of submission.questions) {
          const userAnswer = submission.answers.find(a => a.questionId === question.id)
          const correctAnswerIds = question.answers.filter(a => a.isCorrect).map(a => a.id)

          let selectedAnswerText = 'Not answered'
          let isCorrect = false

          if (userAnswer) {
            const selectedAnswerObj = question.answers.find(a => a.id === userAnswer.answerId)
            selectedAnswerText = selectedAnswerObj?.text || 'Invalid answer'
            isCorrect = correctAnswerIds.includes(userAnswer.answerId)
          }

          if (isCorrect) correctAnswers++

          answers.push({
            questionId: question.id,
            question: question.question,
            selectedAnswer: selectedAnswerText,
            correctAnswer: question.answers.filter(a => a.isCorrect).map(a => a.text).join(', '),
            isCorrect
          })
        }
      } else {
        // Fallback to random calculation if no questions provided
        correctAnswers = Math.floor(Math.random() * totalQuestions)

        for (let i = 0; i < totalQuestions; i++) {
          const isCorrect = i < correctAnswers
          answers.push({
            questionId: submission.answers[i]?.questionId || `q${i}`,
            question: `Question ${i + 1}`,
            selectedAnswer: 'Selected answer',
            correctAnswer: 'Correct answer',
            isCorrect
          })
        }
      }

      const score = correctAnswers
      const percentage = Math.round((correctAnswers / totalQuestions) * 100)
      const timeSpent = Math.round((submission.endTime - submission.startTime) / 1000)

      const mockResult: QuizResult = {
        score,
        totalQuestions,
        correctAnswers,
        timeSpent,
        answers
      }

      const mockSummary = {
        totalQuestions,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        score,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString()
      }

      return {
        success: true,
        message: submission.timeExpired
          ? 'Quiz completed (time expired - simulation mode)'
          : 'Quiz completed successfully (simulation mode)',
        data: {
          result: mockResult,
          summary: mockSummary
        }
      }
    } catch (error) {
      console.error('Error in simulation:', error)
      return {
        success: false,
        message: 'Failed to complete quiz simulation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Validate quiz submission data
   */
  validateSubmission(submission: QuizSubmission): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validate user info
    if (!submission.userInfo.name?.trim()) {
      errors.push('Name is required')
    }
    if (!submission.userInfo.studentNumber?.trim()) {
      errors.push('Student number is required')
    }
    if (!submission.userInfo.classNumber?.trim()) {
      errors.push('Class number is required')
    }

    // Validate answers
    if (!submission.answers || submission.answers.length === 0) {
      errors.push('At least one answer is required')
    }

    // Validate time range
    const timeSpent = submission.endTime - submission.startTime
    if (timeSpent <= 0) {
      errors.push('End time must be after start time')
    }
    if (timeSpent > 10 * 60 * 1000) { // 10 minutes
      errors.push('Quiz duration exceeds time limit')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if API is available
   */
  async checkApiAvailability(): Promise<boolean> {
    try {
      // Try to fetch questions (without error handling for this specific call)
      await fetch('/api/quiz/questions')
      return true
    } catch (error) {
      console.error('API not available:', error)
      return false
    }
  }

  /**
   * Get quiz settings
   */
  async getQuizSettings(): Promise<{
    timeLimit: number
    requiresAllQuestions: boolean
    allowMultipleCorrect: boolean
  } | null> {
    try {
      const data = await quizApi.getQuestions()
      return data.quizSettings
    } catch (error) {
      console.error('Error fetching quiz settings:', error)
      // Return default settings
      return {
        timeLimit: 10, // 10 minutes
        requiresAllQuestions: true,
        allowMultipleCorrect: true
      }
    }
  }
}

// Export singleton instance
export const quizService = new QuizService()

// Export types for external use
export type { QuizSubmission }