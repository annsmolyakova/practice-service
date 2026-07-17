"use client";

import { useCallback, useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatedDocuments } from "@/constants/generated-documents";
import { downloadFile } from "@/lib/download-file";
import { applicationsApi, documentsApi } from "@/lib/practice-api";
import type { DocumentKind, PracticeApplication } from "@/types/api";

function getDownloadKey(applicationId: string, kind: DocumentKind) {
  return `${applicationId}:${kind}`;
}

export default function StudentDocumentsPage() {
  const [applications, setApplications] = useState<PracticeApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [downloadErrors, setDownloadErrors] = useState<Record<string, string>>({});

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await applicationsApi.listMine();
      setApplications(
        response.items
          .filter((application) => application.status === "approved")
          .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Не удалось загрузить заявки");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function handleDownload(applicationId: string, kind: DocumentKind) {
    const key = getDownloadKey(applicationId, kind);

    setDownloadingKey(key);
    setDownloadErrors((current) => ({ ...current, [key]: "" }));

    try {
      downloadFile(await documentsApi.download(applicationId, kind));
    } catch (error) {
      setDownloadErrors((current) => ({
        ...current,
        [key]: error instanceof Error ? error.message : "Документ пока не готов",
      }));
    } finally {
      setDownloadingKey(null);
    }
  }

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
              <Button type="button" variant="outline" onClick={loadApplications}>
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
              <Card key={application.id}>
                <CardHeader>
                  <CardTitle>{application.cohort.title}</CardTitle>
                  {application.track && (
                    <p className="text-sm text-slate-600">Трек: {application.track.title}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {generatedDocuments.map((definition) => {
                      const key = getDownloadKey(application.id, definition.kind);
                      const error = downloadErrors[key];

                      return (
                        <div key={definition.kind} className="space-y-3 rounded-lg border p-4">
                          <h2 className="font-medium">{definition.title}</h2>
                          <Button
                            type="button"
                            className="w-full"
                            disabled={downloadingKey !== null}
                            onClick={() => handleDownload(application.id, definition.kind)}
                          >
                            {downloadingKey === key ? "Формирование..." : "Сформировать DOCX"}
                          </Button>
                          {error && <p className="text-sm text-red-600">{error}</p>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
