import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import QuestionForm from "@/components/admin/QuestionForm";
import QuestionList from "@/components/admin/QuestionList";
import { Question } from "@/types/quiz";
import { quizStorage } from "@/lib/quiz-storage";
import Link from "next/link";

type AdminView = "list" | "add" | "edit";

const AdminPage: NextPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentView, setCurrentView] = useState<AdminView>("list");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isBlobConfigured, setIsBlobConfigured] = useState<boolean | null>(
    null,
  );

  // Check if database storage is configured
  const checkDatabaseConfiguration = async () => {
    try {
      const response = await fetch("/api/debug-db");
      if (response.ok) {
        const info = await response.json();
        setIsBlobConfigured(info.dbConfigured);
      } else {
        setIsBlobConfigured(false);
      }
    } catch (error) {
      console.error("Failed to check database configuration:", error);
      setIsBlobConfigured(false);
    }
  };

  // Load questions from blob storage on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log("🔄 Starting to load questions...");
        setIsLoading(true);

        // Check database configuration first
        await checkDatabaseConfiguration();

        const loadedQuestions = await quizStorage.getQuestions();
        console.log("✅ Questions loaded:", loadedQuestions);
        console.log("📊 Questions count:", loadedQuestions.length);
        setQuestions(loadedQuestions);
        console.log("🎯 Questions state set");
      } catch (error) {
        console.error("❌ Failed to load questions:", error);
        setSaveError(
          "Failed to load questions. Please try refreshing the page.",
        );
      } finally {
        console.log("🏁 Loading finished, setting isLoading to false");
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Save questions to blob storage whenever they change
  const saveQuestions = async (updatedQuestions: Question[]) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setQuestions(updatedQuestions);
      await quizStorage.saveQuestions(updatedQuestions);
      console.log("✅ Questions saved successfully");
    } catch (error) {
      console.error("❌ Failed to save questions:", error);
      setSaveError("Failed to save questions. Please try again.");
      // Revert to previous state on error
      setQuestions(questions);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setCurrentView("add");
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setCurrentView("edit");
  };

  const handleSaveQuestion = async (question: Question) => {
    if (currentView === "edit" && editingQuestion) {
      // Update existing question
      await saveQuestions(
        questions.map((q) => (q.id === question.id ? question : q)),
      );
    } else {
      // Add new question
      await saveQuestions([...questions, question]);
    }
    setCurrentView("list");
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await saveQuestions(questions.filter((q) => q.id !== questionId));
    }
  };

  const handleCancel = () => {
    setCurrentView("list");
    setEditingQuestion(null);
  };

  const handleExportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `quiz-questions-${new Date().toISOString().split("T")[0]}.json`;

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
            await saveQuestions(importedQuestions);
            alert("Questions imported successfully!");
          } else {
            alert("Invalid file format. Please upload a valid questions file.");
          }
        } catch (error) {
          console.error("Error importing questions:", error);
          alert("Error importing questions. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
    // Reset the input
    event.target.value = "";
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete all questions? This action cannot be undone.",
      )
    ) {
      await saveQuestions([]);
    }
  };

  // New blob storage specific handlers
  const handleViewStorageInfo = async () => {
    try {
      // Call debug API to get storage info
      const response = await fetch("/api/debug-db");
      const info = await response.json();

      if (!response.ok) {
        throw new Error(info.error || "Failed to get storage info");
      }

      const message = `
Database Information:
• Environment: ${info.nodeEnv}
• Database Configured: ${info.dbConfigured ? "✅ Yes" : "❌ No"}
• Connection Status: ${info.tests.connectionTest?.success ? "✅ Connected" : "❌ Failed"}
• Total Questions: ${info.tests.queryTest?.details?.questionCount || 0} questions found
• Storage Type: Vercel Postgres Database

Your quiz questions are stored securely in Vercel Postgres database and will persist across deployments.
Automatic backups are handled by Vercel Postgres.
      `.trim();

      alert(message);
    } catch (error) {
      console.error("Failed to get storage info:", error);
      alert("❌ Failed to retrieve database information.");
    }
  };

  return (
    <>
      <Head>
        <title>Quiz Admin - FMIB Quiz</title>
        <meta
          name="description"
          content="Admin interface for managing quiz questions"
        />
      </Head>

      <Layout title="Quiz Admin">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Quiz Admin Panel
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your quiz questions and answers
              </p>
            </div>

            {currentView === "list" && (
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

                {isBlobConfigured && (
                  <button
                    onClick={handleViewStorageInfo}
                    className="rounded-md bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700"
                  >
                    Storage Info
                  </button>
                )}

                <Link
                  href="/admin/question-manage"
                  className="inline-flex rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  Manage Questions
                </Link>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Questions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questions.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Answers
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questions.reduce((sum, q) => sum + q.answers.length, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ready for Quiz
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {questions.length > 0 ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Storage Status */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Storage Type
                  </p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    Vercel Postgres 🗄️
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Relational database with automatic backups
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {saveError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
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
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
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

          {/* Main Content */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Loading questions from Vercel Blob...
                    </p>
                  </div>
                </div>
              ) : currentView === "list" ? (
                <QuestionList
                  questions={questions}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ) : (
                <div>
                  <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
                    {currentView === "edit"
                      ? "Edit Question"
                      : "Add New Question"}
                  </h2>
                  <QuestionForm
                    question={editingQuestion || undefined}
                    onSave={handleSaveQuestion}
                    onCancel={handleCancel}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AdminPage;
