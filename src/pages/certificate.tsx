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
    const storedData = localStorage.getItem('certificateData');

    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setCertificateData(data);
      } catch (error) {
        console.error('Error parsing certificate data:', error);
        // If data is invalid, redirect to quiz
        router.push('/quiz');
      }
    } else {
      // No certificate data found, redirect to quiz
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Certificate Not Found</h1>
          <p className="mt-2 text-gray-600">Please complete the quiz first.</p>
          <button
            onClick={() => router.push('/quiz')}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Quiz
          </button>
        </div>
      </div>
    );
  }

  const { userInfo, quizResult, completionTime } = certificateData;

  // Format time spent
  const timeSpentMinutes = Math.floor((quizResult?.summary?.timeSpent || 0) / 60);
  const timeSpentSeconds = (quizResult?.summary?.timeSpent || 0) % 60;
  const timeSpent = `${timeSpentMinutes} phút ${timeSpentSeconds} giây`;

  const certificateProps = {
    userName: userInfo.name,
    studentNumber: userInfo.studentNumber,
    classNumber: userInfo.classNumber,
    major: "Marketing - Kinh doanh quốc tế", // This could be added to userInfo if needed
    score: quizResult?.summary?.correctAnswers || 0,
    totalQuestions: quizResult?.summary?.totalQuestions || 0,
    percentage: quizResult?.summary?.percentage || 0,
    timeSpent: timeSpent,
    completedAt: completionTime,
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
