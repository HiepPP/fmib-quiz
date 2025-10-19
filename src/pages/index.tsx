import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'

const HomePage: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to quiz page
    router.push('/quiz')
  }, [router])
  return (
    <>
      <Head>
        <title>FMIB Quiz - Redirecting...</title>
        <meta name="description" content="Redirecting to quiz" />
      </Head>

      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to quiz...
            </p>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default HomePage
