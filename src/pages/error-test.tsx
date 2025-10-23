import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'

const ErrorTestPage: NextPage = () => {
  const [error, setError] = useState<string>('')
  const [envInfo, setEnvInfo] = useState<any>({})

  useEffect(() => {
    // Check environment variables
    setEnvInfo({
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
      tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20) || 'none',
      nodeEnv: process.env.NODE_ENV
    })

    // Try to import and use blob storage
    const testBlob = async () => {
      try {
        console.log('Testing blob import...')
        const { list } = await import('@vercel/blob')
        console.log('Import successful, testing list...')

        const result = await list()
        console.log('List successful:', result)

      } catch (err: any) {
        console.error('Blob test failed:', err)
        setError(err.message || String(err))
      }
    }

    testBlob()
  }, [])

  return (
    <>
      <Head>
        <title>Error Test</title>
      </Head>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🚨 Error Test</h1>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Environment Info:</h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(envInfo, null, 2)}
            </pre>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">❌ Error:</h2>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open browser DevTools (F12)</li>
              <li>Go to Console tab</li>
              <li>Look for any error messages</li>
              <li>Check if the token is being loaded</li>
              <li>Try visiting: <a href="/simple-debug" className="text-blue-600 hover:underline">/simple-debug</a></li>
            </ol>
          </div>
        </div>
      </div>
    </>
  )
}

export default ErrorTestPage