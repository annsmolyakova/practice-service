"use client";

import { useMemo, useSyncExternalStore } from "react";

import type { User } from "@/types/api";

const USER_STORAGE_KEY = "user";

function subscribe() {
  return () => undefined;
}

export function useCurrentUser() {
  const storedUser = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(USER_STORAGE_KEY),
    () => undefined,
  );

  return useMemo(() => {
    if (storedUser === undefined) {
      return undefined;
    }

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      return null;
    }
  }, [storedUser]);
}
