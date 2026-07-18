"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { ApiError, refreshAuthSession } from "@/lib/api-client";
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
  subscribeAuthSession,
  updateAuthSessionUser,
} from "@/lib/auth-session";
import { authApi } from "@/lib/practice-api";
import type { AuthSession, User } from "@/types/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthState = {
  status: AuthStatus;
  user: User | null;
  error: string;
};

type AuthContextValue = AuthState & {
  retry: () => void;
  setSession: (session: AuthSession) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitialAuthState(): AuthState {
  if (typeof window === "undefined") {
    return { status: "loading", user: null, error: "" };
  }

  const session = getAuthSession();

  return session
    ? { status: "loading", user: session.user, error: "" }
    : { status: "unauthenticated", user: null, error: "" };
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialAuthState);
  const validationIdRef = useRef(0);

  const synchronizeSession = useCallback(() => {
    validationIdRef.current += 1;
    const session = getAuthSession();

    setState(
      session
        ? { status: "authenticated", user: session.user, error: "" }
        : { status: "unauthenticated", user: null, error: "" },
    );
  }, []);

  const setSession = useCallback((session: AuthSession) => {
    saveAuthSession(session);
    setState({ status: "authenticated", user: session.user, error: "" });
  }, []);

  const validateSession = useCallback(async () => {
    const validationId = validationIdRef.current + 1;
    validationIdRef.current = validationId;
    const session = getAuthSession();

    if (!session) {
      setState({ status: "unauthenticated", user: null, error: "" });
      return;
    }

    setState({ status: "loading", user: session.user, error: "" });

    try {
      const { user } = await authApi.getMe();

      if (validationIdRef.current !== validationId) {
        return;
      }

      if (user.role !== session.user.role) {
        const refreshedSession = await refreshAuthSession();

        if (!refreshedSession) {
          clearAuthSession();
          setState({ status: "unauthenticated", user: null, error: "" });
        }

        return;
      }

      updateAuthSessionUser(user);
      setState({ status: "authenticated", user, error: "" });
    } catch (error) {
      if (validationIdRef.current !== validationId) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        clearAuthSession();
        setState({ status: "unauthenticated", user: null, error: "" });
        return;
      }

      setState({
        status: "error",
        user: session.user,
        error: error instanceof Error ? error.message : "Не удалось проверить сессию",
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeAuthSession(synchronizeSession);
    const validationTimeout = getAuthSession()
      ? window.setTimeout(() => void validateSession(), 0)
      : null;

    return () => {
      unsubscribe();

      if (validationTimeout !== null) {
        window.clearTimeout(validationTimeout);
      }
    };
  }, [synchronizeSession, validateSession]);

  return (
    <AuthContext.Provider value={{ ...state, retry: validateSession, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
