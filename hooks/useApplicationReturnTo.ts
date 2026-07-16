"use client";

import { useSyncExternalStore } from "react";

import { getApplicationReturnTo } from "@/lib/auth-return";

export function useApplicationReturnTo() {
  return useSyncExternalStore(
    () => () => undefined,
    () => getApplicationReturnTo(window.location.search),
    () => null,
  );
}
