import { useState } from "react";
import { UserInfo } from "@/types/quiz";
import { storage } from "@/lib/storage";

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
}

interface FormErrors {
  name?: string;
  studentNumber?: string;
  classNumber?: string;
  major?: string;
}

export default function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [formData, setFormData] = useState<UserInfo>({
    name: "Chấp Hịp",
    studentNumber: "20240001",
    classNumber: "A1",
    major: "Công nghệ thông tin",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    // Student number validation
    if (!formData.studentNumber.trim()) {
      newErrors.studentNumber = "Student number is required";
    } else if (!/^[a-zA-Z0-9]{4,20}$/.test(formData.studentNumber.trim())) {
      newErrors.studentNumber =
        "Student number must be 4-20 alphanumeric characters";
    }

    // Class number validation
    if (!formData.classNumber.trim()) {
      newErrors.classNumber = "Class number is required";
    } else if (!/^[a-zA-Z0-9]{1,10}$/.test(formData.classNumber.trim())) {
      newErrors.classNumber =
        "Class number must be 1-10 alphanumeric characters";
    }

    // Major validation
    if (!formData.major.trim()) {
      newErrors.major = "Major is required";
    } else if (formData.major.trim().length < 2) {
      newErrors.major = "Major must be at least 2 characters";
    } else if (formData.major.trim().length > 100) {
      newErrors.major = "Major must be less than 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof UserInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Store user information in localStorage
      const userInfo: UserInfo = {
        name: formData.name.trim(),
        studentNumber: formData.studentNumber.trim().toUpperCase(),
        classNumber: formData.classNumber.trim().toUpperCase(),
        major: formData.major.trim(),
      };

      // Create quiz session
      const session = {
        userInfo,
        answers: [],
        startTime: Date.now(),
        currentQuestionIndex: 0,
        isCompleted: false,
      };

      storage.saveQuizSession(session);

      // Call parent callback
      onSubmit(userInfo);
    } catch (error) {
      console.error("Error saving user information:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.currentTarget.tagName !== "BUTTON") {
      // Allow Enter to submit form from any input field
      const form = e.currentTarget.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-3 sm:p-4 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>

      <div className="relative w-full max-w-lg">
        <div className="hover:shadow-3xl relative rounded-2xl sm:rounded-3xl border border-white/20 bg-white/90 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 dark:border-gray-700/30 dark:bg-gray-900/90">
          {/* Compact Header for mobile */}
          <div className="mb-4 sm:mb-6 md:mb-8 text-center">
            <div className="relative mb-3 sm:mb-4 md:mb-6 inline-flex items-center justify-center">
              <div className="absolute -inset-1 sm:-inset-2 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur-lg"></div>
              <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 transform items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="animate-gradient mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-2xl sm:text-3xl md:text-4xl font-bold text-transparent">
              Chuyện Nghề Gen Z
            </h1>

            <p className="mx-auto mb-3 sm:mb-4 md:mb-6 max-w-xs text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Khám phá kiến thức về thế hệ Gen Z và chuẩn bị cho tương lai số
            </p>

            {/* Compact badges */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
              <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full transition-transform hover:scale-105">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                10 phút
              </span>
              <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full transition-transform hover:scale-105">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                20 câu
              </span>
              <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 text-xs font-semibold rounded-full transition-transform hover:scale-105">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Trắc nghiệm
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
            {/* Two column layout on larger screens */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <label
                  htmlFor="name"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  className={`w-full rounded-lg sm:rounded-xl border bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/50 dark:text-white text-sm ${
                    errors.name
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                  }`}
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập họ tên"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="flex items-center text-xs text-red-600 dark:text-red-400">
                    <svg
                      className="mr-1 h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label
                  htmlFor="classNumber"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Lớp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="classNumber"
                  name="classNumber"
                  autoComplete="off"
                  required
                  className={`w-full rounded-lg sm:rounded-xl border bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/50 dark:text-white text-sm ${
                    errors.classNumber
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                  }`}
                  value={formData.classNumber}
                  onChange={handleInputChange("classNumber")}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., A1"
                  disabled={isSubmitting}
                />
                {errors.classNumber && (
                  <p className="flex items-center text-xs text-red-600 dark:text-red-400">
                    <svg
                      className="mr-1 h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errors.classNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label
                htmlFor="studentNumber"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mã số sinh viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="studentNumber"
                name="studentNumber"
                autoComplete="off"
                required
                className={`w-full rounded-lg sm:rounded-xl border bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/50 dark:text-white text-sm ${
                  errors.studentNumber
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                }`}
                value={formData.studentNumber}
                onChange={handleInputChange("studentNumber")}
                onKeyDown={handleKeyDown}
                placeholder="e.g., 20240001"
                disabled={isSubmitting}
              />
              {errors.studentNumber && (
                <p className="flex items-center text-xs text-red-600 dark:text-red-400">
                  <svg
                    className="mr-1 h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.studentNumber}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label
                htmlFor="major"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Ngành học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="major"
                name="major"
                autoComplete="off"
                required
                className={`w-full rounded-lg sm:rounded-xl border bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/50 dark:text-white text-sm ${
                  errors.major
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                }`}
                value={formData.major}
                onChange={handleInputChange("major")}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Công nghệ thông tin"
                disabled={isSubmitting}
              />
              {errors.major && (
                <p className="flex items-center text-xs text-red-600 dark:text-red-400">
                  <svg
                    className="mr-1 h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.major}
                </p>
              )}
            </div>

            <div className="pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full transform overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 sm:px-6 sm:py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus:ring-4 focus:ring-blue-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-sm sm:text-base">Đang khởi động...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base">Bắt đầu làm bài</span>
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5 transform transition-transform duration-200 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </div>
              </button>

              <p className="mt-3 sm:mt-4 flex items-center justify-center text-center text-xs text-gray-500 dark:text-gray-400">
                <svg
                  className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3 sm:w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs">Thời gian sẽ bắt đầu khi bạn nhấn nút</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
