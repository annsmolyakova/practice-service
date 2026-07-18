"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { getAdminDashboardStats } from "@/lib/dashboard-statistics";

export default function AdminPage() {
  const router = useRouter();
  const { stats, isLoading, loadError, reload } = useDashboardStats(getAdminDashboardStats);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout>
        <h1 className="mb-8 text-4xl font-bold">Панель администратора</h1>

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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Когорты</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{isLoading ? "…" : stats?.cohorts}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Заявки</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{isLoading ? "…" : stats?.applications}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Документы</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{isLoading ? "…" : stats?.documents}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Задачи</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{isLoading ? "…" : stats?.tasks}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
