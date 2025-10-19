import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import QuestionForm from '@/components/admin/QuestionForm'
import QuestionList from '@/components/admin/QuestionList'
import { Question } from '@/types/quiz'
import { storage } from '@/lib/storage'

type AdminView = 'list' | 'add' | 'edit'

const AdminPage: NextPage = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentView, setCurrentView] = useState<AdminView>('list')
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load questions from localStorage on mount
  useEffect(() => {
    const savedQuestions = storage.getQuestions()
    setQuestions(savedQuestions)
    setIsLoading(false)
  }, [])

  // Save questions to localStorage whenever they change
  const saveQuestions = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions)
    storage.saveQuestions(updatedQuestions)
  }

  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setCurrentView('add')
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setCurrentView('edit')
  }

  const handleSaveQuestion = (question: Question) => {
    if (currentView === 'edit' && editingQuestion) {
      // Update existing question
      saveQuestions(questions.map(q => q.id === question.id ? question : q))
    } else {
      // Add new question
      saveQuestions([...questions, question])
    }
    setCurrentView('list')
    setEditingQuestion(null)
  }

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      saveQuestions(questions.filter(q => q.id !== questionId))
    }
  }

  const handleCancel = () => {
    setCurrentView('list')
    setEditingQuestion(null)
  }

  const handleExportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `quiz-questions-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportQuestions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedQuestions = JSON.parse(e.target?.result as string)
          if (Array.isArray(importedQuestions)) {
            saveQuestions(importedQuestions)
            alert('Questions imported successfully!')
          } else {
            alert('Invalid file format. Please upload a valid questions file.')
          }
        } catch (error) {
          alert('Error importing questions. Please check the file format.')
        }
      }
      reader.readAsText(file)
    }
    // Reset the input
    event.target.value = ''
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all questions? This action cannot be undone.')) {
      saveQuestions([])
    }
  }

  return (
    <>
      <Head>
        <title>Quiz Admin - FMIB Quiz</title>
        <meta name="description" content="Admin interface for managing quiz questions" />
      </Head>

      <Layout title="Quiz Admin">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Quiz Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your quiz questions and answers
              </p>
            </div>

            {currentView === 'list' && (
              <div className="flex space-x-3">
                <button
                  onClick={handleExportQuestions}
                  disabled={questions.length === 0}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Export
                </button>

                <label className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors cursor-pointer">
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportQuestions}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleClearAll}
                  disabled={questions.length === 0}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>

                <button
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Question
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Answers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questions.reduce((sum, q) => sum + q.answers.length, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ready for Quiz</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {questions.length > 0 ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
              ) : currentView === 'list' ? (
                <QuestionList
                  questions={questions}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                    {currentView === 'edit' ? 'Edit Question' : 'Add New Question'}
                  </h2>
                  <QuestionForm
                    question={editingQuestion || undefined}
                    onSave={handleSaveQuestion}
                    onCancel={handleCancel}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default AdminPage