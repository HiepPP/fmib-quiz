import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, Share2, Home, RotateCcw } from "lucide-react";
import { toPng } from "html-to-image";

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
  completedAt,
  onRestart,
  onGoHome,
}) => {
  const [certificateId, setCertificateId] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setIsMounted(true);
    setCertificateId(`FMIB-${Date.now().toString(36).toUpperCase()}`);

    // Calculate scale based on screen width
    const calculateScale = () => {
      const screenWidth = window.innerWidth;
      const certificateWidth = 800; // Base width
      const padding = 32; // 16px on each side

      // If screen is smaller than certificate width + padding, scale it down
      if (screenWidth < certificateWidth + padding) {
        const availableWidth = screenWidth - padding;
        const newScale = availableWidth / certificateWidth;
        // Minimum scale of 0.5 to maintain readability
        setScale(Math.max(newScale, 0.5));
      } else {
        setScale(1);
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);

    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

  const handleDownload = async () => {
    if (isDownloading) return;

    const element = document.getElementById("certificateContainer");
    if (!element) return;

    setIsDownloading(true);

    try {
      // Wait for fonts to be ready
      await document.fonts.ready;

      // Create inline font styles as fallback
      const fontStyles = document.createElement('style');
      fontStyles.textContent = `
        @font-face {
          font-family: 'Brush Script MT';
          src: local('Brush Script MT'), local('BrushScriptMT'), url('data:font/woff2;base64,') format('woff2');
          font-display: block;
        }
        @font-face {
          font-family: 'Times New Roman';
          src: local('Times New Roman');
          font-display: block;
        }
      `;

      // Temporarily add font styles to ensure they're available
      const originalElement = element.cloneNode(true) as HTMLElement;
      originalElement.appendChild(fontStyles.cloneNode(true));

      // Generate the image using html-to-image with error handling for CSS access
      let dataUrl = "";
      try {
        dataUrl = await toPng(element, {
          quality: 1.0,
          pixelRatio: 3, // Higher resolution for better quality
          backgroundColor: "#ffffff",
          width: 800,
          height: element.offsetHeight / scale,
          style: {
            transform: "none", // Remove scale for export
            width: "800px",
            minWidth: "800px",
            maxWidth: "800px",
            fontFamily: "'Times New Roman', Times, serif",
          },
          filter: (node) => {
            // Exclude print:hidden elements
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              return !element.classList.contains("print:hidden");
            }
            return true;
          },
        });
      } catch (cssError) {
        console.warn("CSS access error, falling back to alternative method:", cssError);
        // Fallback: create a simple version without complex CSS processing
        dataUrl = await toPng(element, {
          quality: 0.9,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          width: 800,
          height: element.offsetHeight / scale,
          style: {
            transform: "none",
            width: "800px",
            fontFamily: "serif", // Use generic font family
          },
          filter: (node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              return !element.classList.contains("print:hidden");
            }
            return true;
          },
          // Skip CSS processing that causes the error
          skipAutoScale: true,
        });
      }

      // Download the image
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `FMIB-Quiz-Certificate-${userName.replace(
        /\s+/g,
        "-"
      )}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating certificate with html-to-image:", error);

      // Try alternative approach with explicit font handling
      try {
        await downloadWithCanvasFallback();
      } catch (canvasError) {
        console.error("Canvas fallback also failed:", canvasError);
        // Final fallback to print
        window.print();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Fallback method using Canvas API directly
  const downloadWithCanvasFallback = async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    canvas.width = 2400; // High resolution
    canvas.height = 1800; // High resolution

    // Draw white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = "#002b5c";
    ctx.lineWidth = 36;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

    // Draw certificate content using Canvas API
    ctx.fillStyle = "#002b5c";
    ctx.font = "bold 108px 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.fillText("CHỨNG NHẬN HOÀN THÀNH", canvas.width / 2, 300);

    // Draw user name
    ctx.fillStyle = "#003366";
    ctx.font = "bold 72px 'Times New Roman', serif";
    ctx.fillText(userName, canvas.width / 2, 600);

    // Draw signature with fallback font
    ctx.fillStyle = "#002b5c";
    ctx.font = "italic 54px cursive"; // Use generic cursive as fallback
    ctx.fillText("TS. Châu Văn Thưởng", canvas.width / 3, 1400);
    ctx.fillText("Hoàng Bảo Trâm", (2 * canvas.width) / 3, 1400);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `FMIB-Quiz-Certificate-${userName.replace(
          /\s+/g,
          "-"
        )}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, "image/png", 1.0);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: "Chứng nhận FMIB",
        text: `Tôi đã hoàn thành bài trắc nghiệm FMIB với điểm số ${score}/${totalQuestions} (${percentage.toFixed(
          1
        )}%)!`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-1 sm:py-0 lg:py-4">
      <div className="container mx-auto max-w-4xl px-2 sm:px-3 lg:px-6">
        {/* Action Buttons */}
        <div className="flex flex-row justify-end gap-2 mb-2 sm:mb-3 lg:mb-6 print:hidden">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-auto"
            disabled={isDownloading}
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Đang tạo..." : "Tải xuống"}
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-auto"
          >
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại
          </Button>
          <Button
            onClick={onGoHome}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-auto"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Button>
        </div>

        {/* Certificate Wrapper */}
        <div className="flex-1">
          <div
            className="mx-auto mb-2 sm:mb-3 lg:mb-6"
            style={{
              width: `${800 * scale}px`,
              minHeight: `${600 * scale}px`,
            }}
          >
            {/* Certificate Container */}
            <div
              className="certificate-container bg-white border-[12px] border-[#002b5c] overflow-hidden transition-transform duration-300 ease-out shadow-lg"
              id="certificateContainer"
              style={{
                display: "block",
                width: "800px",
                fontFamily: "'Times New Roman', Times, serif",
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }}
            >
          {/* Certificate Header with Logos */}
          <div className="bg-white p-6 text-center">
            <div className="flex justify-center items-center gap-6 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fmib-banner.png"
                alt="FMIB Banner"
                className="h-16 w-auto"
                crossOrigin="anonymous"
                onLoad={(e) => {
                  // Preload the image to ensure it's available for export
                  const img = e.target as HTMLImageElement;
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    ctx.drawImage(img, 0, 0);
                    // Store data URL for later use in export
                    img.setAttribute("data-fallback", canvas.toDataURL());
                  }
                }}
                onError={(e) => {
                  // Fallback: create a simple text logo if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = document.createElement("div");
                  fallback.className = "text-4xl font-bold text-blue-800";
                  fallback.textContent = "FMIB";
                  target.parentNode?.insertBefore(fallback, target.nextSibling);
                }}
              />
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center py-4">
            <div
              className="text-[1.8rem]"
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
              className="text-[1.2rem]"
              style={{
                marginBottom: "1.5rem",
                color: "var(--medium-blue)",
              }}
            >
              Chứng nhận hoàn thành
            </div>
          </div>

          {/* Certificate Body */}
          <div className="px-8 py-6">
            <p className="text-center text-base text-[#333333] mb-6">
              Công nhận
            </p>
            <div
              className="text-4xl font-bold text-center text-[#003366] mb-4 relative inline-block w-full"
              id="certName"
            >
              {userName}
            </div>
            <div className="flex flex-wrap justify-center gap-8 mb-8 max-w-2xl mx-auto">
              <div className="text-center text-xl flex-shrink-0 font-bold">
                <span className="text-xl text-[#333333]">Lớp:</span>
                <span className="ml-1 text-[#333333]" id="certClass">
                  {classNumber}
                </span>
              </div>
              <div className="text-center text-xl flex-shrink-0 font-bold">
                <span className="text-xl text-[#333333]">MSSV:</span>
                <span className="ml-1 text-[#333333]" id="certId">
                  {studentNumber}
                </span>
              </div>
              <div className="text-center text-xl flex-shrink-0 min-w-0 font-bold">
                <span className="text-xl text-[#333333]">Ngành:</span>
                <span
                  className="ml-1 text-[#333333] break-words"
                  id="certMajor"
                >
                  {major}
                </span>
              </div>
            </div>
            <p className="text-center text-[#333333] leading-relaxed text-base mb-8 max-w-lg mx-auto font-semibold">
              Đã hoàn thành bài trắc nghiệm thu hoạch từ chương trình Chuyện
              nghề Gen Z: Tư duy nghề thời kỳ kinh tế số
            </p>
          </div>

          {/* Certificate Footer */}
          <div className="px-8 py-6 bg-white mb-16">
            <div className="flex flex-row justify-between gap-6">
              <div className="flex-1 text-center">
                <div className="text-xl text-[#333333] mb-1 font-semibold">
                  Lãnh đạo Khoa Marketing
                  <br />
                  Kinh doanh quốc tế
                </div>
                <div className="text-sm text-[#dc3545] mb-2 italic">
                  (Đã ký)
                </div>
                <div
                  className="font-normal text-2xl signature-brush"
                  style={{
                    fontFamily: "'Brush Script MT', cursive",
                    marginTop: "0.5rem",
                    color: "var(--dark-blue)",
                  }}
                >
                  TS. Châu Văn Thưởng
                </div>
              </div>

              <div className="text-center flex-1">
                <div className="text-xl text-[#333333] mb-1 font-bold">
                  Chủ nhiệm CLB Future Marketer International Businessman
                </div>
                <div className="text-sm text-[#dc3545] mb-2 italic">
                  (Đã ký)
                </div>
                <div
                  className="font-normal text-2xl signature-brush"
                  style={{
                    fontFamily: "'Brush Script MT', cursive",
                    marginTop: "0.5rem",
                    color: "var(--dark-blue)",
                  }}
                >
                  Hoàng Bảo Trâm
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center py-3 sm:py-4 lg:py-6 print:hidden">
          <button
            className="bg-[#ffc107] hover:bg-[#e0a800] disabled:bg-gray-400 text-black font-bold py-3 px-8 rounded-full transition-colors text-base disabled:cursor-not-allowed"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? "Đang tạo..." : "Tải chứng nhận"}
          </button>
        </div>

        {/* Certificate ID and Date */}
        {isMounted && (
          <div className="mt-4 text-center text-sm text-gray-500 print:hidden">
            <p>Mã chứng nhận: {certificateId}</p>
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
        </div>
      </div>

        {/* Export and Print Styles */}
        <style jsx global>{`
          /* CSS Variables for certificate colors */
          :root {
            --dark-blue: #002b5c;
            --medium-blue: #003366;
          }

          /* Ensure fonts are loaded and displayed correctly */
          @font-face {
            font-family: 'Brush Script MT';
            src: local('Brush Script MT'), local('BrushScriptMT');
            font-display: block;
          }

          @font-face {
            font-family: 'Times New Roman';
            src: local('Times New Roman');
            font-display: block;
          }

          /* Certificate export optimization */
          .certificate-container {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
            font-family: "Times New Roman", Times, serif;
          }

          /* Ensure text rendering is consistent */
          .certificate-container * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }

          /* Print Styles */
          @media print {
            .print\\:hidden {
              display: none !important;
            }

            body {
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              margin: 0 !important;
              padding: 0 !important;
            }

            .min-h-screen {
              min-height: auto !important;
              padding: 0 !important;
              background: white !important;
            }

            .dark .min-h-screen {
              background: white !important;
            }

            .certificate-container {
              box-shadow: none !important;
              margin: 0 auto !important;
              border-color: #002b5c !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              page-break-inside: avoid;
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

          /* Canvas capture optimization for html2canvas */
          .html2canvas-container {
            position: relative !important;
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
          }
        `}</style>
      </div>
    </div>
  );
};
