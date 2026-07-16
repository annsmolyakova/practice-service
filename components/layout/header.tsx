"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearAuthSession, getAuthSession } from "@/lib/auth-session";
import { authApi } from "@/lib/practice-api";
import type { User } from "@/types/api";

export default function Header() {
  const router = useRouter();

  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return getAuthSession()?.user ?? null;
  });

  async function handleLogout() {
    const session = getAuthSession();

    if (session) {
      await authApi.logout(session.refreshToken).catch(() => undefined);
    }

    clearAuthSession();
    router.push("/login");
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-8">
      <h1 className="text-xl font-bold">
        Сервис организации практики
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">
          {user?.email ?? "Пользователь"}
        </span>

        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
        >
          Выйти
        </Button>
      </div>
    </header>
  );
}