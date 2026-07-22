"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  type LucideIcon,
  Home,
  Users,
  ClipboardList,
  FileText,
  Briefcase,
  UserRound,
  X,
} from "lucide-react";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const adminNavigation: NavigationItem[] = [
  { href: "/admin/cohorts", label: "Когорты", icon: Users },
  { href: "/admin/applications", label: "Заявки", icon: ClipboardList },
  { href: "/admin/documents", label: "Документы", icon: FileText },
  { href: "/admin/tasks", label: "Задачи", icon: Briefcase },
];

const studentNavigation: NavigationItem[] = [
  { href: "/student/applications", label: "Мои заявки", icon: ClipboardList },
  { href: "/student/profile", label: "Профиль практики", icon: UserRound },
  { href: "/student/assignments", label: "Тестовые задания", icon: ClipboardList },
  { href: "/student/documents", label: "Документы", icon: FileText },
  { href: "/student/tasks", label: "Задачи", icon: Briefcase },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const user = useCurrentUser();
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";
  const homeHref = isAdmin ? "/admin" : "/student";
  const navigation = isAdmin ? adminNavigation : studentNavigation;

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
          {[{ href: homeHref, label: "Главная", icon: Home }, ...navigation].map(
            ({ href, label, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-700",
                    isActive && "bg-slate-700 shadow-sm",
                  )}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              );
            },
          )}
        </nav>
      </aside>
    </>
  );
}
