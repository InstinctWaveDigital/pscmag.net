"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global crash caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#0B0E1A] text-white antialiased font-sans">
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="max-w-[480px]">
            <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-red-500 bg-red-950 px-2.5 py-0.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-red-400">
              System Error
            </span>
            <h1 className="mt-4 font-bold text-3xl sm:text-4xl tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#B9BDD4]">
              A top-level system error has occurred in the application shell.
              Our technical desk has been notified. You can try recovering the layout.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 active:scale-[0.97] transition-all"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 active:scale-[0.97] transition-all"
              >
                Back to homepage
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
