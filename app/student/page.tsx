"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { getStudentDashboardStats } from "@/lib/dashboard-statistics";

export default function StudentPage() {
  const { stats, isLoading, loadError, reload } = useDashboardStats(getStudentDashboardStats);

  return (
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>
        <h1 className="mb-8 text-4xl font-bold">Личный кабинет студента</h1>

        {loadError ? (
          <Card>
            <CardContent className="space-y-4 py-8 text-center">
              <p className="text-red-600">{loadError}</p>
              <Button type="button" variant="outline" onClick={reload}>
                Повторить
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Мои заявки</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{isLoading ? "…" : stats?.applications}</p>
                <p className="mt-2 text-sm text-slate-500">Поданные заявки на практику</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Документы</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{isLoading ? "…" : stats?.documents}</p>
                <p className="mt-2 text-sm text-slate-500">Загруженные отчёты</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Задачи</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{isLoading ? "…" : stats?.tasks}</p>
                <p className="mt-2 text-sm text-slate-500">Задачи текущей недели</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Добро пожаловать!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Здесь будут отображаться ваши заявки на практику, документы, задачи и уведомления.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
