"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blush-600">Something went wrong</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">We hit an error</h1>
          <p className="mt-3 text-sm text-slate-600">
            An unexpected error occurred. Please try again, or go back to the homepage. If the problem continues,
            contact support.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center rounded-full bg-blush-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blush-600"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-800 transition hover:border-blush-300 hover:text-blush-700"
            >
              Go home
            </Link>
          </div>
          {error?.digest && (
            <p className="mt-4 text-xs text-slate-400">Error reference: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
