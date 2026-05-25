"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, ArrowRight, Key, CheckCircle } from "lucide-react";

interface RequirementInputProps {
  onSubmit: (requirement: string, apiKey: string) => void;
}

export default function RequirementInput({ onSubmit }: RequirementInputProps) {
  const [requirement, setRequirement] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: { hasApiKey: boolean }) => {
        setHasEnvKey(data.hasApiKey);
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setRequirement(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!requirement.trim()) return;
    onSubmit(requirement, apiKey);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Enter Your Requirements
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Paste your requirement document or upload a text file. The AI will
            guide you through every SDLC phase.
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="requirement"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Requirement Document
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.doc,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <textarea
            id="requirement"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder={`Example:

Build an e-commerce platform with the following features:
- User registration and authentication (email + social login)
- Product catalog with search and filters
- Shopping cart and checkout flow
- Payment integration (Stripe)
- Order management dashboard
- Admin panel for inventory management
- Real-time notifications
- Mobile-responsive design

The platform should handle 10,000 concurrent users and comply with GDPR...`}
            className="h-64 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-400">
            {requirement.length} characters
          </p>
        </div>

        <div className="mb-6">
          {hasEnvKey ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Groq API key configured via environment
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <Key className="h-4 w-4" />
                {showApiKey ? "Hide" : "Set"} Groq API Key
              </button>
              {showApiKey && (
                <div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <p className="mt-1 text-xs text-zinc-400">
                    Your key is sent only to Groq and is never stored on our
                    servers.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={!requirement.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            Start SDLC Process
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
