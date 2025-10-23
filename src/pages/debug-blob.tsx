import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { debugBlobStorage, quickHealthCheck, DebugInfo } from '@/lib/blob-debug'

const DebugPage: NextPage = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [healthStatus, setHealthStatus] = useState<{ healthy: boolean; message: string } | null>(null)

  useEffect(() => {
    // Run quick health check on page load
    quickHealthCheck().then(setHealthStatus)
  }, [])

  const runDebugTest = async () => {
    setIsLoading(true)
    try {
      const info = await debugBlobStorage()
      setDebugInfo(info)
    } catch (error) {
      console.error('Debug test failed:', error)
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

            {/* Quick Health Status */}
            {healthStatus && (
              <div className={`mb-6 p-4 rounded-lg border ${
                healthStatus.healthy
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  <span className="text-lg font-medium">{healthStatus.message}</span>
                </div>
              </div>
            )}

            {/* Run Debug Button */}
            <div className="mb-8">
              <button
                onClick={runDebugTest}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Running Debug Tests...' : '🔍 Run Comprehensive Debug Test'}
              </button>
            </div>

            {/* Debug Results */}
            {debugInfo && (
              <div className="space-y-6">
                {/* Environment Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    📊 Environment Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Environment:</span>
                      <p className="text-lg font-mono text-gray-900 dark:text-white">{debugInfo.environment}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Timestamp:</span>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">{debugInfo.timestamp}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Token Present:</span>
                      <p className="text-lg font-mono text-gray-900 dark:text-white">{debugInfo.hasToken ? '✅ Yes' : '❌ No'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Token Length:</span>
                      <p className="text-lg font-mono text-gray-900 dark:text-white">{debugInfo.tokenLength || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    🧪 Test Results
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(debugInfo.tests).map(([testName, result]) => (
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
                {debugInfo.recommendations.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                      💡 Recommendations
                    </h2>
                    <div className="space-y-2">
                      {debugInfo.recommendations.map((recommendation, index) => (
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
                    debugInfo.configuration.isConfigured
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <p className={`font-medium ${
                      debugInfo.configuration.isConfigured
                        ? 'text-green-800'
                        : 'text-yellow-800'
                    }`}>
                      {debugInfo.configuration.message}
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