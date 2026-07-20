"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { useDashboardStats } from "@/hooks/useDashboardStats";
import { getStudentDashboardStats } from "@/lib/dashboard-statistics";

import {
  FileText,
  ClipboardList,
  Send,
  GraduationCap,
} from "lucide-react";

export default function StudentPage() {
  const {
    stats,
    isLoading,
    loadError,
    reload,
  } = useDashboardStats(getStudentDashboardStats);

  return (
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>

        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Личный кабинет студента
          </h1>

          <p className="mt-2 text-slate-500">
            Управление практикой, документами и задачами
          </p>
        </div>


        {loadError ? (
          <Card className="rounded-2xl border-0 shadow-md">
            <CardContent className="space-y-4 py-10 text-center">
              <p className="text-red-600">
                {loadError}
              </p>

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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">


              <Card className="rounded-2xl border-0 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex items-center justify-between p-6">

                  <div>
                    <p className="text-sm text-slate-500">
                      Мои заявки
                    </p>

                    <p className="mt-2 text-4xl font-bold">
                      {isLoading ? "…" : stats?.applications}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Поданные заявки на практику
                    </p>
                  </div>


                  <div className="rounded-2xl bg-blue-100 p-4">
                    <Send className="h-8 w-8 text-blue-600" />
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

                    <p className="mt-2 text-sm text-slate-500">
                      Отчёты и документы практики
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

                    <p className="mt-2 text-sm text-slate-500">
                      Задачи текущей недели
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

                <div className="flex items-start gap-5">

                  <div className="rounded-2xl bg-white/10 p-4">
                    <GraduationCap className="h-10 w-10" />
                  </div>


                  <div>
                    <h2 className="text-2xl font-semibold">
                      Добро пожаловать!
                    </h2>

                    <p className="mt-3 max-w-2xl text-slate-200">
                      Здесь вы можете отправлять заявки на практику,
                      получать документы, выполнять задачи и
                      отслеживать статус прохождения практики.
                    </p>
                  </div>

                </div>

              </CardContent>

            </Card>

          </>
        )}

      </DashboardLayout>
    </ProtectedRoute>
  );
}