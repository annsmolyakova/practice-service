"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type User = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export default function Header() {
  const router = useRouter();

  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  function handleLogout() {
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-8">
      <h1 className="text-xl font-bold">
        Сервис организации практики
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">
          {user?.fullName ?? "Пользователь"}
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