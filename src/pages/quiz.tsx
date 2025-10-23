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
  if (percentage >= 90) return "Outstanding Performance! 🎉";
  if (percentage >= 80) return "Excellent Work! 🌟";
  if (percentage >= 70) return "Good Job! 👍";
  if (percentage >= 60) return "Nice Effort! 💪";
  if (percentage >= 50) return "Keep Practicing! 📚";
  return "Room for Improvement! 🎯";
};

const getPerformanceAdvice = (percentage: number): string => {
  if (percentage >= 80) return "You have mastered this material!";
  if (percentage >= 70) return "You have a good understanding of the material.";
  if (percentage >= 60) return "Review the areas where you struggled.";
  if (percentage >= 50) return "Consider spending more time studying.";
  return "Don't give up! Practice makes perfect.";
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
      // Trigger continuous confetti explosion (slower, more gentle)
      const defaults = { startVelocity: 15, spread: 360, ticks: 80, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function () {
        // Continuous confetti - no end condition
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

      // Store interval ID for cleanup (optional, but good practice)
      return () => clearInterval(interval);
    }
  }, [currentStep, quizResult]);

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = storage.getQuizSession();
    const savedQuestions = storage.getQuestions();

    if (savedQuestions.length === 0) {
      setError(
        "No quiz questions available. Please contact the administrator.",
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
          <title>FMIB Quiz - Loading</title>
        </Head>
        <Layout title="FMIB Quiz">
          <div className="flex min-h-[60vh] flex-1 items-center justify-center">
            <PageTransition>
              <Card variant="ghost" className="mx-auto max-w-md">
                <CardContent className="p-8 text-center">
                  <AnimatedLoading
                    type="dots"
                    size="lg"
                    text="Loading quiz..."
                    className="mb-4"
                  />
                  <FadeIn delay={300}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Preparing your quiz experience...
                    </p>
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
          <title>FMIB Quiz - Error</title>
        </Head>
        <Layout title="FMIB Quiz">
          <div className="flex min-h-[60vh] flex-1 items-center justify-center">
            <PageTransition>
              <div className="mx-auto w-full max-w-md px-4">
                <SlideIn direction="up" delay={100}>
                  <Alert
                    variant="error"
                    title="Quiz Not Available"
                    className="mb-6"
                  >
                    {error}
                  </Alert>
                </SlideIn>
                <SlideIn direction="up" delay={200}>
                  <div className="flex justify-center">
                    <Button onClick={handleGoHome} variant="primary" size="lg">
                      Go Home
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
            ? "FMIB Quiz - Start"
            : currentStep === "quiz"
              ? "FMIB Quiz - In Progress"
              : "FMIB Quiz - Results"}
        </title>
        <meta name="description" content="Take the FMIB quiz" />
      </Head>

      <Layout title="FMIB Quiz">
        <PageTransition>
          <div className="flex-1 py-1 sm:py-0 lg:py-4">
            <div className="container mx-auto max-w-4xl px-2 sm:px-3 lg:px-6">
              {/* Header */}
              <header
                className="mb-2 text-center sm:mb-3 lg:mb-6"
                role="banner"
              ></header>

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
                                    ? "Time expired! Submitting quiz..."
                                    : "Submitting quiz..."}
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
                                  Please don&apos;t close this window
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
                            <Alert variant="error" title="Submission Error">
                              <div className="space-y-1">
                                <p className="text-sm">{submitError}</p>
                                <p className="text-xs opacity-80">
                                  Your quiz has been saved locally. You can try
                                  again or contact support.
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
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            End Quiz Early
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
                      <Card variant="elevated">
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
                                    Quiz automatically submitted due to time
                                    limit
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
                                ? "Quiz Completed (with errors)"
                                : isTimerExpired
                                  ? "Time Expired!"
                                  : "Quiz Completed!"}
                            </h2>
                            <p className="mb-3 text-xs text-gray-600 sm:mb-6 sm:text-sm dark:text-gray-400">
                              {submitError
                                ? "Your quiz was completed but there was an error submitting to the server."
                                : isTimerExpired
                                  ? "Your quiz was automatically submitted when the time ran out."
                                  : "Your quiz has been successfully submitted!"}
                            </p>

                            {/* Quiz Results */}
                            {quizResult && (
                              <div className="mb-3 rounded-lg bg-gray-50 p-2 sm:mb-6 sm:p-4 lg:p-6 dark:bg-gray-700">
                                <h3 className="mb-1.5 text-sm font-semibold text-gray-900 sm:mb-4 sm:text-base lg:text-lg dark:text-white">
                                  Quiz Results
                                </h3>

                                {/* Score Display */}
                                <div className="mb-3 text-center sm:mb-6">
                                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border-4 border-blue-200 bg-blue-100 sm:h-20 sm:w-20 lg:h-24 lg:w-24 dark:border-blue-800 dark:bg-blue-900/30">
                                    <div>
                                      <p className="text-base font-bold text-blue-800 sm:text-xl lg:text-2xl dark:text-blue-200">
                                        {quizResult.summary?.percentage || 0}%
                                      </p>
                                      <p className="text-xs text-blue-600 dark:text-blue-400">
                                        Score
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Statistics Grid */}
                                <div className="mb-3 grid grid-cols-4 gap-1.5 sm:mb-6 sm:gap-4">
                                  <div className="text-center">
                                    <p className="text-base font-bold text-gray-900 sm:text-xl lg:text-2xl dark:text-white">
                                      {quizResult.summary?.totalQuestions || 0}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      Qs
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-base font-bold text-green-600 sm:text-xl lg:text-2xl dark:text-green-400">
                                      {quizResult.summary?.correctAnswers || 0}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      Correct
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-base font-bold text-red-600 sm:text-xl lg:text-2xl dark:text-red-400">
                                      {quizResult.summary?.incorrectAnswers ||
                                        0}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      Wrong
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-base font-bold text-gray-900 sm:text-xl lg:text-2xl dark:text-white">
                                      {Math.floor(
                                        (quizResult.summary?.timeSpent || 0) /
                                          60,
                                      )}
                                      :
                                      {String(
                                        (quizResult.summary?.timeSpent || 0) %
                                          60,
                                      ).padStart(2, "0")}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      Time
                                    </p>
                                  </div>
                                </div>

                                {/* Performance Message */}
                                <div className="rounded-lg border border-gray-200 bg-white p-1.5 text-center sm:p-3 lg:p-4 dark:border-gray-600 dark:bg-gray-800">
                                  <p className="mb-1 text-xs font-medium text-gray-900 sm:mb-2 sm:text-sm lg:text-lg dark:text-white">
                                    {getPerformanceMessage(
                                      quizResult.summary?.percentage || 0,
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {getPerformanceAdvice(
                                      quizResult.summary?.percentage || 0,
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}

                            {userInfo && (
                              <div className="mb-3 rounded-lg bg-gray-50 p-1.5 text-left sm:mb-6 sm:p-3 lg:mb-8 lg:p-4 dark:bg-gray-700">
                                <h3 className="mb-1 text-xs font-medium text-gray-900 sm:mb-2 sm:text-sm dark:text-white">
                                  Quiz Information:
                                </h3>
                                <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                                  <p>
                                    <strong>Name:</strong> {userInfo.name}
                                  </p>
                                  <p>
                                    <strong>Student #:</strong>{" "}
                                    {userInfo.studentNumber}
                                  </p>
                                  <p>
                                    <strong>Class #:</strong>{" "}
                                    {userInfo.classNumber}
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
                                    <button
                                      onClick={handleViewCertificate}
                                      className="relative w-full transform rounded-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-3 py-2.5 font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 hover:shadow-xl focus:ring-2 focus:ring-yellow-300/50 focus:outline-none active:scale-100 sm:px-4 sm:py-3 lg:px-8 lg:py-4"
                                    >
                                      <span className="flex items-center justify-center space-x-1.5 sm:space-x-2 lg:space-x-3">
                                        <svg
                                          className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-6 lg:h-8 lg:w-8"
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
                                      <div className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-md sm:-top-1.5 sm:-right-1.5 sm:px-2 sm:py-1">
                                        🏆
                                      </div>
                                    </button>

                                    {/* Congratulations subtitle */}
                                    <p className="mt-1.5 text-center text-xs text-gray-600 sm:mt-4 dark:text-gray-400">
                                      🎉 You earned your certificate!
                                    </p>
                                  </div>
                                </div>
                              )}

                            {/* Secondary actions */}
                            <div className="flex flex-col justify-center gap-2 sm:flex-row sm:gap-4">
                              <button
                                onClick={handleRestartQuiz}
                                className="w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 sm:w-auto sm:px-6 sm:text-sm"
                              >
                                Take Quiz Again
                              </button>
                              <button
                                onClick={handleGoHome}
                                className="w-full rounded-md bg-gray-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-700 active:bg-gray-800 sm:w-auto sm:px-6 sm:text-sm"
                              >
                                Go Home
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
