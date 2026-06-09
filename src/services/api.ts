const API_BASE_URL =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  "http://localhost:3000/api/v1";

const ACCESS_TOKEN_KEY = "canvan_token";
const REFRESH_TOKEN_KEY = "canvan_refresh_token";

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export const TokenManager = {
  getAccess: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (accessToken: string, refreshToken?: string | null) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken !== undefined && refreshToken !== null)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

let forbiddenHandler: ((error: ApiError) => void) | null = null;

export const setForbiddenHandler = (
  handler: ((error: ApiError) => void) | null,
) => {
  forbiddenHandler = handler;
};

interface RequestOptions {
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

export class ApiClient {
  static async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, options);
  }

  static async post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("POST", path, { ...options, body });
  }

  static async patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  static async put<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PUT", path, { ...options, body });
  }

  static async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, options);
  }

  private static async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { body, auth = true } = options;
    const headers: Record<string, string | undefined> = {};
    if (body !== undefined) headers["content-type"] = "application/json";
    if (auth) {
      const token = TokenManager.getAccess();
      if (token) headers.authorization = `Bearer ${token}`;
    }

    const cleanHeaders = Object.fromEntries(
      Object.entries(headers).filter(
        ([, headerValue]) => headerValue !== undefined,
      ),
    ) as Record<string, string>;

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: cleanHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: options.signal,
    });

    if (response.status === 204) return undefined as T;
    const rawText = await response.text();
    const parsedBody = rawText ? parseJsonSafe(rawText) : null;

    if (!response.ok) {
      const message =
        (typeof parsedBody === "object" &&
        parsedBody &&
        "message" in parsedBody
          ? String((parsedBody as { message: unknown }).message)
          : null) ||
        response.statusText ||
        "Request failed";
      const error = new ApiError(message, response.status, parsedBody);
      if (response.status === 403 && forbiddenHandler) {
        forbiddenHandler(error);
      }
      throw error;
    }

    return parsedBody as T;
  }
}

function parseJsonSafe(rawText: string): unknown {
  try {
    return JSON.parse(rawText);
  } catch {
    return rawText;
  }
}
