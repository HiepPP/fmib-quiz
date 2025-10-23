import { useState, useEffect, memo } from "react";
import { Question } from "@/types/quiz";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

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
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  canGoPrevious,
  isLastQuestion,
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
      setError("Vui lòng chọn một câu trả lời trước khi tiếp tục");
      return;
    }
    onNext();
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
      {/* Question Card */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-10 sm:w-10 dark:bg-blue-900">
              <span className="text-xs font-bold text-blue-800 sm:text-sm dark:text-blue-200">
                {questionNumber}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="pr-2 text-lg leading-relaxed font-semibold text-gray-900 sm:text-xl lg:text-2xl dark:text-white">
                {question.question}
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm dark:text-gray-400">
                Chọn một câu trả lời bên dưới
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Answer Options */}
          <div className="mb-8 space-y-4 sm:mb-10">
            {question.answers.map((answer, index) => {
              const isSelected = selectedAnswer === answer.id;
              const letter = String.fromCharCode(65 + index); // A, B, C, D

              return (
                <div
                  key={answer.id}
                  className={`group relative transform cursor-pointer transition-all duration-300 ${
                    isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
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
                      className={`relative rounded-2xl border-2 p-4 backdrop-blur-sm transition-all duration-300 sm:p-6 ${
                        isSelected
                          ? "border-blue-500 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 shadow-lg dark:from-blue-900/30 dark:to-indigo-900/30"
                          : "border-gray-200/50 bg-white/60 hover:border-blue-300/50 hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-indigo-50/20 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/60 dark:hover:border-blue-700/50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10"
                      }`}
                    >
                      <div className="flex items-center space-x-4 sm:space-x-6">
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 text-lg font-bold transition-all duration-300 ${
                            isSelected
                              ? "scale-110 transform border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                              : "border-gray-300 bg-white text-gray-500 group-hover:border-blue-400 group-hover:text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:group-hover:border-blue-600 dark:group-hover:text-blue-400"
                          }`}
                        >
                          {letter}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            id={`answer-${answer.id}`}
                            className={`text-base leading-relaxed break-words transition-colors duration-200 sm:text-lg ${
                              isSelected
                                ? "font-semibold text-gray-900 dark:text-white"
                                : "text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"
                            }`}
                          >
                            {answer.text}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-60 blur-md dark:from-blue-700 dark:to-indigo-700"></div>
                              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                                <svg
                                  className="h-5 w-5 text-white"
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
          <div className="mt-8 flex items-center justify-between gap-3 sm:gap-6">
            <button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className={`group flex items-center space-x-3 rounded-xl px-6 py-3 font-semibold transition-all duration-200 ${
                canGoPrevious
                  ? "transform bg-gray-100 text-gray-700 hover:scale-105 hover:bg-gray-200 hover:shadow-md dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  : "cursor-not-allowed bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600"
              }`}
              aria-label="Go to previous question"
            >
              <svg
                className="h-5 w-5 transform transition-transform duration-200 group-hover:-translate-x-1"
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

            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className={`group flex items-center space-x-3 rounded-xl px-8 py-4 font-bold text-white transition-all duration-300 ${
                selectedAnswer
                  ? isLastQuestion
                    ? "transform bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.02] hover:from-green-600 hover:to-emerald-700 hover:shadow-lg"
                    : "transform bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
                  : "cursor-not-allowed bg-gray-300 dark:bg-gray-700"
              }`}
              aria-label={
                isLastQuestion ? "Finish quiz" : "Go to next question"
              }
            >
              <span>{isLastQuestion ? "Hoàn thành" : "Tiếp theo"}</span>
              <svg
                className="h-5 w-5 transform transition-transform duration-200 group-hover:translate-x-1"
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
    </div>
  );
});

export default QuestionDisplay;
