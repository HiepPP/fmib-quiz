import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, Share2, Home, RotateCcw } from "lucide-react";

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
  const [certificateId, setCertificateId] = useState<string>("");
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
        title: "FMIB Quiz Certificate",
        text: `Tôi đã hoàn thành bài trắc nghiệm FMIB với điểm số ${score}/${totalQuestions} (${percentage.toFixed(
          1
        )}%)!`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 mb-6 print:hidden">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Quiz
          </Button>
          <Button
            onClick={onGoHome}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>

        {/* Certificate Container */}
        <div
          className="certificate-container bg-white border-[8px] sm:border-[12px] border-[#002b5c] overflow-hidden"
          id="certificateContainer"
          style={{ display: "block" }}
        >
          {/* Certificate Header with Logos */}
          <div className="bg-white p-4 sm:p-6 text-center">
            <div className="flex justify-center items-center gap-4 sm:gap-6 mb-4">
              <img
                src="https://z-cdn-media.chatglm.cn/files/dc880d76-db2c-46e3-944e-d1f27b898212_logo.png?auth_key=1792307401-0469ab1e8edb440097c892d6cc0c3d1f-0-7b3a9be7520d0a833a4b252a3c0369b5"
                alt="HUTECH Logo"
                className="h-12 sm:h-16 w-auto"
              />
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center py-2 sm:py-4">
            <div
              className="text-xl sm:text-[1.8rem]"
              style={{
                fontWeight: 700,
                color: "var(--dark-blue)",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
              }}
            >
              CHỨNG NHẬN HOÀN THÀNH
            </div>
            <div
              className="text-sm sm:text-[1.2rem]"
              style={{
                marginBottom: "1rem sm:1.5rem",
                color: "var(--medium-blue)",
              }}
            >
              Certificate of completion
            </div>
          </div>

          {/* Certificate Body */}
          <div className="px-4 sm:px-8 py-4 sm:py-6">
            <p className="text-center text-sm sm:text-base text-[#333333] mb-4 sm:mb-6">
              Công nhận
            </p>
            <div
              className="text-2xl sm:text-4xl font-bold text-center text-[#003366] mb-3 sm:mb-4 relative inline-block w-full"
              id="certName"
            >
              {userName}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-0.5 bg-[#003366]"></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
              <div className="text-center text-base sm:text-xl">
                <span className="text-base sm:text-xl text-[#333333] font-bold">Lớp:</span>
                <span className="ml-1 text-[#333333]" id="certClass">
                  {classNumber}
                </span>
              </div>
              <div className="text-center text-base sm:text-xl">
                <span className="text-base sm:text-xl text-[#333333] font-bold">MSSV:</span>
                <span className="ml-1 text-[#333333]" id="certId">
                  {studentNumber}
                </span>
              </div>
              <div className="text-center text-base sm:text-xl">
                <span className="text-sm sm:text-xl text-[#333333] font-bold">Ngành học:</span>
                <span className="ml-1 text-[#333333]" id="certMajor">
                  {major}
                </span>
              </div>
            </div>
            <p className="text-center text-[#333333] leading-relaxed text-sm sm:text-base mb-6 sm:mb-8 max-w-xs sm:max-w-lg mx-auto">
              Đã hoàn thành bài trắc nghiệm thu hoạch từ chương trình Chuyện
              nghề Gen Z: Tư duy nghề thời kỳ kinh tế số
            </p>
          </div>

          {/* Certificate Footer */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 bg-white">
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
              <div className="flex-1 text-center">
                <div className="text-sm sm:text-xl text-[#333333] mb-1 font-semibold">
                  Lãnh đạo Khoa Marketing - Kinh doanh quốc tế
                </div>
                <div className="text-xs sm:text-sm text-[#dc3545] mb-2 italic">
                  (Đã ký)
                </div>
                <div
                  className="font-normal"
                  style={{
                    fontFamily: "'Brush Script MT', cursive",
                    fontSize: "1rem sm:1.5rem",
                    marginTop: "0.5rem",
                    color: "var(--dark-blue)",
                  }}
                >
                  TS. Châu Văn Thưởng
                </div>
              </div>

              <div className="text-center flex-1">
                <div className="text-sm sm:text-xl text-[#333333] mb-1 font-bold">
                  Chủ nhiệm CLB Future Marketer International Businessman
                </div>
                <div className="text-xs sm:text-sm text-[#dc3545] mb-2 italic">
                  (Đã ký)
                </div>
                <div
                  className="font-normal"
                  style={{
                    fontFamily: "'Brush Script MT', cursive",
                    fontSize: "1rem sm:1.5rem",
                    marginTop: "0.5rem",
                    color: "var(--dark-blue)",
                  }}
                >
                  Hoàng Bảo Trâm
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center py-4 sm:py-6 print:hidden">
            <button
              className="bg-[#ffc107] hover:bg-[#e0a800] text-black font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full transition-colors text-sm sm:text-base"
              onClick={handleDownload}
            >
              Tải chứng nhận
            </button>
          </div>
        </div>

        {/* Certificate ID and Date */}
        {isMounted && (
          <div className="mt-4 text-center text-xs sm:text-sm text-gray-500 print:hidden">
            <p>Certificate ID: {certificateId}</p>
            <p>
              Ngày cấp:{" "}
              {new Date(completedAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
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
              border-color: #002b5c !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .certificate-footer {
              background-color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .border-\\[\\#002b5c\\] {
              border-color: #002b5c !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .text-\\[\\#003366\\] {
              color: #003366 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .text-\\[\\#dc3545\\] {
              color: #dc3545 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* Mobile print optimization */
            @media print and (max-width: 640px) {
              .certificate-container {
                border-width: 8px !important;
              }

              .text-xl {
                font-size: 1rem !important;
              }

              .text-2xl {
                font-size: 1.5rem !important;
              }
            }
          }
        `}</style>
      </div>
    </div>
  );
};
