// Re-export types from storage for convenience
export type {
  QuizAnswer,
  UserInfo,
  QuizSession,
  Question
} from '@/lib/storage'

// Additional quiz-related types
export interface QuizResult {
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number // in seconds
  answers: Array<{
    questionId: string
    question: string
    selectedAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }>
}

export interface QuizState {
  currentQuestionIndex: number
  answers: QuizAnswer[]
  timeRemaining: number
  isCompleted: boolean
  userInfo: UserInfo | null
}