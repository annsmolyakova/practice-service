import { clearAuthSession, getAuthSession, saveAuthSession } from "@/lib/auth-session";
import type { AuthSession } from "@/types/api";

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json().catch(() => null)) as T | { message?: string } | null;

  if (!response.ok) {
    const message = typeof data === "object" && data !== null && "message" in data && data.message
      ? data.message
      : "Не удалось выполнить запрос";

    throw new ApiError(message, response.status);
  }

  return data as T;
}

async function refreshSession(): Promise<AuthSession | null> {
  const session = getAuthSession();

  if (!session?.refreshToken) {
    return null;
  }

  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  if (!response.ok) {
    clearAuthSession();
    return null;
  }

  const refreshedSession = (await response.json()) as AuthSession;
  saveAuthSession(refreshedSession);
  return refreshedSession;
}

async function authenticatedFetch(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const {
    authenticated = true,
    retryOnUnauthorized = true,
    headers,
    ...requestOptions
  } = options;
  const session = getAuthSession();
  const requestHeaders = new Headers(headers);

  if (requestOptions.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (authenticated && session?.accessToken) {
    requestHeaders.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`/api${path}`, {
    ...requestOptions,
    headers: requestHeaders,
  });

  if (authenticated && response.status === 401 && retryOnUnauthorized) {
    const refreshedSession = await refreshSession();

    if (refreshedSession) {
      return authenticatedFetch(path, {
        ...options,
        retryOnUnauthorized: false,
      });
    }
  }

  return response;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await authenticatedFetch(path, options);

  return parseResponse<T>(response);
}

export type ApiFile = {
  blob: Blob;
  fileName: string;
};

function getResponseFileName(response: Response, fallbackFileName: string) {
  const contentDisposition = response.headers.get("Content-Disposition");
  const encodedFileName = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const quotedFileName = contentDisposition?.match(/filename="([^"]+)"/i)?.[1];

  if (encodedFileName) {
    return decodeURIComponent(encodedFileName);
  }

  return quotedFileName ?? fallbackFileName;
}

export async function apiFileRequest(
  path: string,
  fallbackFileName: string,
  options: ApiRequestOptions = {},
): Promise<ApiFile> {
  const response = await authenticatedFetch(path, options);

  if (!response.ok) {
    await parseResponse<never>(response);
  }

  return {
    blob: await response.blob(),
    fileName: getResponseFileName(response, fallbackFileName),
  };
}
