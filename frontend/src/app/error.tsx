"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error while rendering", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-10">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted">
        {error.message || "An unexpected error occurred."}
        {error.digest ? ` (ref: ${error.digest})` : ""}
      </p>
      <button
        onClick={() => retry()}
        className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
