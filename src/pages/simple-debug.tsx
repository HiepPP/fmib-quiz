import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'

const SimpleDebugPage: NextPage = () => {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const testStep1 = () => {
    addLog('🔍 Step 1: Checking environment variables...')

    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN
    const tokenLength = process.env.BLOB_READ_WRITE_TOKEN?.length || 0

    addLog(`   Token present: ${hasToken ? '✅' : '❌'}`)
    addLog(`   Token length: ${tokenLength}`)

    if (hasToken && tokenLength > 20) {
      addLog('✅ Step 1 passed')
      return true
    } else {
      addLog('❌ Step 1 failed - token missing or too short')
      return false
    }
  }

  const testStep2 = async () => {
    addLog('🔍 Step 2: Testing @vercel/blob import...')

    try {
      const { list } = await import('@vercel/blob')
      addLog('✅ @vercel/blob imported successfully')
      return true
    } catch (error) {
      addLog(`❌ Import failed: ${error}`)
      return false
    }
  }

  const testStep3 = async () => {
    addLog('🔍 Step 3: Testing blob list operation...')

    try {
      const { list } = await import('@vercel/blob')
      const result = await list()
      addLog(`✅ List operation succeeded - found ${result.blobs.length} blobs`)
      return true
    } catch (error) {
      addLog(`❌ List operation failed: ${error}`)
      return false
    }
  }

  const runAllTests = async () => {
    setLogs([])
    addLog('🚀 Starting blob storage tests...')

    const step1 = testStep1()
    if (!step1) return

    const step2 = await testStep2()
    if (!step2) return

    await testStep3()
    addLog('🏁 Tests completed')
  }

  return (
    <>
      <Head>
        <title>Simple Blob Debug</title>
      </Head>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🔍 Simple Blob Debug</h1>

          <button
            onClick={runAllTests}
            className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Run Tests
          </button>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Logs:</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-400">Click "Run Tests" to start debugging...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Manual Checks:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Open browser DevTools (F12) and check Console tab</li>
              <li>Check Network tab for failed requests</li>
              <li>Verify your .env.local file has the correct token</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default SimpleDebugPage