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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.currentTarget.tagName !== "BUTTON") {
      // Allow Enter to submit form from any input field
      const form = e.currentTarget.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="absolute inset-0 bg-white/40 dark:bg-black/20"></div>
      <div className="relative max-w-md mx-auto w-full">
        <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-8">
          <div className="mb-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full blur-md opacity-50"></div>
              <div className="relative mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Chuyện Nghề Gen Z
            </h2>
            <div className="max-w-xs mx-auto">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Chào mừng bạn đến với bài kiểm tra kiến thức về thế hệ Gen Z và kỹ năng cần thiết trong thời đại số.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                  10 phút
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                  20 câu hỏi
                </span>
                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-medium rounded-full">
                  Trắc nghiệm
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Họ và tên <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  className={`w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border backdrop-blur-sm rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-all duration-200 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập họ và tên của bạn"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.name}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="classNumber"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Lớp <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="classNumber"
                  name="classNumber"
                  autoComplete="off"
                  required
                  className={`w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border backdrop-blur-sm rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all duration-200 ${
                    errors.classNumber
                      ? "border-red-500 focus:ring-red-500 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                  value={formData.classNumber}
                  onChange={handleInputChange("classNumber")}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., A1"
                  disabled={isSubmitting}
                />
                {errors.classNumber && (
                  <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.classNumber}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="studentNumber"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0a2 2 0 104 0" />
                </svg>
                Mã Số Sinh Viên <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0a2 2 0 104 0" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="studentNumber"
                  name="studentNumber"
                  autoComplete="off"
                  required
                  className={`w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border backdrop-blur-sm rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white transition-all duration-200 ${
                    errors.studentNumber
                      ? "border-red-500 focus:ring-red-500 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                  value={formData.studentNumber}
                  onChange={handleInputChange("studentNumber")}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 20240001"
                  disabled={isSubmitting}
                />
                {errors.studentNumber && (
                  <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.studentNumber}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="major"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Ngành Học <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="major"
                  name="major"
                  autoComplete="off"
                  required
                  className={`w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border backdrop-blur-sm rounded-xl shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:text-white transition-all duration-200 ${
                    errors.major
                      ? "border-red-500 focus:ring-red-500 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                  value={formData.major}
                  onChange={handleInputChange("major")}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Công nghệ thông tin"
                  disabled={isSubmitting}
                />
                {errors.major && (
                  <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.major}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-6 w-6 text-white"
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
                      <span className="text-lg">Đang khởi động...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">Bắt đầu làm bài</span>
                      <svg
                        className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </div>
              </button>

              {/* Additional info */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thời gian sẽ bắt đầu khi bạn nhấn nút
                </p>
              </div>
            </div>
          </form>

          {/* <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Quiz Information:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>You will have 10 minutes to complete the quiz</li>
                  <li>Timer starts as soon as you begin</li>
                  <li>All fields marked with * are required</li>
                  <li>Make sure you have a stable internet connection</li>
                </ul>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
