import { Question } from '@/types/quiz'

interface QuestionListProps {
  questions: Question[]
  onEdit: (question: Question) => void
  onDelete: (questionId: string) => void
}

export default function QuestionList({ questions, onEdit, onDelete }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No questions added yet.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Start by adding your first question to create the quiz.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((question, questionIndex) => (
        <div
          key={question.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium">
                  {questionIndex + 1}
                </span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {question.question}
                </h3>
              </div>

              <div className="ml-11 space-y-2">
                {question.answers.map((answer, index) => (
                  <div
                    key={answer.id}
                    className={`flex items-center space-x-3 p-2 rounded-md ${
                      answer.isCorrect
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className={`text-sm ${
                      answer.isCorrect
                        ? 'text-green-800 dark:text-green-200 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {answer.text}
                      {answer.isCorrect && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                          Correct
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onEdit(question)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                title="Edit question"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(question.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="Delete question"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}