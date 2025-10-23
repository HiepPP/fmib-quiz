import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import QuestionForm from '@/components/admin/QuestionForm'
import QuestionList from '@/components/admin/QuestionList'
import { Question } from '@/types/quiz'
import { blobStorage } from '@/lib/blob-storage'
import { storage } from '@/lib/storage'

type AdminView = 'list' | 'add' | 'edit'

const AdminPage: NextPage = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentView, setCurrentView] = useState<AdminView>('list')
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Load questions from blob storage on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('🔄 Starting to load questions...')
        setIsLoading(true)
        const loadedQuestions = await blobStorage.getQuestions()
        console.log('✅ Questions loaded:', loadedQuestions)
        console.log('📊 Questions count:', loadedQuestions.length)
        setQuestions(loadedQuestions)
        console.log('🎯 Questions state set')
      } catch (error) {
        console.error('❌ Failed to load questions:', error)
        setSaveError('Failed to load questions. Please try refreshing the page.')
      } finally {
        console.log('🏁 Loading finished, setting isLoading to false')
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [])

  // Save questions to blob storage whenever they change
  const saveQuestions = async (updatedQuestions: Question[]) => {
    try {
      setIsSaving(true)
      setSaveError(null)
      setQuestions(updatedQuestions)
      await blobStorage.saveQuestions(updatedQuestions)
      console.log('✅ Questions saved successfully')
    } catch (error) {
      console.error('❌ Failed to save questions:', error)
      setSaveError('Failed to save questions. Please try again.')
      // Revert to previous state on error
      setQuestions(questions)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setCurrentView('add')
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setCurrentView('edit')
  }

  const handleSaveQuestion = async (question: Question) => {
    if (currentView === 'edit' && editingQuestion) {
      // Update existing question
      await saveQuestions(questions.map(q => q.id === question.id ? question : q))
    } else {
      // Add new question
      await saveQuestions([...questions, question])
    }
    setCurrentView('list')
    setEditingQuestion(null)
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      await saveQuestions(questions.filter(q => q.id !== questionId))
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

  const handleImportQuestions = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const importedQuestions = JSON.parse(e.target?.result as string)
          if (Array.isArray(importedQuestions)) {
            await saveQuestions(importedQuestions)
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

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all questions? This action cannot be undone.')) {
      await saveQuestions([])
    }
  }

  // New blob storage specific handlers
  const handleViewStorageInfo = async () => {
    try {
      // Call debug API to get storage info
      const response = await fetch('/api/debug-blob')
      const info = await response.json()

      if (!response.ok) {
        throw new Error(info.error || 'Failed to get storage info')
      }

      const message = `
Storage Information:
• Environment: ${info.environment}
• Token Configured: ${info.hasToken ? '✅ Yes' : '❌ No'}
• Total Questions: ${info.tests.listTest?.details?.blobCount || 0} blobs found
• Storage Type: Vercel Blob Storage

Your quiz questions are stored securely in Vercel Blob storage and will persist across deployments.
Automatic backups are created when you save questions.
      `.trim()

      alert(message)
    } catch (error) {
      console.error('Failed to get storage info:', error)
      alert('❌ Failed to retrieve storage information.')
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
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportQuestions}
                  disabled={questions.length === 0 || isSaving}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Export
                </button>

                <label className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportQuestions}
                    disabled={isSaving}
                    className="hidden"
                  />
                </label>

                
                <button
                  onClick={handleViewStorageInfo}
                  className="px-4 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors"
                >
                  Storage Info
                </button>

                <button
                  onClick={handleClearAll}
                  disabled={questions.length === 0 || isSaving}
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

            {/* Storage Status */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Type</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    Vercel Blob ✨
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Persistent across deployments
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {saveError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{saveError}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSaveError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading questions from Vercel Blob...</p>
                  </div>
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