import { useState } from 'react'
import { Question } from '@/types/quiz'

interface QuestionFormProps {
  question?: Question
  onSave: (question: Question) => void
  onCancel: () => void
}

export default function QuestionForm({ question, onSave, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    question: question?.question || '',
    answers: question?.answers || [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false }
    ]
  })

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, question: e.target.value })
  }

  const handleAnswerChange = (answerId: string, field: 'text' | 'isCorrect', value: string | boolean) => {
    setFormData({
      ...formData,
      answers: formData.answers.map(answer =>
        answer.id === answerId
          ? { ...answer, [field]: value }
          : field === 'isCorrect' && value === true
            ? { ...answer, isCorrect: false }
            : answer
      )
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.question.trim()) {
      alert('Please enter a question')
      return
    }

    const validAnswers = formData.answers.filter(answer => answer.text.trim())
    if (validAnswers.length < 2) {
      alert('Please provide at least 2 answers')
      return
    }

    const hasCorrectAnswer = validAnswers.some(answer => answer.isCorrect)
    if (!hasCorrectAnswer) {
      alert('Please mark at least one answer as correct')
      return
    }

    const newQuestion: Question = {
      id: question?.id || Date.now().toString(),
      question: formData.question.trim(),
      answers: validAnswers
    }

    onSave(newQuestion)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Question *
        </label>
        <textarea
          id="question"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          value={formData.question}
          onChange={handleQuestionChange}
          placeholder="Enter your question here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Answers *
        </label>
        <div className="space-y-3">
          {formData.answers.map((answer, index) => (
            <div key={answer.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
                {String.fromCharCode(65 + index)}.
              </span>

              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={answer.text}
                onChange={(e) => handleAnswerChange(answer.id, 'text', e.target.value)}
                placeholder={`Answer ${index + 1}`}
              />

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={answer.isCorrect}
                  onChange={() => handleAnswerChange(answer.id, 'isCorrect', true)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Correct
                </span>
              </label>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Mark at least one answer as correct. You can have multiple correct answers.
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          {question ? 'Update Question' : 'Add Question'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}