const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  "http://localhost:3000/api/v1";

console.log(import.meta.env.VITE_API_BASE);

const TOKEN_KEY = "canvan_token";
const REFRESH_KEY = "canvan_refresh_token";

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setTokens(access: string, refresh?: string | null) {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

export async function api<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (auth) {
    const tok = getAccessToken();
    if (tok) headers.authorization = `Bearer ${tok}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg =
      (typeof data === "object" && data && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export const API_BASE_URL = API_BASE;
