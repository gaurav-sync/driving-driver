import { API_BASE_URL } from "./client";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const mergedHeaders: HeadersInit = {
    Accept: "application/json",
    ...(headers ?? {}),
  };
  if (token) {
    (mergedHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  if (rest.body && !(mergedHeaders as Record<string, string>)["Content-Type"]) {
    (mergedHeaders as Record<string, string>)["Content-Type"] =
      "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, { ...rest, headers: mergedHeaders });
  } catch {
    throw new ApiError(0, "network_error", { error: "network_error" });
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const err =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : "request_failed";
    throw new ApiError(response.status, err, data);
  }

  return data as T;
}