import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { QuizCertificate } from "@/components/quiz/QuizCertificate";
import { UserInfo } from "@/types/quiz";
import { type QuizServiceResponse } from "@/lib/quizService";

interface CertificateData {
  userInfo: UserInfo;
  quizResult: QuizServiceResponse['data'];
  completionTime: string;
}

const CertificatePage: React.FC = () => {
  const router = useRouter();
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve certificate data from localStorage
    try {
      const storedData = localStorage.getItem('certificateData');

      if (storedData) {
        const data = JSON.parse(storedData);

        // Validate that the certificate data has the required structure
        if (data && data.userInfo && data.quizResult && data.completionTime) {
          setCertificateData(data);
        } else {
          console.warn('Invalid certificate data structure');
          router.push('/quiz');
        }
      } else {
        // No certificate data found, redirect to quiz
        router.push('/quiz');
      }
    } catch (error) {
      console.error('Error retrieving certificate data:', error);
      router.push('/quiz');
    }

    setIsLoading(false);
  }, [router]);

  const handleRestart = () => {
    router.push('/quiz');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Đang tải chứng nhận...</p>
        </div>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy chứng nhận</h1>
          <p className="text-gray-600 mb-6">Vui lòng hoàn thành bài trắc nghiệm trước để xem chứng nhận của bạn.</p>
          <button
            onClick={() => router.push('/quiz')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Đi đến bài trắc nghiệm
          </button>
        </div>
      </div>
    );
  }

  const { userInfo, quizResult, completionTime } = certificateData;

  // Format time spent with better null safety
  const timeSpentValue = quizResult?.summary?.timeSpent ?? 0;
  const timeSpentMinutes = Math.floor(timeSpentValue / 60);
  const timeSpentSeconds = timeSpentValue % 60;
  const timeSpent = `${timeSpentMinutes} phút ${timeSpentSeconds} giây`;

  const certificateProps = {
    userName: userInfo?.name || 'Không xác định',
    studentNumber: userInfo?.studentNumber || 'Không xác định',
    classNumber: userInfo?.classNumber || 'Không xác định',
    major: userInfo?.major || 'Không xác định',
    score: quizResult?.summary?.correctAnswers ?? 0,
    totalQuestions: quizResult?.summary?.totalQuestions ?? 0,
    percentage: quizResult?.summary?.percentage ?? 0,
    timeSpent: timeSpent,
    completedAt: completionTime || new Date().toISOString(),
    onRestart: handleRestart,
    onGoHome: handleGoHome,
  };

  return (
    <div>
      <QuizCertificate {...certificateProps} />
    </div>
  );
};

export default CertificatePage;
