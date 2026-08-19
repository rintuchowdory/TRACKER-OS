const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
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
