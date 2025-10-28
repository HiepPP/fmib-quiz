import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Question } from "@/types/quiz";

const QuestionManagePage: NextPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log("🔄 Starting to load questions from blob storage for management...");
        setIsLoading(true);

        // Load questions from Vercel Blob storage
        const response = await fetch('/api/blob-questions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to load questions from blob storage');
        }

        const loadedQuestions = result.data;
        console.log("✅ Questions loaded from blob storage for management:", loadedQuestions);
        console.log("📊 Questions count:", loadedQuestions.length);
        console.log("📁 Source:", result.source);
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
    value: string | boolean
  ) => {
    setFormData({
      ...formData,
      answers: formData.answers.map((answer) =>
        answer.id === answerId
          ? { ...answer, [field]: value }
          : field === "isCorrect" && value === true
            ? { ...answer, isCorrect: false }
            : answer
      ),
    });
  };

  const handleAddToPending = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.question.trim()) {
      alert("Please enter a question");
      return;
    }

    const validAnswers = formData.answers.filter((answer) => answer.text.trim());
    if (validAnswers.length < 2) {
      alert("Please provide at least 2 answers");
      return;
    }

    const hasCorrectAnswer = validAnswers.some((answer) => answer.isCorrect);
    if (!hasCorrectAnswer) {
      alert("Please mark at least one answer as correct");
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

    alert("Question added to batch! You can add more questions or save all.");
  };

  const handleSaveAllQuestions = async () => {
    if (pendingQuestions.length === 0) {
      alert("No questions to save. Please add questions first.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const updatedQuestions = [...questions, ...pendingQuestions];

      // Save to Vercel Blob storage as JSON file
      const response = await fetch('/api/blob-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: updatedQuestions }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to save questions to blob storage');
      }

      // Update state
      setQuestions(updatedQuestions);

      // Clear pending questions
      setPendingQuestions([]);

      alert(`${pendingQuestions.length} question(s) saved successfully to blob storage!`);
      console.log('✅ Questions saved to blob storage:', result.data?.url);
    } catch (error) {
      console.error("Failed to save questions to blob storage:", error);
      setSaveError(`Failed to save to blob storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleAddToPending(e);
  };

  const handleRemoveFromPending = (questionId: string) => {
    setPendingQuestions(pendingQuestions.filter(q => q.id !== questionId));
  };

  const handleClearPending = () => {
    if (window.confirm("Are you sure you want to clear all pending questions?")) {
      setPendingQuestions([]);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        setIsSaving(true);
        setSaveError(null);

        const updatedQuestions = questions.filter((q) => q.id !== questionId);

        // Save to Vercel Blob storage
        const response = await fetch('/api/blob-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ questions: updatedQuestions }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to update questions in blob storage');
        }

        // Update state
        setQuestions(updatedQuestions);

        alert("Question deleted successfully from blob storage!");
        console.log('✅ Questions updated in blob storage:', result.data?.url);
      } catch (error) {
        console.error("Failed to delete question from blob storage:", error);
        setSaveError(`Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleExportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `quiz-questions-${new Date()
      .toISOString()
      .split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImportQuestions = async (
    event: React.ChangeEvent<HTMLInputElement>
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
            await quizStorage.saveQuestions(importedQuestions);

            // Update state
            setQuestions(importedQuestions);

            alert("Questions imported successfully!");
          } else {
            alert("Invalid file format. Please upload a valid questions file.");
          }
        } catch (error) {
          console.error("Import error:", error);
          alert("Error importing questions. Please check the file format.");
          setSaveError("Error importing questions. Please check the file format.");
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
    if (
      window.confirm(
        "Are you sure you want to delete all questions from blob storage? This action cannot be undone."
      )
    ) {
      try {
        setIsSaving(true);
        setSaveError(null);

        // Delete all questions from blob storage
        const response = await fetch('/api/blob-questions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to clear questions from blob storage');
        }

        // Update state
        setQuestions([]);

        alert("All questions cleared successfully from blob storage!");
        console.log('✅ All questions deleted from blob storage');
      } catch (error) {
        console.error("Failed to clear questions from blob storage:", error);
        setSaveError(`Failed to clear questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsSaving(false);
      }
    }
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

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Add New Question Form */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Add New Question ({pendingQuestions.length} pending)
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="question"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Question *
                      </label>
                      <textarea
                        id="question"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={formData.question}
                        onChange={handleQuestionChange}
                        placeholder="Enter your question here..."
                        disabled={isSaving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Answers *
                      </label>
                      <div className="space-y-3">
                        {formData.answers.map((answer, index) => (
                          <div
                            key={answer.id}
                            className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
                              {String.fromCharCode(65 + index)}.
                            </span>

                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              value={answer.text}
                              onChange={(e) =>
                                handleAnswerChange(answer.id, "text", e.target.value)
                              }
                              placeholder={`Answer ${index + 1}`}
                              disabled={isSaving}
                            />

                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={answer.isCorrect}
                                onChange={() =>
                                  handleAnswerChange(answer.id, "isCorrect", true)
                                }
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                        Mark at least one answer as correct. You can have multiple correct answers.
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {isSaving ? "Adding..." : "Add to Batch"}
                      </button>
                      {pendingQuestions.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveAllQuestions}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
                          >
                            {isSaving ? "Saving..." : `Save All (${pendingQuestions.length})`}
                          </button>
                          <button
                            type="button"
                            onClick={handleClearPending}
                            disabled={isSaving}
                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
                          >
                            Clear Batch
                          </button>
                        </>
                      )}
                    </div>
                  </form>

                  {/* Pending Questions Section */}
                  {pendingQuestions.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-6">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                        Pending Questions ({pendingQuestions.length})
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {pendingQuestions.map((question, qIndex) => (
                          <div
                            key={question.id}
                            className="border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
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
                                            ? "text-green-600 dark:text-green-400 font-medium"
                                            : "text-gray-700 dark:text-gray-300"
                                        }`}
                                      >
                                        {answer.text}
                                      </span>
                                      {answer.isCorrect && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-0.5 rounded">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFromPending(question.id)}
                                disabled={isSaving}
                                className="ml-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:cursor-not-allowed disabled:text-gray-400"
                              >
                                <svg
                                  className="w-4 h-4"
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Current Questions ({questions.length})
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {questions.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No questions yet. Add your first question using the form.
                      </p>
                    ) : (
                      questions.map((question, qIndex) => (
                        <div
                          key={question.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                {qIndex + 1}. {question.question}
                              </h4>
                              <div className="space-y-1">
                                {question.answers.map((answer, aIndex) => (
                                  <div
                                    key={answer.id}
                                    className="flex items-center space-x-2 text-sm"
                                  >
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                      {String.fromCharCode(65 + aIndex)}.
                                    </span>
                                    <span
                                      className={`flex-1 ${
                                        answer.isCorrect
                                          ? "text-green-600 dark:text-green-400 font-medium"
                                          : "text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {answer.text}
                                    </span>
                                    {answer.isCorrect && (
                                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              disabled={isSaving}
                              className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:cursor-not-allowed disabled:text-gray-400"
                            >
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
      </Layout>
    </>
  );
};

export default QuestionManagePage;