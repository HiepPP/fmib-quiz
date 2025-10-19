import Link from 'next/link'
import { useRouter } from 'next/router'

interface HeaderProps {
  title?: string
}

export default function Header({ title = 'FMIB Quiz' }: HeaderProps) {
  const router = useRouter()
  const pathname = router.pathname

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </Link>

          <nav className="flex space-x-6">
            <Link
              href="/quiz"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === '/quiz'
                  ? 'text-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Take Quiz
            </Link>
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === '/admin'
                  ? 'text-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}