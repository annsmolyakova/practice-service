"use client";

import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { clearAuthSession, getAuthSession } from "@/lib/auth-session";
import { authApi } from "@/lib/practice-api";

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const router = useRouter();
  const user = useCurrentUser();

  async function handleLogout() {
    const session = getAuthSession();

    if (session) {
      await authApi.logout(session.refreshToken).catch(() => undefined);
    }

    clearAuthSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 px-4 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Открыть меню"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg lg:text-xl">
          Сервис организации практики
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <span className="hidden max-w-[220px] truncate text-sm text-slate-600 sm:block">
          {user?.email ?? "Пользователь"}
        </span>

        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          className="text-sm"
        >
          Выйти
        </Button>
      </div>
    </header>
  );
}