import { useState, useEffect, memo } from "react";
import { Question } from "@/types/quiz";
import { storage } from "@/lib/storage";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Progress } from "@/components/ui/Progress";

interface QuestionDisplayProps {
  question: Question;
  questions: Question[];
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  timeRemaining: number;
}

const QuestionDisplay = memo(function QuestionDisplay({
  question,
  questions,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  timeRemaining,
}: QuestionDisplayProps) {
  const [error, setError] = useState<string | null>(null);

  // Clear error when answer is selected
  useEffect(() => {
    if (selectedAnswer) {
      setError(null);
    }
  }, [selectedAnswer]);

  const handleNext = () => {
    if (!selectedAnswer) {
      setError("Please select an answer before continuing");
      return;
    }
    onNext();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimeColor = (): string => {
    if (timeRemaining <= 60) return "text-red-600 dark:text-red-400";
    if (timeRemaining <= 180) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
      {/* Timer and Progress */}
      <div className="space-y-4">
        {/* Timer */}
        <div
          className={`flex items-center justify-center ${getTimeColor()}`}
          role="timer"
          aria-live="polite"
          aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
        >
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 sm:px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-mono font-semibold text-base sm:text-lg">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <Card variant="outline">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Progress
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Question {questionNumber} of {totalQuestions}
              </span>
            </div>
            <Progress
              value={questionNumber}
              max={totalQuestions}
              size="sm"
              color="blue"
              showLabel={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Question Card */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-800 dark:text-blue-200 font-bold text-xs sm:text-sm">
                {questionNumber}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed pr-2">
                {question.question}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                Select one answer below
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Answer Options */}
          <div className="space-y-4 mb-8 sm:mb-10">
            {question.answers.map((answer, index) => {
              const isSelected = selectedAnswer === answer.id;
              const letter = String.fromCharCode(65 + index); // A, B, C, D

              return (
                <div
                  key={answer.id}
                  className={`group relative cursor-pointer transition-all duration-300 transform ${
                    isSelected
                      ? "scale-[1.02]"
                      : "hover:scale-[1.01]"
                  }`}
                >
                  <label className="block cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={answer.id}
                      checked={isSelected}
                      onChange={() => onAnswerSelect(answer.id)}
                      className="sr-only"
                      aria-describedby={`answer-${answer.id}`}
                      aria-pressed={isSelected}
                    />
                    <div
                      className={`relative p-4 sm:p-6 border-2 rounded-2xl transition-all duration-300 backdrop-blur-sm ${
                        isSelected
                          ? "border-blue-500 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg"
                          : "border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 hover:border-blue-300/50 dark:hover:border-blue-700/50 hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-indigo-50/20 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center space-x-4 sm:space-x-6">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 font-bold text-lg ${
                            isSelected
                              ? "border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-110"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:border-blue-400 dark:group-hover:border-blue-600 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          }`}
                        >
                          {letter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            id={`answer-${answer.id}`}
                            className={`text-base sm:text-lg leading-relaxed break-words transition-colors duration-200 ${
                              isSelected
                                ? "text-gray-900 dark:text-white font-semibold"
                                : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                            }`}
                          >
                            {answer.text}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-indigo-300 dark:from-blue-700 dark:to-indigo-700 rounded-full blur-md opacity-60"></div>
                              <div className="relative w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8">
            <button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className={`group order-2 sm:order-1 flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                canGoPrevious
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md transform hover:scale-105"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              }`}
              aria-label="Go to previous question"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Câu trước</span>
            </button>

            <div
              className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 order-1 sm:order-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full"
              role="note"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Cần chọn đáp án</span>
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className={`group order-3 flex items-center space-x-3 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 ${
                selectedAnswer
                  ? isLastQuestion
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg transform hover:scale-[1.02]"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-[1.02]"
                  : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
              }`}
              aria-label={
                isLastQuestion ? "Finish quiz" : "Go to next question"
              }
            >
              <span>{isLastQuestion ? "Hoàn thành" : "Tiếp theo"}</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d={isLastQuestion ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"}
                />
              </svg>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation (Quick Jump) */}
      {/* {totalQuestions > 1 && (
        <Card variant="outline">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Quick Navigation:</p>
            <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => {
              const isCurrent = num === questionNumber
              const isAnswered = storage.getUserAnswers().some(answer =>
                questions[num - 1] && answer.questionId === questions[num - 1].id
              )

              return (
                <button
                  key={num}
                  disabled={isCurrent}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white cursor-default'
                      : isAnswered
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={`Go to question ${num}${isAnswered ? ' (answered)' : ''}`}
                  aria-label={`Question ${num}${isAnswered ? ' - answered' : ''}${isCurrent ? ' - current question' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {num}
                </button>
              )
            })}
          </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
});

export default QuestionDisplay;
