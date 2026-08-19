"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error in root layout", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", padding: "2.5rem" }}>
        <h2>Tracker OS failed to load</h2>
        <p>
          {error.message || "An unexpected error occurred."}
          {error.digest ? ` (ref: ${error.digest})` : ""}
        </p>
        <button onClick={() => retry()}>Try again</button>
      </body>
    </html>
  );
}
