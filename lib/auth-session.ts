import type { AuthSession } from "@/types/api";

const SESSION_STORAGE_KEY = "authSession";
const USER_STORAGE_KEY = "user";

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}
