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

    const storedUser =
      localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });

  function handleLogout() {
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <header
      className="
        h-20
        bg-white/80
        backdrop-blur-md
        border-b
        border-slate-200
        flex
        items-center
        justify-between
        px-8
        sticky
        top-0
        z-50
      "
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Сервис организации практики
        </h1>

        <p className="text-sm text-slate-500">
          Управление практикой студентов
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium text-slate-800">
            {user?.fullName ??
              "Пользователь"}
          </p>

          <p className="text-sm text-slate-500 capitalize">
            {user?.role === "admin"
              ? "Администратор"
              : "Студент"}
          </p>
        </div>

        <div
          className="
            w-11 h-11
            rounded-full
            bg-slate-200
            flex
            items-center
            justify-center
            font-semibold
            text-slate-700
          "
        >
          {user?.fullName?.[0] ?? "П"}
        </div>

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