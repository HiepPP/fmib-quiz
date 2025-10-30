import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Question } from "@/types/quiz";
import { blobStorage } from "../../lib/blob-storage";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import withAuth from "@/components/auth/withAuth";
import { getCurrentUser, clearAuth } from "@/lib/storage";
import { apiClient } from "@/lib/api";

const QuestionManagePage: NextPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Logout function
  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  // Dialog state management
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "error" | "warning" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
  });

  // Helper function to show dialog
  const showDialog = (
    title: string,
    message: string,
    type: "info" | "success" | "error" | "warning" | "confirm" = "info",
    onConfirm?: () => void,
  ) => {
    setDialogState({ isOpen: true, title, message, type, onConfirm });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log(
          "🔄 Starting to load questions from blob storage for management...",
        );
        setIsLoading(true);

        // Load questions from Vercel Blob storage
        const loadedQuestions = await apiClient.get("/blob-questions", true);

        console.log(
          "✅ Questions loaded from blob storage for management:",
          loadedQuestions,
        );
        console.log("📊 Questions count:", loadedQuestions.length);
        setQuestions(loadedQuestions);
        console.log("🎯 Questions state set");
      } catch (error) {
        console.error("❌ Failed to load questions from blob storage:", error);
        setSaveError(
          "Failed to load questions from blob storage. Please try refreshing the page.",
        );
      } finally {
        console.log("🏁 Loading finished, setting isLoading to false");
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Form state for adding questions
  // Form state for adding multiple questions
  const [formData, setFormData] = useState({
    question: "",
    answers: [
      { id: "1", text: "", isCorrect: false },
      { id: "2", text: "", isCorrect: false },
      { id: "3", text: "", isCorrect: false },
      { id: "4", text: "", isCorrect: false },
    ],
  });

  // State for tracking questions to be added in batch
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, question: e.target.value });
  };

  const handleAnswerChange = (
    answerId: string,
    field: "text" | "isCorrect",
    value: string | boolean,
  ) => {
    setFormData({
      ...formData,
      answers: formData.answers.map((answer) =>
        answer.id === answerId
          ? { ...answer, [field]: value }
          : field === "isCorrect" && value === true
            ? { ...answer, isCorrect: false }
            : answer,
      ),
    });
  };

  const handleAddToPending = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.question.trim()) {
      showDialog("Missing Question", "Please enter a question", "warning");
      return;
    }

    const validAnswers = formData.answers.filter((answer) =>
      answer.text.trim(),
    );
    if (validAnswers.length < 2) {
      showDialog("Insufficient Answers", "Please provide at least 2 answers", "warning");
      return;
    }

    const hasCorrectAnswer = validAnswers.some((answer) => answer.isCorrect);
    if (!hasCorrectAnswer) {
      showDialog("No Correct Answer", "Please mark at least one answer as correct", "warning");
      return;
    }

    // Add to pending questions
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: formData.question.trim(),
      answers: validAnswers,
    };

    setPendingQuestions([...pendingQuestions, newQuestion]);

    // Reset form for next question
    setFormData({
      question: "",
      answers: [
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
        { id: "3", text: "", isCorrect: false },
        { id: "4", text: "", isCorrect: false },
      ],
    });
  };

  const handleSaveAllQuestions = async () => {
    if (pendingQuestions.length === 0) {
      showDialog("No Pending Questions", "No questions to save. Please add questions first.", "info");
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const updatedQuestions = [...questions, ...pendingQuestions];

      // Save to Vercel Blob storage as JSON file
      await apiClient.post("/blob-questions", { questions: updatedQuestions }, true);

      // Update state
      setQuestions(updatedQuestions);

      // Clear pending questions
      setPendingQuestions([]);

      showDialog(
        "Success",
        `${pendingQuestions.length} question(s) saved successfully to blob storage!`,
        "success"
      );
      console.log("✅ Questions saved to blob storage:", result.data?.url);
    } catch (error) {
      console.error("Failed to save questions to blob storage:", error);
      setSaveError(
        `Failed to save to blob storage: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleAddToPending(e);
  };

  const handleRemoveFromPending = (questionId: string) => {
    setPendingQuestions(pendingQuestions.filter((q) => q.id !== questionId));
  };

  const handleClearPending = () => {
    showDialog(
      "Clear Pending Questions",
      "Are you sure you want to clear all pending questions?",
      "confirm",
      () => {
        setPendingQuestions([]);
      }
    );
  };

  const handleDeleteQuestion = async (questionId: string) => {
    showDialog(
      "Delete Question",
      "Are you sure you want to delete this question?",
      "confirm",
      async () => {
        try {
          setIsSaving(true);
          setSaveError(null);

          const updatedQuestions = questions.filter((q) => q.id !== questionId);

          // Save to Vercel Blob storage
          await apiClient.post("/blob-questions", { questions: updatedQuestions }, true);

          // Update state
          setQuestions(updatedQuestions);

          showDialog("Success", "Question deleted successfully from blob storage!", "success");
          console.log("✅ Questions updated in blob storage:", result.data?.url);
        } catch (error) {
          console.error("Failed to delete question from blob storage:", error);
          setSaveError(
            `Failed to delete question: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        } finally {
          setIsSaving(false);
        }
      }
    );
  };

  const handleExportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `quiz-questions-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImportQuestions = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedQuestions = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedQuestions)) {
            setIsSaving(true);
            setSaveError(null);

            // Save to storage
            await blobStorage.saveQuestions(importedQuestions);

            // Update state
            setQuestions(importedQuestions);

            showDialog("Success", "Questions imported successfully!", "success");
          } else {
            showDialog("Invalid File", "Invalid file format. Please upload a valid questions file.", "error");
          }
        } catch (error) {
          console.error("Import error:", error);
          showDialog("Import Error", "Error importing questions. Please check the file format.", "error");
          setSaveError(
            "Error importing questions. Please check the file format.",
          );
        } finally {
          setIsSaving(false);
        }
      };
      reader.readAsText(file);
    }
    // Reset the input
    event.target.value = "";
  };

  const handleClearAll = async () => {
    showDialog(
      "Clear All Questions",
      "Are you sure you want to delete all questions from blob storage? This action cannot be undone.",
      "confirm",
      async () => {
        try {
          setIsSaving(true);
          setSaveError(null);

          // Delete all questions from blob storage
          await apiClient.delete("/blob-questions", true);

          // Update state
          setQuestions([]);

          showDialog("Success", "All questions cleared successfully from blob storage!", "success");
          console.log("✅ All questions deleted from blob storage");
        } catch (error) {
          console.error("Failed to clear questions from blob storage:", error);
          setSaveError(
            `Failed to clear questions: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        } finally {
          setIsSaving(false);
        }
      }
    );
  };

  return (
    <>
      <Head>
        <title>Question Management - FMIB Quiz</title>
        <meta
          name="description"
          content="Manage quiz questions - add, edit, delete, and import/export"
        />
      </Head>

      <Layout title="Question Management">
        <div className="container mx-auto px-4 py-8">
          {/* Admin Header with User Info and Logout */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Question Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage quiz questions for the FMIB Quiz application
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.role}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </Button>
            </div>
          </div>
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading questions from storage...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header with actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Question Management
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Total Questions: {questions.length}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportQuestions}
                    disabled={questions.length === 0 || isSaving}
                    className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    Export
                  </button>
                  <label className="cursor-pointer rounded-md bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400">
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportQuestions}
                      disabled={isSaving}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleClearAll}
                    disabled={questions.length === 0 || isSaving}
                    className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    Clear All
                  </button>
                  <Link
                    href="/admin"
                    className="rounded-md bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700"
                  >
                    Back to Admin
                  </Link>
                </div>
              </div>

              {/* Error Display */}
              {saveError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <p className="mt-1 text-sm text-red-700">{saveError}</p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        onClick={() => setSaveError(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Add New Question Form */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Add New Question ({pendingQuestions.length} pending)
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="question"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Question *
                      </label>
                      <textarea
                        id="question"
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        value={formData.question}
                        onChange={handleQuestionChange}
                        placeholder="Enter your question here..."
                        disabled={isSaving}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Answers *
                      </label>
                      <div className="space-y-3">
                        {formData.answers.map((answer, index) => (
                          <div
                            key={answer.id}
                            className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-600"
                          >
                            <span className="w-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                              {String.fromCharCode(65 + index)}.
                            </span>

                            <input
                              type="text"
                              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              value={answer.text}
                              onChange={(e) =>
                                handleAnswerChange(
                                  answer.id,
                                  "text",
                                  e.target.value,
                                )
                              }
                              placeholder={`Answer ${index + 1}`}
                              disabled={isSaving}
                            />

                            <label className="flex cursor-pointer items-center space-x-2">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={answer.isCorrect}
                                onChange={() =>
                                  handleAnswerChange(
                                    answer.id,
                                    "isCorrect",
                                    true,
                                  )
                                }
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                disabled={isSaving}
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Correct
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Mark at least one answer as correct. You can have
                        multiple correct answers.
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {isSaving ? "Adding..." : "Add to Batch"}
                      </button>
                      {pendingQuestions.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveAllQuestions}
                            disabled={isSaving}
                            className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                          >
                            {isSaving
                              ? "Saving..."
                              : `Save All (${pendingQuestions.length})`}
                          </button>
                          <button
                            type="button"
                            onClick={handleClearPending}
                            disabled={isSaving}
                            className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                          >
                            Clear Batch
                          </button>
                        </>
                      )}
                    </div>
                  </form>

                  {/* Pending Questions Section */}
                  {pendingQuestions.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                      <h4 className="text-md mb-3 font-semibold text-gray-900 dark:text-white">
                        Pending Questions ({pendingQuestions.length})
                      </h4>
                      <div className="max-h-64 space-y-3 overflow-y-auto">
                        {pendingQuestions.map((question, qIndex) => (
                          <div
                            key={question.id}
                            className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                                  {qIndex + 1}. {question.question}
                                </h5>
                                <div className="space-y-1">
                                  {question.answers.map((answer, aIndex) => (
                                    <div
                                      key={answer.id}
                                      className="flex items-center space-x-2 text-xs"
                                    >
                                      <span className="font-medium text-gray-600 dark:text-gray-400">
                                        {String.fromCharCode(65 + aIndex)}.
                                      </span>
                                      <span
                                        className={`flex-1 ${
                                          answer.isCorrect
                                            ? "font-medium text-green-600 dark:text-green-400"
                                            : "text-gray-700 dark:text-gray-300"
                                        }`}
                                      >
                                        {answer.text}
                                      </span>
                                      {answer.isCorrect && (
                                        <span className="rounded bg-green-100 px-1 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveFromPending(question.id)
                                }
                                disabled={isSaving}
                                className="ml-3 text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Questions List */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Current Questions
                    </h3>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {questions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <svg
                          className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-center text-sm font-medium text-gray-900 dark:text-white">
                          No questions yet
                        </p>
                        <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
                          Add your first question using the form
                        </p>
                      </div>
                    ) : (
                      questions.map((question, qIndex) => (
                        <div
                          key={question.id}
                          className="group relative rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-gray-600 dark:from-gray-800 dark:to-gray-800/50 dark:hover:border-blue-600"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              {/* Question Header */}
                              <div className="flex items-start gap-3">
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                  {qIndex + 1}
                                </div>
                                <h4 className="flex-1 pt-0.5 font-medium leading-snug text-gray-900 dark:text-white">
                                  {question.question}
                                </h4>
                              </div>

                              {/* Answers List */}
                              <div className="space-y-2 pl-10">
                                {question.answers.map((answer, aIndex) => (
                                  <div
                                    key={answer.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                      {String.fromCharCode(65 + aIndex)}
                                    </span>
                                    <span
                                      className={`flex-1 ${
                                        answer.isCorrect
                                          ? "font-semibold text-green-600 dark:text-green-400"
                                          : "text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {answer.text}
                                    </span>
                                    {answer.isCorrect && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                        <svg
                                          className="h-3 w-3"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              disabled={isSaving}
                              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                              title="Delete question"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Component */}
        <Dialog
          isOpen={dialogState.isOpen}
          onClose={closeDialog}
          title={dialogState.title}
          message={dialogState.message}
          type={dialogState.type}
          onConfirm={dialogState.onConfirm}
        />
      </Layout>
    </>
  );
};

export default withAuth(QuestionManagePage);
