"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { getAdminDashboardStats } from "@/lib/dashboard-statistics";

import {
  Users,
  FileText,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

export default function AdminPage() {
  const { stats, isLoading, loadError, reload } = useDashboardStats(getAdminDashboardStats);

  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout>
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Панель администратора
            </h1>

            <p className="mt-2 text-slate-500">
              Управление практикой студентов
            </p>
          </div>
        </div>

        {loadError ? (
          <Card className="rounded-2xl border-0 shadow-md">
            <CardContent className="space-y-4 py-10 text-center">
              <p className="text-red-600">{loadError}</p>

              <Button
                type="button"
                variant="outline"
                onClick={reload}
              >
                Повторить
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Card className="rounded-2xl border-0 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-slate-500">
                      Когорты
                    </p>

                    <p className="mt-2 text-4xl font-bold">
                      {isLoading ? "…" : stats?.cohorts}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-100 p-4">
                    <GraduationCap className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-slate-500">
                      Заявки
                    </p>

                    <p className="mt-2 text-4xl font-bold">
                      {isLoading ? "…" : stats?.applications}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-100 p-4">
                    <Users className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-slate-500">
                      Документы
                    </p>

                    <p className="mt-2 text-4xl font-bold">
                      {isLoading ? "…" : stats?.documents}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-100 p-4">
                    <FileText className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-slate-500">
                      Задачи
                    </p>

                    <p className="mt-2 text-4xl font-bold">
                      {isLoading ? "…" : stats?.tasks}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-violet-100 p-4">
                    <ClipboardList className="h-8 w-8 text-violet-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8 rounded-2xl border-0 bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold">
                  Добро пожаловать!
                </h2>

                <p className="mt-3 max-w-2xl text-slate-200">
                  Здесь вы можете управлять когортами, просматривать
                  заявки студентов, работать с документами и
                  контролировать выполнение задач.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </DashboardLayout>      
    </ProtectedRoute>
  );
}
