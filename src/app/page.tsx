"use client";

import { useState } from "react";
import Header from "@/components/Header";
import RequirementInput from "@/components/RequirementInput";
import SDLCWizard from "@/components/SDLCWizard";
import {
  ClipboardList,
  Layout,
  Cpu,
  ListTodo,
  Code,
  TestTube,
  Rocket,
  Globe,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Requirements Analysis",
    desc: "Extract and organize functional & non-functional requirements",
  },
  {
    icon: Layout,
    title: "System Design",
    desc: "High-level architecture, data flow, and API design",
  },
  {
    icon: Cpu,
    title: "Technical Architecture",
    desc: "Technology stack, infrastructure, and project structure",
  },
  {
    icon: ListTodo,
    title: "Implementation Plan",
    desc: "Sprint breakdown, task estimates, and milestones",
  },
  {
    icon: Code,
    title: "Code Generation",
    desc: "Production-ready code for your entire application",
  },
  {
    icon: TestTube,
    title: "Testing Strategy",
    desc: "Test cases, test code, and quality assurance plan",
  },
  {
    icon: Rocket,
    title: "Deployment Plan",
    desc: "CI/CD pipeline, Docker config, and go-live checklist",
  },
  {
    icon: Globe,
    title: "Deployment",
    desc: "Deploy your generated application live with one click",
  },
];

type AppView = "landing" | "input" | "wizard";

interface ProjectData {
  requirement: string;
  apiKey: string;
}

export default function HomePage() {
  const [view, setView] = useState<AppView>("landing");
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  const handleSubmit = (requirement: string, apiKey: string) => {
    setProjectData({ requirement, apiKey });
    setView("wizard");
  };

  const handleBackToHome = () => {
    setView("landing");
    setProjectData(null);
  };

  if (view === "wizard" && projectData) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <SDLCWizard
            requirementDocument={projectData.requirement}
            apiKey={projectData.apiKey}
            onBack={handleBackToHome}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      <Header />

      <main className="flex-1">
        {view === "landing" ? (
          <>
            <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 lg:px-8">
              <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-100/50 blur-3xl dark:bg-indigo-900/20" />
              </div>
              <div className="mx-auto max-w-4xl text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400">
                  AI-Powered Software Development
                </div>
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
                  From Requirements to
                  <br />
                  <span className="text-indigo-600 dark:text-indigo-400">
                    Production-Ready Code
                  </span>
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                  Give us your requirement document, and our AI walks you
                  through every phase of the Software Development Life Cycle —
                  with your approval at each step.
                </p>
                <button
                  onClick={() => setView("input")}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-medium text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </section>

            <section className="px-4 pb-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-5xl">
                <h2 className="mb-4 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Complete SDLC in 8 Steps
                </h2>
                <p className="mb-12 text-center text-zinc-500 dark:text-zinc-400">
                  Each step produces detailed output that you can review, edit,
                  and approve before moving on.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {STEPS.map((step, index) => (
                    <div
                      key={step.title}
                      className="group relative rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-800"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                          <step.icon className="h-5 w-5" />
                        </span>
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                          STEP {index + 1}
                        </span>
                      </div>
                      <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                        {step.title}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <button
                    onClick={() => setView("input")}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Start Building Your Application
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto mb-6 max-w-4xl">
              <button
                onClick={() => setView("landing")}
                className="mb-4 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                &larr; Back to overview
              </button>
            </div>
            <RequirementInput onSubmit={handleSubmit} />
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
          SDLCFlow — AI-Powered Software Development Life Cycle
        </div>
      </footer>
    </div>
  );
}
