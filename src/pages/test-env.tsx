import type { NextPage } from 'next'
import Head from 'next/head'

const TestEnvPage: NextPage = () => {
  // This will show us the environment variables in the browser
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  const tokenLength = process.env.BLOB_READ_WRITE_TOKEN?.length || 0;
  const tokenPrefix = process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 15) || 'none';

  return (
    <>
      <Head>
        <title>Environment Test</title>
      </Head>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Environment Variables Test</h1>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Server-Side Environment Variables</h2>

            <div className="space-y-2">
              <div>
                <span className="font-medium">BLOB_READ_WRITE_TOKEN Present:</span>
                <span className={`ml-2 ${hasToken ? 'text-green-600' : 'text-red-600'}`}>
                  {hasToken ? '✅ Yes' : '❌ No'}
                </span>
              </div>

              <div>
                <span className="font-medium">Token Length:</span>
                <span className="ml-2">{tokenLength}</span>
              </div>

              <div>
                <span className="font-medium">Token Prefix:</span>
                <span className="ml-2 font-mono text-sm">{tokenPrefix}...</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Next Steps:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>If token is present: Visit <a href="/debug-blob" className="text-blue-600 hover:underline">/debug-blob</a></li>
              <li>If token is missing: Check your .env.local file</li>
              <li>Make sure you restarted the server after updating .env.local</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default TestEnvPage