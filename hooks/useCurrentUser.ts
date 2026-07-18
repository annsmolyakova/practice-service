"use client";

import { useAuth } from "@/components/auth/auth-provider";

export function useCurrentUser() {
  return useAuth().user;
}
