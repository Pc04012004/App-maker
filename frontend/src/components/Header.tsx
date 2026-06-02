"use client";

import { Layers } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Layers className="h-7 w-7 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            SDLC<span className="text-indigo-600">Flow</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
