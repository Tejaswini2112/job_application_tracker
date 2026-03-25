import { getApiBase } from "../config/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function buildUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBase()}${p}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function readApiErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.clone().text();
    if (!text) return res.statusText || `Request failed (${res.status})`;
    try {
      const j = JSON.parse(text) as { error?: string };
      return j.error ?? text;
    } catch {
      return text;
    }
  } catch {
    return res.statusText || `Request failed (${res.status})`;
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<Response> {
  const { skipAuth, ...init } = options;
  const headers = new Headers(init.headers);
  if (
    !headers.has("Content-Type") &&
    init.body &&
    typeof init.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (!skipAuth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path), {
      ...init,
      headers,
    });
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "Network error — check API URL and connection";
    throw new ApiError(msg, 0, e);
  }

  return res;
}

export async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function parseResponse<T>(res: Response): Promise<T> {
  const data = await parseJson<T>(res);
  if (!res.ok) {
    throw new ApiError(await readApiErrorMessage(res), res.status, data);
  }
  return data as T;
}

export async function assertOk(res: Response): Promise<void> {
  if (res.ok) return;
  const body = await parseJson<unknown>(res).catch(() => undefined);
  throw new ApiError(await readApiErrorMessage(res), res.status, body);
}
