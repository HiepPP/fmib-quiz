import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, Share2, Home, RotateCcw } from 'lucide-react';

interface QuizCertificateProps {
  userName: string;
  studentNumber: string;
  classNumber: string;
  major: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: string;
  completedAt: string;
  onRestart: () => void;
  onGoHome: () => void;
}

export const QuizCertificate: React.FC<QuizCertificateProps> = ({
  userName,
  studentNumber,
  classNumber,
  major,
  score,
  totalQuestions,
  percentage,
  timeSpent,
  completedAt,
  onRestart,
  onGoHome,
}) => {
  const [certificateId, setCertificateId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCertificateId(`FMIB-${Date.now().toString(36).toUpperCase()}`);
  }, []);

  const handleDownload = () => {
    // TODO: Implement PDF download functionality
    window.print();
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'FMIB Quiz Certificate',
        text: `Tôi đã hoàn thành bài trắc nghiệm FMIB với điểm số ${score}/${totalQuestions} (${percentage.toFixed(1)}%)!`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-6 print:hidden">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Quiz
          </Button>
          <Button
            onClick={onGoHome}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>

        {/* Certificate Container */}
        <div
          className="certificate-container bg-white rounded-lg shadow-2xl overflow-hidden"
          id="certificateContainer"
          style={{ display: 'block' }}
        >
          {/* Certificate Header */}
          <div className="certificate-header bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 text-center">
            <div className="certificate-logos flex justify-center mb-4">
              <img
                src="https://z-cdn-media.chatglm.cn/files/dc880d76-db2c-46e3-944e-d1f27b898212_logo.png?auth_key=1792307401-0469ab1e8edb440097c892d6cc0c3d1f-0-7b3a9be7520d0a833a4b252a3c0369b5"
                alt="Logo"
                className="certificate-logo h-20 w-auto"
              />
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center py-6">
            <div className="certificate-title text-4xl font-bold text-gray-800 mb-2">CHỨNG NHẬN HOÀN THÀNH</div>
            <div className="certificate-subtitle text-xl text-gray-600">Certificate of completion</div>
          </div>

          {/* Certificate Body */}
          <div className="certificate-body px-12 py-8">
            <p className="text-center text-lg text-gray-700 mb-4">Công nhận</p>
            <div className="certificate-name text-3xl font-bold text-center text-gray-800 mb-6" id="certName">
              {userName}
            </div>
            <div className="certificate-info grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="certificate-info-item text-center">
                <span className="certificate-info-label font-semibold text-gray-600">Lớp:</span>
                <span className="ml-2 text-gray-800" id="certClass">{classNumber}</span>
              </div>
              <div className="certificate-info-item text-center">
                <span className="certificate-info-label font-semibold text-gray-600">MSSV:</span>
                <span className="ml-2 text-gray-800" id="certId">{studentNumber}</span>
              </div>
              <div className="certificate-info-item text-center">
                <span className="certificate-info-label font-semibold text-gray-600">Ngành học:</span>
                <span className="ml-2 text-gray-800" id="certMajor">{major}</span>
              </div>
            </div>
            <p className="text-center text-gray-700 leading-relaxed" style={{fontSize: '0.85rem', lineHeight: '1.3', maxWidth: '90%', margin: '0 auto'}}>
              Đã hoàn thành bài trắc nghiệm thu hoạch từ chương trình Chuyện nghề Gen Z: Tư duy nghề thời kỳ kinh tế số
            </p>

            {/* Results Summary */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{score}/{totalQuestions}</div>
                  <div className="text-sm text-gray-600">Điểm số</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{percentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Tỷ lệ đúng</div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="certificate-footer px-12 py-8 bg-gray-50 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="signature-block text-center">
                <div className="signature-title font-semibold text-gray-800 mb-1">Lãnh đạo Khoa Marketing - Kinh doanh quốc tế</div>
                <div className="signature-status text-sm text-gray-600 mb-2">(Đã ký)</div>
                <div className="signature-name font-bold text-gray-800">TS. Châu Văn Thưởng</div>
              </div>

              <div className="signature-block text-center">
                <div className="signature-title font-semibold text-gray-800 mb-1">Chủ nhiệm CLB Future Marketer International Bussinessman</div>
                <div className="signature-status text-sm text-gray-600 mb-2">(Đã ký)</div>
                <div className="signature-name font-bold text-gray-800">Hoàng Bảo Trâm</div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center py-6 print:hidden">
            <button
              className="download-btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              id="downloadBtn"
              onClick={handleDownload}
            >
              Tải chứng nhận
            </button>
          </div>
        </div>

        {/* Certificate ID and Date */}
        {isMounted && (
          <div className="mt-4 text-center text-sm text-gray-500 print:hidden">
            <p>Certificate ID: {certificateId}</p>
            <p>Ngày cấp: {new Date(completedAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        )}

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .print\\:hidden {
              display: none !important;
            }

            body {
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .min-h-screen {
              min-height: auto !important;
              padding: 0 !important;
            }

            .certificate-container {
              box-shadow: none !important;
              margin: 0 !important;
            }

            .certificate-footer {
              background-color: #f9fafb !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .bg-blue-50 {
              background-color: #eff6ff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    </div>
  );
};