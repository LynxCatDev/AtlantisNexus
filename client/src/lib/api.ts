const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string | null;
  signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {};

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.body instanceof FormData) {
      body = opts.body;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }
  }
  if (opts.accessToken) {
    headers["Authorization"] = `Bearer ${opts.accessToken}`;
  }

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body,
    credentials: "include",
    signal: opts.signal,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? Array.isArray((data as { message: unknown }).message)
          ? ((data as { message: string[] }).message.join(", ") as string)
          : String((data as { message: unknown }).message)
        : res.statusText) || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const apiBaseUrl = API_BASE_URL;
