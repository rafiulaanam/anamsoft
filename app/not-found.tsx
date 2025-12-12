import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blush-600">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Please check the URL or go back
          to the homepage.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-blush-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blush-600"
          >
            Go home
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-800 transition hover:border-blush-300 hover:text-blush-700"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
