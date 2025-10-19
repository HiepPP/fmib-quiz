import React from 'react';
import { QuizCertificate } from '@/components/quiz/QuizCertificate';

const CertificatePage: React.FC = () => {
  // Fixed date for server-side rendering consistency
  const fixedDate = new Date('2024-10-19T10:00:00Z');

  // Mock data for demonstration
  const mockData = {
    userName: "Nguyễn Văn A",
    studentNumber: "HE123456",
    classNumber: "Marketing 01",
    major: "Marketing - Kinh doanh quốc tế",
    score: 45,
    totalQuestions: 50,
    percentage: 90,
    timeSpent: "25 phút",
    completedAt: fixedDate.toISOString(),
    onRestart: () => {
      console.log('Restart quiz');
    },
    onGoHome: () => {
      window.location.href = '/';
    },
  };

  return (
    <div>
      <QuizCertificate {...mockData} />
    </div>
  );
};

export default CertificatePage;