import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import confetti from "canvas-confetti";
import Layout from "@/components/layout/Layout";
import UserInfoForm from "@/components/quiz/UserInfoForm";
import QuestionDisplay from "@/components/quiz/QuestionDisplay";
import QuizTimer from "@/components/quiz/QuizTimer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import {
  AnimatedLoading,
  PageTransition,
  FadeIn,
  SlideIn,
  ScaleIn,
} from "@/components/ui/AnimatedLoading";
import { UserInfo, Question, QuizAnswer } from "@/types/quiz";
import { storage, isSessionExpired } from "@/lib/storage";
import { quizService, type QuizServiceResponse } from "@/lib/quizService";

type QuizStep = "info" | "quiz" | "results";

// Helper functions for performance feedback (temporary until QuizResults component is integrated)
const getPerformanceMessage = (percentage: number): string => {
  if (percentage >= 90) return "Hiệu suất xuất sắc! 🎉";
  if (percentage >= 80) return "Làm việc tuyệt vời! 🌟";
  if (percentage >= 70) return "Làm tốt! 👍";
  if (percentage >= 60) return "Nỗ lực tốt! 💪";
  if (percentage >= 50) return "Tiếp tục rèn luyện! 📚";
  return "Cần cải thiện! 🎯";
};

const getPerformanceAdvice = (percentage: number): string => {
  if (percentage >= 80) return "Bạn đã thành thạo tài liệu này!";
  if (percentage >= 70) return "Bạn có hiểu biết tốt về tài liệu.";
  if (percentage >= 60) return "Xem lại các phần bạn gặp khó khăn.";
  if (percentage >= 50) return "Cân nhắc dành nhiều thời gian học hơn.";
  return "Đừng bỏ cuộc! Luyện tập tạo nên sự hoàn hảo.";
};

