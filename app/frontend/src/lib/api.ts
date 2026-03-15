const BASE = "/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function convertKeys(obj: unknown, converter: (key: string) => string): unknown {
  if (Array.isArray(obj)) return obj.map((item) => convertKeys(item, converter));
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        converter(key),
        convertKeys(value, converter),
      ])
    );
  }
  return obj;
}

let _refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      if (!res.ok) return false;
      const data = await res.json();
      const camelData = convertKeys(data, snakeToCamel) as {
        accessToken?: string;
        refreshToken?: string;
      };
      if (camelData.accessToken && camelData.refreshToken) {
        setTokens(camelData.accessToken, camelData.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

export class ApiError extends Error {
  status: number;
  errorCode: string;
  constructor(status: number, errorCode: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

async function rawFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body = opts.body;
  if (typeof body === "string" && headers["Content-Type"] === "application/json") {
    try {
      const parsed = JSON.parse(body);
      body = JSON.stringify(convertKeys(parsed, camelToSnake));
    } catch {
      // not valid JSON, send as-is
    }
  }

  return fetch(`${BASE}${path}`, { ...opts, headers, body });
}

export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  let res = await rawFetch(path, opts);

  // 401 발생 시 refresh 1회 시도 후 재요청
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      res = await rawFetch(path, opts);
    }
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = errBody?.detail?.message || errBody?.detail || `HTTP ${res.status}`;
    const errorCode = errBody?.detail?.error_code || errBody?.detail?.errorCode || `HTTP_${res.status}`;
    throw new ApiError(res.status, errorCode, message);
  }
  if (res.status === 204) return undefined as T;
  const json = await res.json();
  return convertKeys(json, snakeToCamel) as T;
}
