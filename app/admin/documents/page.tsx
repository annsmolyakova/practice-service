"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generatedDocuments } from "@/constants/generated-documents";
import { downloadFile } from "@/lib/download-file";
import { cohortsApi, documentsApi, reportsApi } from "@/lib/practice-api";
import type { Cohort, CohortDocumentSummaryItem, DocumentKind } from "@/types/api";

function getDownloadKey(applicationId: string, kind: DocumentKind) {
  return `${applicationId}:${kind}`;
}

export default function AdminDocumentsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [summary, setSummary] = useState<CohortDocumentSummaryItem[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [isCohortsLoading, setIsCohortsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [approvingApplicationId, setApprovingApplicationId] = useState<string | null>(null);
  const [downloadErrors, setDownloadErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isCancelled = false;

    cohortsApi
      .list(1, 100)
      .then((response) => {
        if (isCancelled) {
          return;
        }

        const sortedCohorts = [...response.items].sort(
          (left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt),
        );
        const initialCohort = sortedCohorts.find((cohort) => cohort.isActive) ?? sortedCohorts[0];

        setCohorts(sortedCohorts);
        setSelectedCohortId(initialCohort?.id ?? "");
        setIsSummaryLoading(Boolean(initialCohort));
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : "Не удалось загрузить потоки");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsCohortsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedCohortId) {
      return;
    }

    let isCancelled = false;

    documentsApi
      .getCohortSummary(selectedCohortId)
      .then((response) => {
        if (!isCancelled) {
          setSummary(response.items);
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : "Не удалось загрузить документы");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsSummaryLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [reloadKey, selectedCohortId]);

  function handleCohortChange(cohortId: string | null) {
    setSelectedCohortId(cohortId ?? "");
    setSummary([]);
    setLoadError("");
    setDownloadErrors({});
    setIsSummaryLoading(Boolean(cohortId));
  }

  async function handleDownload(applicationId: string, kind: DocumentKind) {
    const key = getDownloadKey(applicationId, kind);

    setDownloadingKey(key);
    setDownloadErrors((current) => ({ ...current, [key]: "" }));

    try {
      downloadFile(await documentsApi.download(applicationId, kind));
    } catch (error) {
      setDownloadErrors((current) => ({
        ...current,
        [key]: error instanceof Error ? error.message : "Не удалось сформировать документ",
      }));
    } finally {
      setDownloadingKey(null);
    }
  }

  async function handleReportDownload(applicationId: string) {
    const key = `${applicationId}:report`;

    setDownloadingKey(key);
    setDownloadErrors((current) => ({ ...current, [key]: "" }));

    try {
      downloadFile(await reportsApi.download(applicationId, `practice-report-${applicationId}`));
    } catch (error) {
      setDownloadErrors((current) => ({
        ...current,
        [key]: error instanceof Error ? error.message : "Не удалось скачать отчёт",
      }));
    } finally {
      setDownloadingKey(null);
    }
  }

  async function handleReportApproval(applicationId: string, isApproved: boolean) {
    const key = `${applicationId}:approval`;

    setApprovingApplicationId(applicationId);
    setDownloadErrors((current) => ({ ...current, [key]: "" }));

    try {
      await reportsApi.updateApproval(applicationId, isApproved);
      const response = await documentsApi.getCohortSummary(selectedCohortId);
      setSummary(response.items);
    } catch (error) {
      setDownloadErrors((current) => ({
        ...current,
        [key]: error instanceof Error ? error.message : "Не удалось изменить статус отчёта",
      }));
    } finally {
      setApprovingApplicationId(null);
    }
  }

  function retrySummary() {
    setLoadError("");
    setIsSummaryLoading(true);
    setReloadKey((current) => current + 1);
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Документы</h1>
          <p className="mt-2 text-slate-600">
            Формируйте документы для одобренных заявок, когда все необходимые данные готовы.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Документы потока</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="max-w-md space-y-2">
              <label className="text-sm font-medium" htmlFor="cohort-select">
                Поток практики
              </label>
              <Select
                value={selectedCohortId}
                onValueChange={handleCohortChange}
                disabled={isCohortsLoading}
              >
                <SelectTrigger id="cohort-select" className="w-full">
                  <SelectValue
                    placeholder={isCohortsLoading ? "Загрузка потоков..." : "Выберите поток"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isSummaryLoading && <p className="text-slate-600">Проверяем готовность документов...</p>}

            {!isSummaryLoading && loadError && (
              <div className="space-y-3 rounded-lg bg-red-50 p-4 text-red-800">
                <p>{loadError}</p>
                {selectedCohortId && (
                  <Button type="button" variant="outline" onClick={retrySummary}>
                    Повторить
                  </Button>
                )}
              </div>
            )}

            {!isCohortsLoading && cohorts.length === 0 && !loadError && (
              <p className="text-slate-600">Сначала создайте поток практики.</p>
            )}

            {!isSummaryLoading && !loadError && selectedCohortId && summary.length === 0 && (
              <p className="text-slate-600">В этом потоке пока нет одобренных заявок.</p>
            )}

            {!isSummaryLoading && !loadError && summary.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Студент</TableHead>
                    <TableHead>Отчёт студента</TableHead>
                    {generatedDocuments.map((definition) => (
                      <TableHead key={definition.kind}>{definition.title}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map((item) => (
                    <TableRow key={item.applicationId}>
                      <TableCell className="font-medium">
                        {item.fullName ?? `Студент ${item.userId.slice(0, 8)}`}
                      </TableCell>
                      <TableCell className="min-w-56 whitespace-normal">
                        {!item.practiceReportUploaded ? (
                          <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            Не загружен
                          </span>
                        ) : (
                          <div className="space-y-2">
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                item.practiceReportApproved
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {item.practiceReportApproved ? "Одобрен" : "Ожидает проверки"}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={downloadingKey !== null || approvingApplicationId !== null}
                                onClick={() => handleReportDownload(item.applicationId)}
                              >
                                {downloadingKey === `${item.applicationId}:report`
                                  ? "Скачивание..."
                                  : "Скачать"}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant={item.practiceReportApproved ? "outline" : "default"}
                                disabled={downloadingKey !== null || approvingApplicationId !== null}
                                onClick={() =>
                                  handleReportApproval(
                                    item.applicationId,
                                    !item.practiceReportApproved,
                                  )
                                }
                              >
                                {approvingApplicationId === item.applicationId
                                  ? "Сохранение..."
                                  : item.practiceReportApproved
                                    ? "Отозвать"
                                    : "Одобрить"}
                              </Button>
                            </div>
                            {downloadErrors[`${item.applicationId}:report`] && (
                              <p className="text-xs text-red-600">
                                {downloadErrors[`${item.applicationId}:report`]}
                              </p>
                            )}
                            {downloadErrors[`${item.applicationId}:approval`] && (
                              <p className="text-xs text-red-600">
                                {downloadErrors[`${item.applicationId}:approval`]}
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>
                      {generatedDocuments.map((definition) => {
                        const isReady = item[definition.readinessKey];
                        const key = getDownloadKey(item.applicationId, definition.kind);
                        const error = downloadErrors[key];

                        return (
                          <TableCell key={definition.kind} className="min-w-48 whitespace-normal">
                            <div className="space-y-2">
                              <span
                                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                  isReady
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {isReady ? "Готов" : "Не готов"}
                              </span>
                              <div>
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={!isReady || downloadingKey !== null}
                                  onClick={() => handleDownload(item.applicationId, definition.kind)}
                                >
                                  {downloadingKey === key ? "Формирование..." : "Сформировать DOCX"}
                                </Button>
                              </div>
                              {error && <p className="text-xs text-red-600">{error}</p>}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
