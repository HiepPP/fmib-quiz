import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, Share2, Home, RotateCcw } from "lucide-react";
import html2canvas from "html2canvas";

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

  useEffect(() => {
    setIsMounted(true);
    setCertificateId(`FMIB-${Date.now().toString(36).toUpperCase()}`);
  }, []);

  const handleDownload = async () => {
    if (isDownloading) return;

    const element = document.getElementById("certificateContainer");
    if (!element) return;

    setIsDownloading(true);

    try {
      // Pre-load and convert logo image to data URL
      const logoImg = element.querySelector(
        'img[alt="FMIB Banner"]'
      ) as HTMLImageElement;
      let logoDataUrl = "";

      if (logoImg && logoImg.complete) {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = logoImg.naturalWidth || 400;
          canvas.height = logoImg.naturalHeight || 120;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(logoImg, 0, 0);
            logoDataUrl = canvas.toDataURL("image/png");
          }
        } catch {
          console.log("Could not convert logo to data URL, will use fallback");
        }
      }

      // Wait a bit to ensure all styles are applied
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create a canvas from the certificate element with improved configuration
      const canvas = await html2canvas(element, {
        scale: 3, // Higher resolution for better quality
        useCORS: true, // Allow cross-origin images
        allowTaint: true, // Allow tainted canvas for external images
        backgroundColor: "#ffffff",
        logging: false,
        width: element.offsetWidth, // Use actual width
        height: element.offsetHeight, // Use actual height
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        foreignObjectRendering: false, // Disable for better compatibility
        imageTimeout: 0, // No timeout
        removeContainer: false,
        onclone: (clonedDoc) => {
          // Apply all styles explicitly to the cloned document
          const clonedElement = clonedDoc.getElementById(
            "certificateContainer"
          );
          if (clonedElement) {
            // Set explicit styles
            clonedElement.style.width = element.offsetWidth + "px";
            clonedElement.style.minWidth = element.offsetWidth + "px";
            clonedElement.style.maxWidth = element.offsetWidth + "px";
            clonedElement.style.margin = "0";
            clonedElement.style.backgroundColor = "#ffffff";
            clonedElement.style.border = "12px solid #002b5c";
            clonedElement.style.fontFamily = "'Times New Roman', Times, serif";
            clonedElement.style.overflow = "visible";
            clonedElement.style.display = "block";
            clonedElement.style.boxShadow = "none";
            clonedElement.style.padding = "0";
          }

          // Force Times New Roman font on all elements
          const allElements = clonedElement?.querySelectorAll("*");
          if (allElements) {
            allElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.fontFamily = "'Times New Roman', Times, serif";
            });
          }

          // Ensure all CSS variables are applied as actual values
          const style = clonedDoc.createElement("style");
          style.textContent = `
            * {
              font-family: 'Times New Roman', Times, serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #certificateContainer {
              background-color: #ffffff !important;
              border: 12px solid #002b5c !important;
            }
            [style*="color: var(--dark-blue)"] {
              color: #002b5c !important;
            }
            [style*="color: var(--medium-blue)"] {
              color: #003366 !important;
            }
            .text-\\[\\#003366\\] {
              color: #003366 !important;
            }
            .text-\\[\\#dc3545\\] {
              color: #dc3545 !important;
            }
            .text-\\[\\#333333\\] {
              color: #333333 !important;
            }
            .bg-white {
              background-color: #ffffff !important;
            }
            .border-\\[\\#002b5c\\] {
              border-color: #002b5c !important;
            }
            .text-xl, .text-2xl, .text-4xl {
              font-family: 'Times New Roman', Times, serif !important;
              font-weight: bold !important;
            }
            img {
              display: block !important;
              margin: 0 auto !important;
            }
            .text-center {
              text-align: center !important;
            }
            .mx-auto {
              margin-left: auto !important;
              margin-right: auto !important;
            }
            .print\\:hidden {
              display: none !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          // Handle images - use pre-loaded data URL or create fallback
          const images = clonedElement?.querySelectorAll("img");
          if (images) {
            images.forEach((img) => {
              const htmlImg = img as HTMLImageElement;

              // If we have the pre-loaded data URL, use it
              if (logoDataUrl) {
                htmlImg.src = logoDataUrl;
              } else {
                // Create a high-quality FMIB logo as fallback
                const logoCanvas = clonedDoc.createElement("canvas");
                const logoCtx = logoCanvas.getContext("2d");
                if (logoCtx) {
                  // Set canvas size for high DPI
                  logoCanvas.width = 600;
                  logoCanvas.height = 180;

                  // Clear canvas with white background
                  logoCtx.fillStyle = "#ffffff";
                  logoCtx.fillRect(0, 0, 600, 180);

                  // Draw FMIB text with professional styling
                  logoCtx.fillStyle = "#002b5c";
                  logoCtx.font = "bold 72px 'Times New Roman', Times, serif";
                  logoCtx.textAlign = "center";
                  logoCtx.textBaseline = "middle";
                  logoCtx.fillText("FMIB", 300, 70);

                  // Add club text
                  logoCtx.font = "28px 'Times New Roman', Times, serif";
                  logoCtx.fillStyle = "#003366";
                  logoCtx.fillText(
                    "Future Marketer International Businessman",
                    300,
                    130
                  );
                }
                htmlImg.src = logoCanvas.toDataURL("image/png");
              }

              htmlImg.style.display = "block";
              htmlImg.style.margin = "0 auto";
              htmlImg.style.maxWidth = "100%";
              htmlImg.style.height = "auto";
              htmlImg.crossOrigin = "anonymous";
            });
          }

          // Remove any print:hidden elements
          const hiddenElements =
            clonedElement?.querySelectorAll(".print\\:hidden");
          hiddenElements?.forEach((el) => el.remove());
        },
      });

      // Convert canvas to blob and download
      canvas.toBlob(
        (blob) => {
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
          setIsDownloading(false);
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("Error generating certificate:", error);
      setIsDownloading(false);
      // Fallback to print if html2canvas fails
      window.print();
    }
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
            disabled={isDownloading}
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Generating..." : "Download"}
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
          className="certificate-container bg-white border-[8px] sm:border-[12px] border-[#002b5c] overflow-hidden mx-auto"
          id="certificateContainer"
          style={{
            display: "block",
            width: "800px",
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          {/* Certificate Header with Logos */}
          <div className="bg-white p-4 sm:p-6 text-center">
            <div className="flex justify-center items-center gap-4 sm:gap-6 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fmib-banner.png"
                alt="FMIB Banner"
                className="h-12 sm:h-16 w-auto"
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
                  fallback.className =
                    "text-2xl sm:text-4xl font-bold text-blue-800";
                  fallback.textContent = "FMIB";
                  target.parentNode?.insertBefore(fallback, target.nextSibling);
                }}
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
            </div>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-6 sm:mb-8 max-w-2xl mx-auto">
              <div className="text-center text-base sm:text-xl flex-shrink-0">
                <span className="text-base sm:text-xl text-[#333333] font-bold">
                  Lớp:
                </span>
                <span className="ml-1 text-[#333333]" id="certClass">
                  {classNumber}
                </span>
              </div>
              <div className="text-center text-base sm:text-xl flex-shrink-0">
                <span className="text-base sm:text-xl text-[#333333] font-bold">
                  MSSV:
                </span>
                <span className="ml-1 text-[#333333]" id="certId">
                  {studentNumber}
                </span>
              </div>
              <div className="text-center text-base sm:text-xl flex-shrink-0 min-w-0">
                <span className="text-sm sm:text-xl text-[#333333] font-bold">
                  Ngành:
                </span>
                <span
                  className="ml-1 text-[#333333] break-words"
                  id="certMajor"
                >
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
            <div className="flex flex-row justify-between gap-4 sm:gap-6">
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
              className="bg-[#ffc107] hover:bg-[#e0a800] disabled:bg-gray-400 text-black font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full transition-colors text-sm sm:text-base disabled:cursor-not-allowed"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? "Đang tạo..." : "Tải chứng nhận"}
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

        {/* Export and Print Styles */}
        <style jsx global>{`
          /* CSS Variables for certificate colors */
          :root {
            --dark-blue: #002b5c;
            --medium-blue: #003366;
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
