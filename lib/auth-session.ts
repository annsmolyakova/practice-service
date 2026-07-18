import type { AuthSession, User } from "@/types/api";

const SESSION_STORAGE_KEY = "authSession";
const LEGACY_USER_STORAGE_KEY = "user";
const AUTH_SESSION_CHANGE_EVENT = "auth-session-change";

function notifyAuthSessionChanged() {
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
}

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
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
  notifyAuthSessionChanged();
}

export function updateAuthSessionUser(user: User) {
  const session = getAuthSession();

  if (session) {
    saveAuthSession({ ...session, user });
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
  notifyAuthSessionChanged();
}

export function subscribeAuthSession(listener: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === SESSION_STORAGE_KEY || event.key === null) {
      listener();
    }
  }

  window.addEventListener(AUTH_SESSION_CHANGE_EVENT, listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}
