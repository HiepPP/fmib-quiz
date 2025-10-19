// Quiz data types
export interface QuizAnswer {
  questionId: string
  answerId: string
}

export interface UserInfo {
  name: string
  studentNumber: string
  classNumber: string
  major: string
}

export interface QuizSession {
  userInfo: UserInfo
  answers: QuizAnswer[]
  startTime: number
  currentQuestionIndex: number
  isCompleted: boolean
}

export interface Question {
  id: string
  question: string
  answers: Array<{
    id: string
    text: string
    isCorrect: boolean
  }>
}

// Local storage keys
export const STORAGE_KEYS = {
  QUIZ_SESSION: 'fmib_quiz_session',
  QUIZ_QUESTIONS: 'fmib_quiz_questions',
  USER_ANSWERS: 'fmib_user_answers'
} as const

// In-memory cache for user answers
let userAnswersCache: QuizAnswer[] | null = null
let answersCacheTimestamp = 0
const CACHE_DURATION = 100 // 100ms cache duration

// Local storage utility functions
export const storage = {
  // Quiz session management
  saveQuizSession: (session: QuizSession): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.QUIZ_SESSION, JSON.stringify(session))
    }
  },

  getQuizSession: (): QuizSession | null => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem(STORAGE_KEYS.QUIZ_SESSION)
      return sessionData ? JSON.parse(sessionData) : null
    }
    return null
  },

  clearQuizSession: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.QUIZ_SESSION)
      localStorage.removeItem(STORAGE_KEYS.USER_ANSWERS)
      // Clear cache
      userAnswersCache = null
      answersCacheTimestamp = 0
    }
  },

  // User answers management with caching
  saveUserAnswer: (answer: QuizAnswer): void => {
    if (typeof window !== 'undefined') {
      // Update cache immediately
      if (!userAnswersCache) {
        userAnswersCache = storage.getUserAnswers()
      }
      const updatedAnswers = userAnswersCache.filter(a => a.questionId !== answer.questionId)
      updatedAnswers.push(answer)
      userAnswersCache = updatedAnswers
      answersCacheTimestamp = Date.now()

      // Save to localStorage asynchronously
      localStorage.setItem(STORAGE_KEYS.USER_ANSWERS, JSON.stringify(updatedAnswers))
    }
  },

  getUserAnswers: (): QuizAnswer[] => {
    if (typeof window !== 'undefined') {
      const now = Date.now()

      // Return cached data if still valid
      if (userAnswersCache && (now - answersCacheTimestamp) < CACHE_DURATION) {
        return userAnswersCache
      }

      // Load from localStorage and update cache
      const answersData = localStorage.getItem(STORAGE_KEYS.USER_ANSWERS)
      userAnswersCache = answersData ? JSON.parse(answersData) : []
      answersCacheTimestamp = now
      return userAnswersCache
    }
    return []
  },

  clearUserAnswers: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_ANSWERS)
      // Clear cache
      userAnswersCache = null
      answersCacheTimestamp = 0
    }
  },

  // Questions management
  saveQuestions: (questions: Question[]): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.QUIZ_QUESTIONS, JSON.stringify(questions))
    }
  },

  getQuestions: (): Question[] => {
    if (typeof window !== 'undefined') {
      const questionsData = localStorage.getItem(STORAGE_KEYS.QUIZ_QUESTIONS)
      return questionsData ? JSON.parse(questionsData) : []
    }
    return []
  },

  clearQuestions: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.QUIZ_QUESTIONS)
    }
  },

  // Comprehensive cleanup function
  clearAllQuizData: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.QUIZ_SESSION)
      localStorage.removeItem(STORAGE_KEYS.USER_ANSWERS)
      localStorage.removeItem(STORAGE_KEYS.QUIZ_QUESTIONS)
    }
  },

  // Get storage usage information
  getStorageInfo: (): { used: number, available: number, items: number } => {
    if (typeof window === 'undefined') {
      return { used: 0, available: 0, items: 0 }
    }

    let used = 0
    let items = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('fmib_quiz_')) {
        used += localStorage[key].length
        items++
      }
    }

    // Rough estimate of available space (most browsers limit to 5-10MB)
    const available = 5 * 1024 * 1024 // 5MB

    return { used, available, items }
  },

  // Cleanup expired sessions
  cleanupExpiredSessions: (): number => {
    if (typeof window === 'undefined') return 0

    let cleaned = 0
    try {
      const sessionData = localStorage.getItem(STORAGE_KEYS.QUIZ_SESSION)
      if (sessionData) {
        const session = JSON.parse(sessionData)
        if (isSessionExpired(session.startTime)) {
          localStorage.removeItem(STORAGE_KEYS.QUIZ_SESSION)
          localStorage.removeItem(STORAGE_KEYS.USER_ANSWERS)
          cleaned++
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error)
    }

    return cleaned
  }
}

// Helper function to check if session is expired (10 minutes)
export const isSessionExpired = (startTime: number): boolean => {
  const SESSION_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds
  return Date.now() - startTime > SESSION_DURATION
}

// Helper function to get remaining time
export const getRemainingTime = (startTime: number): number => {
  const SESSION_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds
  const elapsed = Date.now() - startTime
  return Math.max(0, SESSION_DURATION - elapsed)
}