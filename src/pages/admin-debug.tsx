import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { blobStorage } from "@/lib/blob-storage";
import { Question } from "@/types/quiz";

const AdminDebugPage: NextPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    setLogs((prev) => [...prev, logMessage]);
    console.log(logMessage);
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        addLog("🔄 Starting to load questions...");
        setIsLoading(true);
        setError(null);

        const loadedQuestions = await blobStorage.getQuestions();
        addLog(
          `✅ Questions loaded: ${JSON.stringify(loadedQuestions, null, 2)}`,
        );
        addLog(`📊 Questions count: ${loadedQuestions.length}`);

        setQuestions(loadedQuestions);
        addLog("🎯 Questions state set");
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        addLog(`❌ Failed to load questions: ${errorMsg}`);
        setError(errorMsg);
      } finally {
        addLog("🏁 Loading finished, setting isLoading to false");
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  return (
    <>
      <Head>
        <title>Admin Debug - FMIB Quiz</title>
      </Head>

      <div className="min-h-screen bg-gray-100 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold">🔍 Admin Debug Page</h1>

          {/* Status */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold">Status</h2>
            <div className="space-y-2">
              <p>
                <strong>Loading:</strong> {isLoading ? "✅ Yes" : "❌ No"}
              </p>
              <p>
                <strong>Questions Count:</strong> {questions.length}
              </p>
              <p>
                <strong>Error:</strong> {error || "None"}
              </p>
            </div>
          </div>

          {/* Questions */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold">Questions Data</h2>
            <pre className="overflow-x-auto rounded bg-gray-100 p-4 text-xs dark:bg-gray-900">
              {JSON.stringify(questions, null, 2)}
            </pre>
          </div>

          {/* Logs */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold">Debug Logs</h2>
            <div className="h-64 overflow-y-auto rounded bg-gray-900 p-4 font-mono text-sm text-green-400">
              {logs.length === 0 ? (
                <p className="text-gray-400">No logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold">Actions</h2>
            <div className="space-x-4">
              <button
                onClick={() => (window.location.href = "/admin")}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Go to Admin Page
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Reload Debug Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDebugPage;
