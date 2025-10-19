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
          className="certificate-container bg-white border-[12px] border-[#002b5c] overflow-hidden"
          id="certificateContainer"
          style={{ display: "block" }}
        >
          {/* Certificate Header with Logos */}
          <div className="certificate-header bg-white p-6 text-center">
            <div className="certificate-logos flex justify-center items-center gap-6 mb-4">
              <img
                src="https://z-cdn-media.chatglm.cn/files/dc880d76-db2c-46e3-944e-d1f27b898212_logo.png?auth_key=1792307401-0469ab1e8edb440097c892d6cc0c3d1f-0-7b3a9be7520d0a833a4b252a3c0369b5"
                alt="HUTECH Logo"
                className="certificate-logo h-16 w-auto"
              />
              <div className="text-2xl font-bold text-[#002b5c]">MIB</div>
              <div className="text-2xl font-bold text-[#002b5c]">F</div>
              <div className="text-xl text-[#002b5c]">🇻🇳</div>
              <div className="text-xl text-[#002b5c]">⭐⭐⭐⭐⭐</div>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center py-4">
            <div className="certificate-title text-3xl font-bold text-[#003366] mb-2">
              CHỨNG NHẬN HOÀN THÀNH
            </div>
            <div className="certificate-subtitle text-lg text-[#1a4d7c]">
              Certificate of completion
            </div>
          </div>

          {/* Certificate Body */}
          <div className="certificate-body px-8 py-6">
            <p className="text-center text-base text-[#333333] mb-6">
              Công nhận
            </p>
            <div
              className="certificate-name text-5xl font-bold text-center text-[#003366] mb-4 relative inline-block w-full"
              id="certName"
            >
              {userName}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-[#003366]"></div>
            </div>
            <div className="certificate-info flex justify-center gap-8 mb-8">
              <div className="certificate-info-item text-center">
                <span className="certificate-info-label text-base text-[#333333]">
                  Lớp:
                </span>
                <span className="ml-1 text-base text-[#333333]" id="certClass">
                  {classNumber}
                </span>
              </div>
              <div className="certificate-info-item text-center">
                <span className="certificate-info-label text-base text-[#333333]">
                  MSSV:
                </span>
                <span className="ml-1 text-base text-[#333333]" id="certId">
                  {studentNumber}
                </span>
              </div>
              <div className="certificate-info-item text-center">
                <span className="certificate-info-label text-base text-[#333333]">
                  Ngành học:
                </span>
                <span className="ml-1 text-base text-[#333333]" id="certMajor">
                  {major}
                </span>
              </div>
            </div>
            <p className="text-center text-[#333333] leading-relaxed text-sm mb-8 max-w-lg mx-auto">
              Đã hoàn thành bài trắc nghiệm thu hoạch từ chương trình Chuyện
              nghề Gen Z: Tư duy nghề thời kỳ kinh tế số
            </p>
          </div>

          {/* Certificate Footer */}
          <div className="certificate-footer px-8 py-6 bg-white">
            <div className="flex justify-between gap-4">
              <div className="signature-block text-left flex-1">
                <div
                  className="signature-title text-sm text-[#333333] mb-1 font-bold"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Lãnh đạo Khoa Marketing - Kinh doanh quốc tế
                </div>
                <div className="signature-status text-sm text-[#dc3545] mb-2 italic">
                  (Đã ký)
                </div>
                <div
                  className="signature-name text-2xl font-normal text-[#333333]"
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                >
                  TS. Châu Văn Thưởng
                </div>
              </div>

              <div className="signature-block text-right flex-1">
                <div
                  className="signature-title text-sm text-[#333333] mb-1 font-bold"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Chủ nhiệm CLB Future Marketer International Businessman
                </div>
                <div className="signature-status text-sm text-[#dc3545] mb-2 italic">
                  (Đã ký)
                </div>
                <div
                  className="signature-name text-2xl font-normal text-[#333333]"
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                >
                  Hoàng Bảo Trâm
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center py-6 print:hidden">
            <button
              className="download-btn bg-[#ffc107] hover:bg-[#e0a800] text-black font-bold py-3 px-8 rounded-full transition-colors text-sm"
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
          }
        `}</style>
      </div>
    </div>
  );
};
