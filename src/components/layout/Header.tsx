import Link from "next/link";
import { useRouter } from "next/router";

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "FMIB Quiz" }: HeaderProps) {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <header className="bg-blue-600 dark:bg-blue-800 shadow-sm border-b border-blue-700 dark:border-blue-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center flex-1 justify-center md:justify-start">
            <img
              src="/fmib-banner.png"
              alt="FMIB Quiz"
              className="h-10 w-auto object-contain md:h-12 lg:h-14 max-w-full"
            />
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link
              href="/quiz"
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === "/quiz"
                  ? "text-white"
                  : "text-blue-100 dark:text-blue-200"
              }`}
            >
              Làm bài trắc nghiệm
            </Link>
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === "/admin"
                  ? "text-white"
                  : "text-blue-100 dark:text-blue-200"
              }`}
            >
              Quản trị
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
