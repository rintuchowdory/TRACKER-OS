import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, NetworkError, api, apiErrorMessage } from "./api";

type FetchMock = ReturnType<typeof vi.fn>;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

function errorResponse(status: number, body = "") {
  return {
    ok: false,
    status,
    json: async () => {
      throw new Error("not json");
    },
    text: async () => body,
  };
}

const entry = {
  id: 1,
  entry_date: "2026-01-02",
  item_1: "a",
  item_2: "b",
  item_3: "c",
  created_at: "2026-01-02T03:04:05",
};

let fetchMock: FetchMock;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("ApiError", () => {
  it("keeps the status code and message", () => {
    const error = new ApiError(404, "missing");
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(404);
    expect(error.message).toBe("missing");
  });
});

describe("api.gratitude.list", () => {
  it("GETs the collection and returns the parsed body", async () => {
    fetchMock.mockResolvedValue(jsonResponse([entry]));

    await expect(api.gratitude.list()).resolves.toEqual([entry]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8000/api/gratitude");
    expect(init.method).toBeUndefined();
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
  });
});

describe("api.gratitude.today", () => {
  it("GETs today's entry", async () => {
    fetchMock.mockResolvedValue(jsonResponse(entry));

    await expect(api.gratitude.today()).resolves.toEqual(entry);
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8000/api/gratitude/today");
  });

  it("passes through a null body", async () => {
    fetchMock.mockResolvedValue(jsonResponse(null));

    await expect(api.gratitude.today()).resolves.toBeNull();
  });
});

describe("api.gratitude.save", () => {
  it("POSTs the payload as JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse(entry));

    const payload = { item_1: "a", item_2: "b", item_3: "c" };
    await expect(api.gratitude.save(payload)).resolves.toEqual(entry);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8000/api/gratitude");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify(payload));
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
  });
});

describe("error handling", () => {
  it("throws ApiError with the response body as the message", async () => {
    fetchMock.mockResolvedValue(errorResponse(400, "bad items"));

    await expect(api.gratitude.list()).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "bad items",
      body: "bad items",
    });
    await expect(api.gratitude.list()).rejects.toBeInstanceOf(ApiError);
  });

  it("falls back to a generic message when the body is empty", async () => {
    fetchMock.mockResolvedValue(errorResponse(500, ""));

    await expect(api.gratitude.list()).rejects.toThrowError("Request failed (500)");
  });

  it("falls back to a generic message when the body cannot be read", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => {
        throw new Error("stream error");
      },
    });

    await expect(api.gratitude.list()).rejects.toThrowError("Request failed (503)");
  });

  it("uses the FastAPI detail field as the message when the body is JSON", async () => {
    fetchMock.mockResolvedValue(
      errorResponse(503, JSON.stringify({ detail: "Database unavailable, please retry." }))
    );

    await expect(api.gratitude.list()).rejects.toThrowError(
      "Database unavailable, please retry."
    );
  });

  it("wraps network failures in a NetworkError that keeps the cause", async () => {
    const cause = new TypeError("network down");
    fetchMock.mockRejectedValue(cause);

    const rejection = api.gratitude.list();
    await expect(rejection).rejects.toBeInstanceOf(NetworkError);
    await expect(rejection).rejects.toMatchObject({ cause });
  });

  it("wraps a malformed success body in a NetworkError", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
      text: async () => "<html>",
    });

    await expect(api.gratitude.list()).rejects.toBeInstanceOf(NetworkError);
  });

  it("arms an abort signal so a hanging request cannot wait forever", async () => {
    fetchMock.mockResolvedValue(jsonResponse([entry]));

    await api.gratitude.list();

    const signal: AbortSignal = fetchMock.mock.calls[0][1].signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it("reports an aborted request as a timeout", async () => {
    fetchMock.mockRejectedValue(new DOMException("aborted", "TimeoutError"));

    await expect(api.gratitude.list()).rejects.toThrowError(/timed out after 15000ms/);
  });
});

describe("apiErrorMessage", () => {
  it("passes the status and detail through for HTTP failures", () => {
    const message = apiErrorMessage(
      new ApiError(409, "conflict"),
      (status, detail) => `failed (${status}): ${detail}`,
      "unreachable"
    );

    expect(message).toBe("failed (409): conflict");
  });

  it("reports anything else as unreachable", () => {
    expect(apiErrorMessage(new NetworkError("down"), () => "http", "unreachable")).toBe(
      "unreachable"
    );
  });
});

describe("204 responses", () => {
  it("resolves to undefined without parsing a body", async () => {
    const json = vi.fn();
    fetchMock.mockResolvedValue({ ok: true, status: 204, json, text: async () => "" });

    await expect(api.gratitude.today()).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });
});

describe("base URL configuration", () => {
  it("uses NEXT_PUBLIC_API_URL when set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    vi.resetModules();

    const { api: configuredApi } = await import("./api");
    fetchMock.mockResolvedValue(jsonResponse([]));
    await configuredApi.gratitude.list();

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.example.com/api/gratitude");
  });

  it("defaults to localhost when the variable is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", undefined);
    vi.resetModules();

    const { api: defaultApi } = await import("./api");
    fetchMock.mockResolvedValue(jsonResponse([]));
    await defaultApi.gratitude.list();

    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8000/api/gratitude");
  });
});
