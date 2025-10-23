import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { blobStorage } from '@/lib/blob-storage'
import { Question } from '@/types/quiz'

const AdminDebugPage: NextPage = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `${timestamp}: ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        addLog('🔄 Starting to load questions...')
        setIsLoading(true)
        setError(null)

        const loadedQuestions = await blobStorage.getQuestions()
        addLog(`✅ Questions loaded: ${JSON.stringify(loadedQuestions, null, 2)}`)
        addLog(`📊 Questions count: ${loadedQuestions.length}`)

        setQuestions(loadedQuestions)
        addLog('🎯 Questions state set')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        addLog(`❌ Failed to load questions: ${errorMsg}`)
        setError(errorMsg)
      } finally {
        addLog('🏁 Loading finished, setting isLoading to false')
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [])

  return (
    <>
      <Head>
        <title>Admin Debug - FMIB Quiz</title>
      </Head>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🔍 Admin Debug Page</h1>

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {isLoading ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Questions Count:</strong> {questions.length}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Questions Data</h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(questions, null, 2)}
            </pre>
          </div>

          {/* Logs */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-400">No logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/admin'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Admin Page
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Reload Debug Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminDebugPage