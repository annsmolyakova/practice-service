"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/layout/protected-route";

import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StudentPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>
        <h1 className="text-4xl font-bold mb-8">
          Личный кабинет студента
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Мои заявки</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">1</p>
              <p className="text-sm text-slate-500 mt-2">
                Поданная заявка на практику
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Документы</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">3</p>
              <p className="text-sm text-slate-500 mt-2">
                Загруженные документы
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Задачи</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">2</p>
              <p className="text-sm text-slate-500 mt-2">
                Активные задачи
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Добро пожаловать!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Здесь будут отображаться ваши заявки на практику,
              документы, задачи и уведомления.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}