const QuizPage: NextPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<QuizStep>("info");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<
    QuizServiceResponse["data"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(
    new Map(),
  );

  // Trigger confetti effect when score >= 60% and results are shown
  useEffect(() => {
    if (
      currentStep === "results" &&
      quizResult &&
      (quizResult.summary?.percentage || 0) >= 60
    ) {
      // Trigger confetti explosion for 10 seconds
      const defaults = { startVelocity: 15, spread: 360, ticks: 80, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function () {
        const particleCount = 25;

        // Launch confetti from random positions
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 600);

      // Stop confetti after 5 seconds
      const timeout: NodeJS.Timeout = setTimeout(() => {
        clearInterval(interval);
      }, 5000);

      // Cleanup both interval and timeout
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [currentStep, quizResult]);

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = storage.getQuizSession();
    const savedQuestions = storage.getQuestions();

    if (savedQuestions.length === 0) {
      setError(
        "Không có câu hỏi trắc nghiệm nào. Vui lòng liên hệ quản trị viên.",
      );
      setIsLoading(false);
      return;
    }

    setQuestions(savedQuestions);

    // Load existing answers into state for faster access
    const userAnswers = storage.getUserAnswers();
    const answersMap = new Map<string, string>();
    userAnswers.forEach((answer) => {
      answersMap.set(answer.questionId, answer.answerId);
    });
    setSelectedAnswers(answersMap);

    if (
      existingSession &&
      !existingSession.isCompleted &&
      !isSessionExpired(existingSession.startTime)
    ) {
      // Resume existing session
      setUserInfo(existingSession.userInfo);
      setCurrentQuestionIndex(existingSession.currentQuestionIndex);
      setSessionStartTime(existingSession.startTime);
      setCurrentStep("quiz");
    } else if (existingSession && existingSession.isCompleted) {
      // Show completed results
      setUserInfo(existingSession.userInfo);
      setCurrentStep("results");
    } else if (existingSession && isSessionExpired(existingSession.startTime)) {
      // Clear expired session
      storage.clearQuizSession();
    }

    setIsLoading(false);
  }, []);

  // Get current selected answer from local state (much faster than localStorage)
  const getCurrentSelectedAnswer = useCallback((): string | null => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length)
      return null;
    const currentQuestion = questions[currentQuestionIndex];
    return selectedAnswers.get(currentQuestion.id) || null;
  }, [questions, currentQuestionIndex, selectedAnswers]);

  // Handle quiz completion
  const handleFinishQuiz = useCallback(async () => {
    const session = storage.getQuizSession();
    if (!session || !userInfo) {
      setCurrentStep("results");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const userAnswers = storage.getUserAnswers();
      const submissionData = {
        userInfo,
        answers: userAnswers,
        questions: questions, // Include questions for grading
        startTime: session.startTime,
        endTime: Date.now(),
        timeExpired: isTimerExpired,
      };

      // Validate submission data
      const validation = quizService.validateSubmission(submissionData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // Submit to API (or fallback to simulation)
      const response = await quizService.submitQuiz(submissionData);

      if (response.success) {
        setQuizResult(response.data);
        const completedSession = { ...session, isCompleted: true };
        storage.saveQuizSession(completedSession);
        setCurrentStep("results");
      } else {
        throw new Error(response.error || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Quiz submission error:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit quiz",
      );

      // Still complete the quiz even if API fails
      const completedSession = { ...session, isCompleted: true };
      storage.saveQuizSession(completedSession);
      setCurrentStep("results");
    } finally {
      setIsSubmitting(false);
    }
  }, [userInfo, isTimerExpired, questions]);

  // Optimized answer selection with immediate local state update
  const handleAnswerSelect = useCallback(
    (answerId: string) => {
      if (questions.length === 0 || currentQuestionIndex >= questions.length)
        return;

      const currentQuestion = questions[currentQuestionIndex];

      // Update local state immediately for instant UI feedback
      setSelectedAnswers((prev) =>
        new Map(prev).set(currentQuestion.id, answerId),
      );

      // Prepare answer for localStorage
      const answer: QuizAnswer = {
        questionId: currentQuestion.id,
        answerId,
      };

      // Save to localStorage asynchronously (non-blocking)
      setTimeout(() => {
        storage.saveUserAnswer(answer);
      }, 0);
    },
    [questions, currentQuestionIndex],
  );

  // Handle next question
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // Update session
      const session = storage.getQuizSession();
      if (session) {
        const updatedSession = { ...session, currentQuestionIndex: nextIndex };
        storage.saveQuizSession(updatedSession);
      }
    } else {
      // Last question, finish quiz
      handleFinishQuiz();
    }
  }, [currentQuestionIndex, questions.length, handleFinishQuiz]);

  // Handle previous question
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);

      // Update session
      const session = storage.getQuizSession();
      if (session) {
        const updatedSession = { ...session, currentQuestionIndex: prevIndex };
        storage.saveQuizSession(updatedSession);
      }
    }
  }, [currentQuestionIndex]);

  // Handle timer expiration
  const handleTimeExpire = useCallback(() => {
    setIsTimerExpired(true);
    handleFinishQuiz();
  }, [handleFinishQuiz]);

  // Handle timer tick
  const handleTimerTick = useCallback((remainingTime: number) => {
    setTimeRemaining(remainingTime);
  }, []);

  const handleUserInfoSubmit = (submittedUserInfo: UserInfo) => {
    const startTime = Date.now();
    setSessionStartTime(startTime);
    setUserInfo(submittedUserInfo);
    setCurrentQuestionIndex(0);
    setCurrentStep("quiz");
    setTimeRemaining(600); // Reset timer to 10 minutes
  };

  const handleRestartQuiz = useCallback(() => {
    // Clear all quiz-related data from localStorage
    storage.clearQuizSession();
    storage.clearUserAnswers();

    // Reset all state variables
    setUserInfo(null);
    setCurrentQuestionIndex(0);
    setTimeRemaining(600); // Reset timer to 10 minutes
    setIsTimerExpired(false);
    setIsSubmitting(false);
    setSubmitError(null);
    setQuizResult(null);
    setSessionStartTime(null);
    setError(null);
    setSelectedAnswers(new Map()); // Clear local answers state

    // Reset to info step
    setCurrentStep("info");

    // Optional: Clear any cached quiz data if needed
    // storage.clearQuestions() // Uncomment if you want to reset questions too
  }, []);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleViewCertificate = () => {
    if (userInfo && quizResult) {
      // Store certificate data in localStorage for the certificate page to retrieve
      const certificateData = {
        userInfo,
        quizResult,
        completionTime: new Date().toISOString(),
      };
      localStorage.setItem("certificateData", JSON.stringify(certificateData));
      router.push("/certificate");
    }
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>FMIB Quiz - Đang tải</title>
        </Head>
        <Layout title="FMIB Quiz">
          <div className="flex min-h-[60vh] flex-1 items-center justify-center">
            <PageTransition>
              <Card
                variant="ghost"
                className="mx-auto max-w-md border-0 bg-transparent shadow-none"
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="relative mx-auto h-16 w-16">
                      <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/20"></div>
                      <div className="relative flex h-16 w-16 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    </div>
                  </div>
                  <AnimatedLoading
                    type="dots"
                    size="lg"
                    text="Đang tải bài trắc nghiệm..."
                    className="mb-4 text-blue-600 dark:text-blue-400"
                  />
                  <FadeIn delay={300}>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Đang chuẩn bị trải nghiệm trắc nghiệm cá nhân hóa của
                        bạn...
                      </p>
                      <div className="flex justify-center space-x-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                  </FadeIn>
                </CardContent>
              </Card>
            </PageTransition>
          </div>
        </Layout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>FMIB Quiz - Lỗi</title>
        </Head>
        <Layout title="FMIB Quiz">
          <div className="flex min-h-[60vh] flex-1 items-center justify-center">
            <PageTransition>
              <div className="mx-auto w-full max-w-md px-4">
                <SlideIn direction="up" delay={100}>
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                      <svg
                        className="h-8 w-8 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <Alert
                      variant="error"
                      title="Bài trắc nghiệm không khả dụng"
                      className="mb-6"
                    >
                      {error}
                    </Alert>
                  </div>
                </SlideIn>
                <SlideIn direction="up" delay={200}>
                  <div className="flex justify-center">
                    <Button
                      onClick={handleGoHome}
                      variant="primary"
                      size="lg"
                      className="transform transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <span className="flex items-center space-x-2">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span>Về trang chủ</span>
                      </span>
                    </Button>
                  </div>
                </SlideIn>
              </div>
            </PageTransition>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          {currentStep === "info"
            ? "FMIB Quiz - Bắt đầu"
            : currentStep === "quiz"
              ? "FMIB Quiz - Đang làm"
              : "FMIB Quiz - Kết quả"}
        </title>
        <meta name="description" content="Làm bài trắc nghiệm FMIB" />
      </Head>

      <Layout title="FMIB Quiz">
        <PageTransition>
          <div className="flex-1 py-1 sm:py-0 lg:py-4">
            <div className="container mx-auto max-w-4xl px-2 sm:px-3 lg:px-6">
              {/* Header */}
              <header
                className="mb-2 text-center sm:mb-3 lg:mb-6"
                role="banner"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="h-24 w-24 animate-pulse rounded-full border-4 border-blue-500"></div>
                  </div>
                </div>
              </header>

              {/* Step content */}
              <FadeIn delay={200}>
                {currentStep === "info" && (
                  <UserInfoForm onSubmit={handleUserInfoSubmit} />
                )}
              </FadeIn>

              <FadeIn delay={200}>
                {currentStep === "quiz" && (
                  <div>
                    <main
                      className="mx-auto max-w-full px-1 sm:max-w-3xl lg:max-w-4xl"
                      role="main"
                    >
                      {/* Quiz Progress Indicator */}
                      <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Câu hỏi {currentQuestionIndex + 1} /{" "}
                              {questions.length}
                            </span>
                          </div>
                          <div
                            className={`flex items-center space-x-2 rounded-full px-3 py-1.5 font-mono text-sm font-semibold transition-all duration-300 ${
                              timeRemaining <= 60
                                ? "animate-pulse bg-red-100 text-red-700 ring-2 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800"
                                : timeRemaining <= 180
                                  ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:ring-yellow-800"
                                  : "bg-green-100 text-green-700 ring-2 ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-800"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-center ${
                                timeRemaining <= 60 ? "animate-bounce" : ""
                              }`}
                            >
                              <svg
                                className={`h-4 w-4 ${
                                  timeRemaining <= 60 ? "animate-spin" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <span className="tracking-wider tabular-nums">
                              {Math.floor(timeRemaining / 60)}:
                              {String(timeRemaining % 60).padStart(2, "0")}
                            </span>
                            {timeRemaining <= 60 && (
                              <span className="ml-1 animate-pulse text-xs font-bold">
                                !
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <div
                            className="h-1 bg-blue-500 transition-all duration-300 ease-out"
                            style={{
                              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Simple Timer (hidden but functional to keep timeRemaining updated) */}
                      {sessionStartTime && (
                        <div className="hidden">
                          <QuizTimer
                            startTime={sessionStartTime}
                            onTimeExpire={handleTimeExpire}
                            onTick={handleTimerTick}
                          />
                        </div>
                      )}
                      {/* Question Display */}
                      {questions.length > 0 &&
                        currentQuestionIndex < questions.length && (
                          <SlideIn direction="up" delay={200}>
                            <QuestionDisplay
                              question={questions[currentQuestionIndex]}
                              questions={questions}
                              questionNumber={currentQuestionIndex + 1}
                              totalQuestions={questions.length}
                              selectedAnswer={getCurrentSelectedAnswer()}
                              onAnswerSelect={handleAnswerSelect}
                              onNext={handleNext}
                              onPrevious={handlePrevious}
                              canGoNext={true}
                              canGoPrevious={currentQuestionIndex > 0}
                              isLastQuestion={
                                currentQuestionIndex === questions.length - 1
                              }
                              timeRemaining={timeRemaining}
                            />
                          </SlideIn>
                        )}
                      {/* Submitting Overlay */}
                      {isSubmitting && (
                        <div
                          className="bg-opacity-50 animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black p-4 backdrop-blur-sm"
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="submitting-title"
                          aria-describedby="submitting-description"
                        >
                          <ScaleIn>
                            <Card
                              variant="elevated"
                              className="mx-4 w-full max-w-sm shadow-2xl"
                            >
                              <CardContent className="p-6 text-center">
                                <h2
                                  id="submitting-title"
                                  className="mb-2 text-lg font-semibold text-gray-900 dark:text-white"
                                >
                                  {isTimerExpired
                                    ? "Hết giờ! Đang nộp bài..."
                                    : "Đang nộp bài..."}
                                </h2>
                                <AnimatedLoading
                                  type="spinner"
                                  size="lg"
                                  className="my-4"
                                />
                                <p
                                  id="submitting-description"
                                  className="text-sm text-gray-600 dark:text-gray-400"
                                >
                                  Vui lòng không đóng cửa sổ này
                                </p>
                              </CardContent>
                            </Card>
                          </ScaleIn>
                        </div>
                      )}
                      {/* Submit Error Alert */}
                      {submitError && (
                        <div className="mx-auto mt-3 max-w-md">
                          <SlideIn direction="up">
                            <Alert variant="error" title="Lỗi nộp bài">
                              <div className="space-y-1">
                                <p className="text-sm">{submitError}</p>
                                <p className="text-xs opacity-80">
                                  Bài trắc nghiệm của bạn đã được lưu cục bộ.
                                  Bạn có thể thử lại hoặc liên hệ hỗ trợ.
                                </p>
                              </div>
                            </Alert>
                          </SlideIn>
                        </div>
                      )}
                      {/* End Quiz Button */}
                      {!isSubmitting && (
                        <div className="mt-3 text-center">
                          <Button
                            onClick={handleRestartQuiz}
                            variant="ghost"
                            size="sm"
                            className="transform text-red-600 transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:text-red-800 active:scale-95 dark:text-red-400 dark:hover:bg-red-900/10 dark:hover:text-red-300"
                          >
                            <span className="flex items-center space-x-2">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>Kết thúc bài trắc nghiệm sớm</span>
                            </span>
                          </Button>
                        </div>
                      )}
                    </main>
                  </div>
                )}
              </FadeIn>

              <FadeIn delay={300}>
                {currentStep === "results" && (
                  <div className="mx-auto max-w-2xl">
                    <SlideIn direction="up" delay={100}>
                      <Card variant="elevated" className="overflow-hidden">
                        <div className="relative h-1 overflow-hidden bg-blue-500">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                        </div>
                        <CardContent className="p-2 sm:p-3 lg:p-6">
                          <div className="py-4 text-center sm:py-6 lg:py-12">
                            {/* Timer Expired Warning */}
                            {isTimerExpired && (
                              <div className="mb-2 rounded-lg border border-yellow-200 bg-yellow-50 p-1.5 sm:mb-4 sm:p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <svg
                                    className="h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                  </svg>
                                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                                    Bài trắc nghiệm được tự động nộp do hết giờ
                                  </p>
                                </div>
                              </div>
                            )}

                            <svg
                              className={`h-10 w-10 sm:h-14 sm:w-14 lg:h-16 lg:w-16 ${
                                isTimerExpired
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-green-600 dark:text-green-400"
                              } mx-auto mb-2 sm:mb-4`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {isTimerExpired ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              )}
                            </svg>
                            <h2 className="mb-1 text-lg font-bold text-gray-900 sm:mb-2 sm:text-xl lg:text-2xl dark:text-white">
                              {submitError
                                ? "Đã hoàn thành bài trắc nghiệm (có lỗi)"
                                : isTimerExpired
                                  ? "Hết giờ!"
                                  : "Đã hoàn thành bài trắc nghiệm!"}
                            </h2>
                            <p className="mb-3 text-xs text-gray-600 sm:mb-6 sm:text-sm dark:text-gray-400">
                              {submitError
                                ? "Bài trắc nghiệm của bạn đã hoàn thành nhưng có lỗi khi nộp lên máy chủ."
                                : isTimerExpired
                                  ? "Bài trắc nghiệm của bạn đã được tự động nộp khi hết giờ."
                                  : "Bài trắc nghiệm của bạn đã được nộp thành công!"}
                            </p>

                            {/* Quiz Results */}
                            {quizResult && (
                              <div className="mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl sm:mb-6 sm:p-4 lg:p-6 dark:border dark:border-gray-700/50 dark:from-gray-900/50 dark:via-blue-900/30 dark:to-purple-900/30">
                                <div className="relative">
                                  {/* Animated background elements */}
                                  <div className="absolute -top-4 -left-4 h-8 w-8 animate-pulse rounded-full bg-blue-400/20 blur-xl"></div>
                                  <div className="animation-delay-1000 absolute -right-4 -bottom-4 h-8 w-8 animate-pulse rounded-full bg-purple-400/20 blur-xl"></div>
                                  <div className="animation-delay-500 absolute top-1/2 -left-2 h-4 w-4 animate-ping rounded-full bg-indigo-400/30"></div>

                                  <h3 className="relative mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-sm font-bold text-transparent sm:mb-4 sm:text-base lg:text-lg">
                                    ✨ Kết quả bài trắc nghiệm ✨
                                  </h3>

                                  {/* Score Display */}
                                  <div className="mb-4 text-center sm:mb-6">
                                    <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                                      <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-50 blur-md"></div>
                                      <div className="absolute inset-0 animate-ping rounded-full border-2 border-white/30"></div>
                                      <div className="relative">
                                        <p className="animate-fade-in text-base font-bold text-white drop-shadow-lg sm:text-xl lg:text-2xl">
                                          {quizResult.summary?.percentage || 0}%
                                        </p>
                                        <p className="text-xs font-medium text-white/90 drop-shadow">
                                          Điểm số
                                        </p>
                                      </div>
                                    </div>
                                    {/* Score indicator badges */}
                                    <div className="mt-2 flex justify-center space-x-1">
                                      {(quizResult.summary?.percentage || 0) >=
                                        90 && (
                                        <span className="animate-bounce rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900 shadow-md">
                                          🏆 Xuất sắc
                                        </span>
                                      )}
                                      {(quizResult.summary?.percentage || 0) >=
                                        70 &&
                                        (quizResult.summary?.percentage || 0) <
                                          90 && (
                                          <span className="animate-bounce rounded-full bg-blue-400 px-2 py-1 text-xs font-bold text-blue-900 shadow-md">
                                            🌟 Tốt
                                          </span>
                                        )}
                                      {(quizResult.summary?.percentage || 0) >=
                                        50 &&
                                        (quizResult.summary?.percentage || 0) <
                                          70 && (
                                          <span className="animate-bounce rounded-full bg-green-400 px-2 py-1 text-xs font-bold text-green-900 shadow-md">
                                            👍 Khá
                                          </span>
                                        )}
                                      {(quizResult.summary?.percentage || 0) <
                                        50 && (
                                        <span className="animate-bounce rounded-full bg-orange-400 px-2 py-1 text-xs font-bold text-orange-900 shadow-md">
                                          📚 Cố gắng
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Statistics Grid */}
                                  <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4 sm:gap-3">
                                    <div className="group relative transform overflow-hidden rounded-xl bg-white/80 p-3 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:bg-gray-800/80 dark:shadow-gray-900/50">
                                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                                      <div className="relative">
                                        <div className="mb-1 flex justify-center"></div>
                                        <p className="text-center text-lg font-bold text-gray-900 dark:text-white">
                                          {quizResult.summary?.totalQuestions ||
                                            0}
                                        </p>
                                        <p className="text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                          Tổng câu
                                        </p>
                                      </div>
                                    </div>
                                    <div className="group relative transform overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-3 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:from-green-900/30 dark:to-green-800/30 dark:shadow-green-900/50">
                                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                                      <div className="relative">
                                        <div className="mb-1 flex justify-center"></div>
                                        <p className="text-center text-lg font-bold text-green-700 dark:text-green-300">
                                          {quizResult.summary?.correctAnswers ||
                                            0}
                                        </p>
                                        <p className="text-center text-xs font-medium text-green-600 dark:text-green-400">
                                          Đúng ✓
                                        </p>
                                      </div>
                                    </div>
                                    <div className="group relative transform overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-3 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:from-red-900/30 dark:to-red-800/30 dark:shadow-red-900/50">
                                      <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                                      <div className="relative">
                                        <div className="mb-1 flex justify-center"></div>
                                        <p className="text-center text-lg font-bold text-red-700 dark:text-red-300">
                                          {quizResult.summary
                                            ?.incorrectAnswers || 0}
                                        </p>
                                        <p className="text-center text-xs font-medium text-red-600 dark:text-red-400">
                                          Sai ✗
                                        </p>
                                      </div>
                                    </div>
                                    <div className="group relative transform overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-3 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:from-purple-900/30 dark:to-purple-800/30 dark:shadow-purple-900/50">
                                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                                      <div className="relative">
                                        <div className="mb-1 flex justify-center"></div>
                                        <p className="text-center text-lg font-bold text-purple-700 dark:text-purple-300">
                                          {Math.floor(
                                            (quizResult.summary?.timeSpent ||
                                              0) / 60,
                                          )}
                                          :
                                          {String(
                                            (quizResult.summary?.timeSpent ||
                                              0) % 60,
                                          ).padStart(2, "0")}
                                        </p>
                                        <p className="text-center text-xs font-medium text-purple-600 dark:text-purple-400">
                                          Thời gian ⏱
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Performance Message */}
                                  <div className="relative overflow-hidden rounded-xl border border-white/20 bg-gradient-to-r from-white/60 to-white/40 p-3 text-center shadow-lg backdrop-blur-sm transition-all duration-500 hover:shadow-xl sm:p-4 lg:p-5 dark:border-gray-700/50 dark:from-gray-800/60 dark:to-gray-900/40">
                                    <div className="animate-gradient-shift absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10"></div>
                                    <div className="relative">
                                      <p className="mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-sm font-bold text-transparent sm:mb-2 sm:text-base lg:text-lg">
                                        {getPerformanceMessage(
                                          quizResult.summary?.percentage || 0,
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-600 italic dark:text-gray-400">
                                        &ldquo;
                                        {getPerformanceAdvice(
                                          quizResult.summary?.percentage || 0,
                                        )}
                                        &rdquo;
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {userInfo && (
                              <div className="mb-3 rounded-lg bg-gray-50 p-1.5 text-left sm:mb-6 sm:p-3 lg:mb-8 lg:p-4 dark:bg-gray-700">
                                <h3 className="mb-1 text-xs font-medium text-gray-900 sm:mb-2 sm:text-sm dark:text-white">
                                  Thông tin bài trắc nghiệm:
                                </h3>
                                <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                                  <p>
                                    <strong>Họ và tên:</strong> {userInfo.name}
                                  </p>
                                  <p>
                                    <strong>MSSV:</strong>{" "}
                                    {userInfo.studentNumber}
                                  </p>
                                  <p>
                                    <strong>Lớp:</strong> {userInfo.classNumber}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Certificate Button Section */}
                            {quizResult &&
                              (quizResult.summary?.percentage || 0) >= 60 && (
                                <div className="mb-4 sm:mb-8">
                                  <div className="mx-auto max-w-full sm:max-w-xs">
                                    {/* Certificate button optimized for mobile */}
                                    <div className="group relative">
                                      <div className="absolute -inset-0.5 rounded-lg bg-yellow-400 opacity-75 blur transition duration-300 group-hover:opacity-100 group-hover:blur-sm"></div>
                                      <button
                                        onClick={handleViewCertificate}
                                        className="relative w-full transform rounded-lg bg-yellow-500 px-3 py-2.5 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:shadow-xl focus:ring-4 focus:ring-yellow-300/50 focus:outline-none active:scale-100 sm:px-4 sm:py-3 lg:px-8 lg:py-4"
                                      >
                                        <span className="flex items-center justify-center space-x-1.5 sm:space-x-2 lg:space-x-3">
                                          <svg
                                            className="h-4 w-4 flex-shrink-0 animate-pulse sm:h-5 sm:w-6 lg:h-8 lg:w-8"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                            />
                                          </svg>
                                          <span className="text-xs sm:text-sm lg:text-lg">
                                            Certificate
                                          </span>
                                        </span>
                                        {/* Badge indicator */}
                                        <div className="absolute -top-1 -right-1 animate-bounce rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-md sm:-top-1.5 sm:-right-1.5 sm:px-2 sm:py-1">
                                          🏆
                                        </div>
                                      </button>
                                    </div>

                                    {/* Congratulations subtitle */}
                                    <div className="mt-3 text-center">
                                      <p className="animate-fade-in text-sm font-medium text-gray-700 dark:text-gray-300">
                                        🎉 Chúc mừng! Bạn đã nhận được chứng
                                        nhận của mình!
                                      </p>
                                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                        Chia sẻ thành tích của bạn với người
                                        khác
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {/* Secondary actions */}
                            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                              <button
                                onClick={handleRestartQuiz}
                                className="group relative w-full transform rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-lg active:scale-100 sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
                              >
                                <span className="flex items-center justify-center space-x-2">
                                  <svg
                                    className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                  </svg>
                                  <span>Làm lại bài trắc nghiệm</span>
                                </span>
                              </button>
                              <button
                                onClick={handleGoHome}
                                className="group relative w-full transform rounded-lg bg-gray-600 px-4 py-2.5 text-xs font-medium text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-gray-700 hover:shadow-lg active:scale-100 sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
                              >
                                <span className="flex items-center justify-center space-x-2">
                                  <svg
                                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                  </svg>
                                  <span>Về trang chủ</span>
                                </span>
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SlideIn>
                  </div>
                )}
              </FadeIn>
            </div>
          </div>
        </PageTransition>
      </Layout>
    </>
  );
};

export default QuizPage;
