"use client";

import Link from "next/link";
import { X } from "lucide-react";

import {
  Home,
  Users,
  ClipboardList,
  FileText,
  Briefcase,
  LayoutDashboard,
  UserRound,
} from "lucide-react";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const user = useCurrentUser();
  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Затемнение фона на мобильных */}
      {isOpen && (
        <button
          type="button"
          aria-label="Закрыть меню"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-72 flex-col
          bg-gradient-to-b from-slate-900 to-slate-800
          p-6 text-white shadow-2xl
          transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Заголовок меню */}
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-wide">
            Практика
          </h2>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-slate-700 hover:text-white lg:hidden"
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-2">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
          >
            <Home size={20} />
            Главная
          </Link>

          {isAdmin ? (
            <>
              <Link
                href="/admin/cohorts"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
              >
                <Users size={20} />
                Когорты
              </Link>

              <Link
                href="/admin/applications"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
              >
                <ClipboardList size={20} />
                Заявки
              </Link>

              <Link
                href="/admin/documents"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
              >
                <FileText size={20} />
                Документы
              </Link>

              <Link
                href="/admin/tasks"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
              >
                <Briefcase size={20} />
                Задачи
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/student"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
              >
                <LayoutDashboard size={20} />
                Личный кабинет
              </Link>

              <Link
                href="/student/applications"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
              >
                <ClipboardList size={20} />
                Мои заявки
              </Link>

              <Link
                href="/student/profile"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
              >
                <UserRound size={20} />
                Профиль практики
              </Link>

              <Link
                href="/student/assignments"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
              >
                <ClipboardList size={20} />
                Тестовые задания
              </Link>

              <Link
                href="/student/documents"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
              >
                <FileText size={20} />
                Документы
              </Link>

              <Link
                href="/student/tasks"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700"
              >
                <Briefcase size={20} />
                Задачи
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}