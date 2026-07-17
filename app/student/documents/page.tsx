"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { PracticeDocumentsCard } from "@/components/student/practice-documents-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { applicationsApi } from "@/lib/practice-api";
import type { PracticeApplication } from "@/types/api";

async function getApprovedApplications() {
  const response = await applicationsApi.listMine();

  return response.items
    .filter((application) => application.status === "approved")
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

export default function StudentDocumentsPage() {
  const [applications, setApplications] = useState<PracticeApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function retryApplications() {
    setIsLoading(true);
    setLoadError("");

    try {
      setApplications(await getApprovedApplications());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Не удалось загрузить заявки");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isCancelled = false;

    getApprovedApplications()
      .then((items) => {
        if (!isCancelled) {
          setApplications(items);
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

  return (
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Мои документы</h1>
          <p className="mt-2 text-slate-600">
            Документы формируются автоматически из данных профиля, заявки, отчёта и отзыва.
          </p>
        </div>

        {isLoading && <p className="text-slate-600">Загрузка документов...</p>}

        {!isLoading && loadError && (
          <Card>
            <CardContent className="space-y-4 py-8 text-center">
              <p className="text-red-600">{loadError}</p>
              <Button type="button" variant="outline" onClick={retryApplications}>
                Повторить
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !loadError && applications.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-600">
              Документы появятся после одобрения заявки на практику.
            </CardContent>
          </Card>
        )}

        {!isLoading && !loadError && applications.length > 0 && (
          <div className="space-y-6">
            {applications.map((application) => (
              <PracticeDocumentsCard key={application.id} application={application} />
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
