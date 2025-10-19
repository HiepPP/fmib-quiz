import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
  title?: string
  showHeader?: boolean
  showFooter?: boolean
}

export default function Layout({
  children,
  title,
  showHeader = true,
  showFooter = true
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {showHeader && <Header title={title} />}

      <main className="flex-1">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  )
}