"use client";

import { useCallback, useEffect, useState } from "react";

import EditApplicationDialog from "@/components/applications/edit-application-dialog";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applicationsApi } from "@/lib/practice-api";
import type { PracticeApplication } from "@/types/api";

const STATUS_LABELS: Record<PracticeApplication["status"], string> = {
  pending: "На рассмотрении",
  approved: "Одобрена",
  rejected: "Отклонена",
};

const STATUS_STYLES: Record<PracticeApplication["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<PracticeApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingApplication, setEditingApplication] = useState<PracticeApplication | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await applicationsApi.listMine();
      setApplications(
        [...response.items].sort(
          (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
        ),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Не удалось загрузить заявки");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    applicationsApi
      .listMine()
      .then((response) => {
        if (!isCancelled) {
          setApplications(
            [...response.items].sort(
              (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
            ),
          );
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : "Не удалось загрузить заявки");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  function handleApplicationUpdated(updatedApplication: PracticeApplication) {
    setApplications((current) =>
      current.map((application) =>
        application.id === updatedApplication.id ? updatedApplication : application,
      ),
    );
    setEditingApplication(null);
  }

  return (
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Мои заявки</h1>
          <p className="mt-2 text-slate-600">
            Новая заявка подаётся по публичной ссылке выбранной когорты.
          </p>
        </div>

        {isLoading && <p className="text-slate-600">Загрузка заявок...</p>}

        {!isLoading && loadError && (
          <Card>
            <CardContent className="space-y-4 py-8 text-center">
              <p className="text-red-600">{loadError}</p>
              <Button type="button" variant="outline" onClick={loadApplications}>
                Повторить
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !loadError && applications.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-600">
              У вас пока нет заявок.
            </CardContent>
          </Card>
        )}

        {!isLoading && !loadError && applications.length > 0 && (
          <div className="space-y-6">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle>{application.cohort.title}</CardTitle>
                    <p className="text-sm text-slate-500">
                      Подана {formatDateTime(application.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[application.status]}`}
                  >
                    {STATUS_LABELS[application.status]}
                  </span>
                </CardHeader>

                <CardContent className="space-y-3">
                  {application.track && (
                    <div>
                      <span className="font-medium">Назначенный трек:</span>{" "}
                      {application.track.title}
                      {application.track.description && (
                        <p className="mt-1 text-sm text-slate-600">
                          {application.track.description}
                        </p>
                      )}
                    </div>
                  )}

                  {application.status === "rejected" && application.rejectionComment && (
                    <div className="rounded-lg bg-red-50 p-4 text-red-800">
                      <span className="font-medium">Причина отказа:</span>{" "}
                      {application.rejectionComment}
                    </div>
                  )}

                  <p className="text-sm text-slate-500">
                    Последнее обновление: {formatDateTime(application.updatedAt)}
                  </p>

                  {application.status === "pending" && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingApplication(application)}
                      >
                        Редактировать
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {editingApplication && (
          <EditApplicationDialog
            application={editingApplication}
            onClose={() => setEditingApplication(null)}
            onUpdated={handleApplicationUpdated}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
