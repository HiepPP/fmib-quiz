import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>FMIB Quiz - Home</title>
        <meta name="description" content="Welcome to the FMIB Quiz application" />
      </Head>

      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to FMIB Quiz
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Test your knowledge with our interactive quiz platform. Complete the quiz in 10 minutes and see your results instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quiz"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Quiz
              </Link>

              <Link
                href="/admin"
                className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Admin Panel
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Quick Setup
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your information and start the quiz in seconds
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  10 Minute Timer
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete all questions before time runs out
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Instant Results
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get your score immediately after submission
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default HomePage
