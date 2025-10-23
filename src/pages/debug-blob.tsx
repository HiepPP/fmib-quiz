import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'

interface EnvSummary {
  success: boolean
  nodeEnv: string
  blobTokenPresent: boolean
  totalEnvVars: number
  sampleNonSensitive: string[]
  timestamp: string
  tests: {
    tokenValidation: any
    listTest: any
    putTest: any
    cleanupTest?: any
  }
  recommendations: string[]
  error?: string
  details?: string
}

const DebugPage: NextPage = () => {
  const [envSummary, setEnvSummary] = useState<EnvSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDebugTest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug-blob')
      const data = await response.json()

      if (!response.ok) {
        console.error('Debug API error:', data)
        setEnvSummary({
          success: false,
          nodeEnv: 'unknown',
          blobTokenPresent: false,
          totalEnvVars: 0,
          sampleNonSensitive: [],
          timestamp: new Date().toISOString(),
          tests: {},
          recommendations: data.error ? [data.error] : [],
          error: data.error || 'API Error'
        })
      } else {
        setEnvSummary(data)
      }
    } catch (error) {
      console.error('Debug test failed:', error)
      setEnvSummary({
        success: false,
        nodeEnv: 'unknown',
        blobTokenPresent: false,
        totalEnvVars: 0,
        sampleNonSensitive: [],
        timestamp: new Date().toISOString(),
        tests: {},
        recommendations: ['Failed to connect to debug API', String(error)],
        error: 'Network error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Blob Storage Debug - FMIB Quiz</title>
        <meta name="description" content="Debug Vercel Blob storage configuration" />
      </Head>

      <Layout title="Blob Storage Debug">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🔍 Vercel Blob Storage Debug
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Debug and troubleshoot your Vercel Blob storage configuration
              </p>
            </div>

            {/* Environment Status Summary */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  🔍 Server-side environment variable debugging via API
                </span>
                {envSummary && (
                  <span className={`text-sm font-medium ${
                    envSummary.blobTokenPresent ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {envSummary.blobTokenPresent ? '✅ Token Present' : '❌ Token Missing'}
                  </span>
                )}
              </div>
            </div>

            {/* Run Debug Button */}
            <div className="mb-8">
              <button
                onClick={runDebugTest}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Running Debug Tests...' : '🔍 Check Environment Variables'}
              </button>
            </div>

            {/* Debug Results */}
            {envSummary && (
              <div className="space-y-6">
                {/* Environment Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    📊 Environment Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Environment:</span>
                      <p className="text-lg font-mono text-gray-900 dark:text-white">{envSummary.nodeEnv}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Timestamp:</span>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">{envSummary.timestamp}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">BLOB Token Present:</span>
                      <p className="text-lg font-mono text-gray-900 dark:text-white">
                        {envSummary.blobTokenPresent ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Env Vars:</span>
                      <p className="text-lg font-mono text-gray-900 dark:text-white">{envSummary.totalEnvVars}</p>
                    </div>
                    {envSummary.sampleNonSensitive.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sample Non-Sensitive Vars:</span>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                          {envSummary.sampleNonSensitive.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Test Results */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    🧪 Test Results
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(envSummary.tests).map(([testName, result]) => (
                      <div key={testName} className="border-l-4 pl-4 border-gray-200 dark:border-gray-600">
                        <div className="flex items-center mb-2">
                          <span className={`text-lg font-medium ${
                            result.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {result.success ? '✅' : '❌'} {testName}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{result.message}</p>
                        {result.error && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Error: {result.error}
                          </p>
                        )}
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer">
                              Technical Details
                            </summary>
                            <pre className="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {envSummary.recommendations.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                      💡 Recommendations
                    </h2>
                    <div className="space-y-2">
                      {envSummary.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-blue-600 dark:text-blue-400 mr-2 mt-1">
                            {index + 1}.
                          </span>
                          <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Configuration Status */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    ⚙️ Configuration Status
                  </h2>
                  <div className={`p-4 rounded-lg ${
                    envSummary.blobTokenPresent
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`font-medium ${
                      envSummary.blobTokenPresent
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}>
                      {envSummary.blobTokenPresent
                        ? '✅ BLOB_READ_WRITE_TOKEN is properly configured!'
                        : '❌ BLOB_READ_WRITE_TOKEN is missing or empty. Check Vercel dashboard settings.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Testing Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                🛠️ Manual Testing Steps
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Check your Vercel dashboard → Storage → Blob stores</li>
                <li>Ensure you have a blob store created</li>
                <li>Copy the BLOB_READ_WRITE_TOKEN</li>
                <li>Add it to your environment variables</li>
                <li>Run the debug test above</li>
                <li>Try creating a test question in the admin panel</li>
              </ol>
            </div>

            {/* Environment Variables Info */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                📝 Environment Variables
              </h3>
              <div className="space-y-1 text-blue-700 dark:text-blue-300">
                <p><strong>Development:</strong> Add to .env.local file</p>
                <p><strong>Production:</strong> Set in Vercel dashboard → Settings → Environment Variables</p>
                <p><strong>Variable Name:</strong> BLOB_READ_WRITE_TOKEN</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default DebugPage