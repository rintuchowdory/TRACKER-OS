const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  status: number;
  body: string;
  constructor(status: number, message: string, body = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** The request never reached the API, or the response was unusable. */
export class NetworkError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "NetworkError";
  }
}

function errorMessage(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as { detail?: unknown };
    if (typeof parsed.detail === "string" && parsed.detail) return parsed.detail;
  } catch {
    // Body is not JSON; fall back to the raw text below.
  }
  return body.trim() || `Request failed (${status})`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new NetworkError(
        `Request to ${path} timed out after ${REQUEST_TIMEOUT_MS}ms`,
        { cause: err }
      );
    }
    throw new NetworkError(`Could not reach the API at ${API_URL}${path}`, {
      cause: err,
    });
  }

  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch (err) {
      console.error(`Could not read error body for ${path}`, err);
    }
    throw new ApiError(res.status, errorMessage(res.status, body), body);
  }

  if (res.status === 204) return undefined as T;

  try {
    return (await res.json()) as T;
  } catch (err) {
    throw new NetworkError(`API returned a malformed response for ${path}`, {
      cause: err,
    });
  }
}

export interface GratitudeEntry {
  id: number;
  entry_date: string;
  item_1: string;
  item_2: string;
  item_3: string;
  created_at: string;
}

export const api = {
  gratitude: {
    list: () => request<GratitudeEntry[]>("/api/gratitude"),
    today: () => request<GratitudeEntry | null>("/api/gratitude/today"),
    save: (data: { item_1: string; item_2: string; item_3: string }) =>
      request<GratitudeEntry>("/api/gratitude", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
