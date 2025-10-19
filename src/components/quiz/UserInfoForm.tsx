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
    name: "",
    studentNumber: "",
    classNumber: "",
    major: "",
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
    <div className="max-w-md mx-auto w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Chuyện Nghề Gen Z
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Chào mừng bạn đến với bài kiểm tra kiến thức về thế hệ Gen Z và kỹ
              năng cần thiết trong thời đại số. Bạn sẽ có 10 phút để hoàn thành
              20 câu hỏi trắc nghiệm. Hãy chuẩn bị sẵn sàng và điền thông tin
              của bạn bên dưới để bắt đầu!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập họ và tên của bạn"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="classNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Lớp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="classNumber"
                  name="classNumber"
                  autoComplete="off"
                  required
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
                    errors.classNumber
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  value={formData.classNumber}
                  onChange={handleInputChange("classNumber")}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., A1"
                  disabled={isSubmitting}
                />
                {errors.classNumber && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.classNumber}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="studentNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Mã Số Sinh Viên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="studentNumber"
                  name="studentNumber"
                  autoComplete="off"
                  required
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
                    errors.studentNumber
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  value={formData.studentNumber}
                  onChange={handleInputChange("studentNumber")}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 20240001"
                  disabled={isSubmitting}
                />
                {errors.studentNumber && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.studentNumber}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="major"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Ngành Học <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="major"
                  name="major"
                  autoComplete="off"
                  required
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
                    errors.major
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  value={formData.major}
                  onChange={handleInputChange("major")}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Công nghệ thông tin"
                  disabled={isSubmitting}
                />
                {errors.major && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.major}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    <span>Starting Quiz...</span>
                  </>
                ) : (
                  <>
                    <span>Bắt đầu làm bài</span>
                    <svg
                      className="w-5 h-5"
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
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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
          </div>
        </div>
      </div>
    </div>
  );
}
