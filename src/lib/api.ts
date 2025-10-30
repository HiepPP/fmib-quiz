import { Question, QuizAnswer, QuizResult, UserInfo } from "@/types/quiz";
import { getAuthToken, clearAuth } from "@/lib/storage";

// API base configuration
const API_BASE = "/api";

// API response interfaces
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    timestamp: string;
    version: string;
  };
}

interface QuestionsResponse {
  questions: Question[];
  totalQuestions: number;
  quizSettings: {
    timeLimit: number;
    requiresAllQuestions: boolean;
    allowMultipleCorrect: boolean;
  };
}

interface SubmitRequest {
  userInfo: UserInfo;
  answers: QuizAnswer[];
  questions: Question[];
  startTime: number;
  endTime: number;
  timeExpired?: boolean;
}

interface SubmitResponse {
  result: QuizResult;
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    score: number;
    percentage: number;
    timeSpent: number;
    completedAt: string;
  };
}

// API error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Utility function for making API requests
async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false,
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  // Add authentication header if required
  if (requireAuth) {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError("Authentication required", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    // Handle authentication errors
    if (response.status === 401) {
      clearAuth(); // Clear invalid authentication
      throw new ApiError(
        "Authentication expired or invalid. Please log in again.",
        401,
        data,
      );
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data,
      );
    }

    if (!data.success) {
      throw new ApiError(
        data.error || data.message || "API request failed",
        response.status,
        data,
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors or JSON parsing errors
    throw new ApiError("Network error occurred", 0, { originalError: error });
  }
}

// API functions
export const quizApi = {
  /**
   * Fetch quiz questions
   */
  async getQuestions(): Promise<QuestionsResponse> {
    return apiRequest<QuestionsResponse>("/quiz/questions", {
      method: "GET",
    });
  },

  /**
   * Submit quiz answers
   */
  async submitQuiz(submissionData: SubmitRequest): Promise<SubmitResponse> {
    return apiRequest<SubmitResponse>("/quiz/submit", {
      method: "POST",
      body: JSON.stringify(submissionData),
    });
  },
};

// Utility functions for error handling
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    // Client error (4xx)
    if (error.status >= 400 && error.status < 500) {
      switch (error.status) {
        case 400:
          return "Invalid request. Please check your input and try again.";
        case 404:
          return "The requested resource was not found.";
        case 405:
          return "Method not allowed. Please refresh and try again.";
        default:
          return error.data?.error || error.message || "Invalid request";
      }
    }

    // Server error (5xx)
    if (error.status >= 500) {
      return "Server error occurred. Please try again later.";
    }

    // Network error
    if (error.status === 0) {
      return "Network error. Please check your connection and try again.";
    }

    return error.message || "An unexpected error occurred";
  }

  return "An unexpected error occurred";
};

// Type guards for API responses
export const isQuestionsResponse = (
  data: unknown,
): data is QuestionsResponse => {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.questions) &&
    typeof data.totalQuestions === "number" &&
    typeof data.quizSettings === "object"
  );
};

export const isSubmitResponse = (data: unknown): data is SubmitResponse => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.result === "object" &&
    typeof data.summary === "object"
  );
};

// Generic API client for components
export const apiClient = {
  /**
   * Make a GET request
   */
  async get<T = unknown>(endpoint: string, requireAuth: boolean = false): Promise<T> {
    return apiRequest<T>(endpoint, { method: "GET" }, requireAuth);
  },

  /**
   * Make a POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown, requireAuth: boolean = false): Promise<T> {
    return apiRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  },

  /**
   * Make a PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown, requireAuth: boolean = false): Promise<T> {
    return apiRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  },

  /**
   * Make a DELETE request
   */
  async delete<T = unknown>(endpoint: string, requireAuth: boolean = false): Promise<T> {
    return apiRequest<T>(endpoint, { method: "DELETE" }, requireAuth);
  },

  /**
   * Make a raw POST request for auth endpoints that don't follow standard API response format
   */
  async postRaw<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData,
      );
    }

    return response.json() as Promise<T>;
  },
};
