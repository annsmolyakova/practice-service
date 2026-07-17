"use client";

import Link from "next/link";

import {
  Home,
  Users,
  ClipboardList,
  FileText,
  Briefcase,
  LayoutDashboard,
  UserRound,
} from "lucide-react";

export default function Sidebar() {
  const user =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem("user") || "{}"
        )
      : null;

  const isAdmin =
    user?.role === "admin";

  return (
    <aside
      className="
        w-72
        min-h-screen
        bg-gradient-to-b
        from-slate-900
        to-slate-800
        text-white
        p-6
        shadow-2xl
      "
    >
      <h2 className="text-3xl font-bold mb-10 tracking-wide">
        Практика
      </h2>

      <nav className="space-y-2">
        <Link
          href="/"
          className="
            flex items-center gap-3
            rounded-xl
            px-4 py-3
            hover:bg-slate-700
            transition-all
            duration-200
          "
        >
          <Home size={20} />
          Главная
        </Link>

        {isAdmin ? (
          <>
            <Link
              href="/admin/cohorts"
              className="
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                hover:bg-slate-700
                transition-all
                duration-200
              "
            >
              <Users size={20} />
              Когорты
            </Link>

            <Link
              href="/admin/applications"
              className="
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                hover:bg-slate-700
                transition-all
                duration-200
              "
            >
              <ClipboardList size={20} />
              Заявки
            </Link>

            <Link
              href="/admin/documents"
              className="
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                hover:bg-slate-700
                transition-all
                duration-200
              "
            >
              <FileText size={20} />
              Документы
            </Link>

            <Link
              href="/admin/tasks"
              className="
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                hover:bg-slate-700
                transition-all
                duration-200
              "
            >
              <Briefcase size={20} />
              Задачи
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/student"
              className="
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                hover:bg-slate-700
                transition-all
                duration-200
              "
            >
              <LayoutDashboard size={20} />
              Личный кабинет
            </Link>

            <Link
              href="/student/applications"
              className="
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                hover:bg-slate-700
                transition-all
                duration-200
              "
            >
              <ClipboardList size={20} />
              Мои заявки
            </Link>

            <Link
              href="/student/profile"
              className="
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                hover:bg-slate-700
                transition-all
                duration-200
              "
            >
              <UserRound size={20} />
              Профиль практики
            </Link>

            <Link
              href="/student/documents"
              className="
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                hover:bg-slate-700
                transition-all
                duration-200
              "
            >
              <FileText size={20} />
              Документы
            </Link>

            <Link
              href="/student/tasks"
              className="
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                hover:bg-slate-700
                transition-all
                duration-200
              "
            >
              <Briefcase size={20} />
              Задачи
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
