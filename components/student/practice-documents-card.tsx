"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generatedDocuments } from "@/constants/generated-documents";
import { downloadFile } from "@/lib/download-file";
import { documentsApi, reportsApi } from "@/lib/practice-api";
import type { DocumentKind, PracticeApplication, PracticeReport } from "@/types/api";

const MAX_REPORT_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_REPORT_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

type PracticeDocumentsCardProps = {
  application: PracticeApplication;
};

function getDocumentErrorKey(kind: DocumentKind) {
  return `document:${kind}`;
}

function formatFileSize(size: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "unit",
    unit: "megabyte",
    maximumFractionDigits: 1,
  }).format(size / 1024 / 1024);
}

export function PracticeDocumentsCard({ application }: PracticeDocumentsCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<PracticeReport | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isCancelled = false;

    reportsApi
      .getByApplication(application.id)
      .then((response) => {
        if (!isCancelled) {
          setReport(response.report);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setErrors((current) => ({
            ...current,
            report: error instanceof Error ? error.message : "Не удалось загрузить отчёт",
          }));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsReportLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [application.id]);

  function handleFileChange(file: File | null) {
    setErrors((current) => ({ ...current, report: "" }));

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_REPORT_TYPES.has(file.type)) {
      setSelectedFile(null);
      setErrors((current) => ({ ...current, report: "Выберите файл PDF или DOCX" }));
      return;
    }

    if (file.size > MAX_REPORT_SIZE_BYTES) {
      setSelectedFile(null);
      setErrors((current) => ({ ...current, report: "Размер файла не должен превышать 20 МБ" }));
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    setErrors((current) => ({ ...current, report: "" }));

    try {
      const response = await reportsApi.upload(application.id, selectedFile);
      setReport(response.report);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setErrors((current) => ({
        ...current,
        report: error instanceof Error ? error.message : "Не удалось загрузить отчёт",
      }));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleReportDownload() {
    if (!report) {
      return;
    }

    setDownloadingKey("report");
    setErrors((current) => ({ ...current, reportDownload: "" }));

    try {
      downloadFile(await reportsApi.download(application.id, report.originalName));
    } catch (error) {
      setErrors((current) => ({
        ...current,
        reportDownload: error instanceof Error ? error.message : "Не удалось скачать отчёт",
      }));
    } finally {
      setDownloadingKey(null);
    }
  }

  async function handleDocumentDownload(kind: DocumentKind) {
    const errorKey = getDocumentErrorKey(kind);

    setDownloadingKey(kind);
    setErrors((current) => ({ ...current, [errorKey]: "" }));

    try {
      downloadFile(await documentsApi.download(application.id, kind));
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [errorKey]: error instanceof Error ? error.message : "Документ пока не готов",
      }));
    } finally {
      setDownloadingKey(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{application.cohort.title}</CardTitle>
        {application.track && (
          <p className="text-sm text-slate-600">Трек: {application.track.title}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-4 rounded-lg border p-4">
          <div>
            <h2 className="font-medium">Отчёт по практике</h2>
            <p className="mt-1 text-sm text-slate-600">PDF или DOCX, не более 20 МБ.</p>
          </div>

          {isReportLoading ? (
            <p className="text-sm text-slate-600">Проверяем загруженный отчёт...</p>
          ) : (
            <>
              {report && (
                <div className="flex flex-col gap-3 rounded-md bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{report.originalName}</p>
                    <p className="text-xs text-slate-600">
                      {formatFileSize(report.size)} · {report.isApproved ? "Одобрен" : "Ожидает проверки"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={downloadingKey !== null || isUploading}
                    onClick={handleReportDownload}
                  >
                    {downloadingKey === "report" ? "Скачивание..." : "Скачать отчёт"}
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium" htmlFor={`report-${application.id}`}>
                    {report ? "Заменить файл" : "Выбрать файл"}
                  </label>
                  <Input
                    ref={fileInputRef}
                    id={`report-${application.id}`}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={isUploading}
                    onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                  />
                </div>
                <Button
                  type="button"
                  disabled={!selectedFile || isUploading || downloadingKey !== null}
                  onClick={handleUpload}
                >
                  {isUploading ? "Загрузка..." : report ? "Заменить отчёт" : "Загрузить отчёт"}
                </Button>
              </div>
            </>
          )}

          {errors.report && <p className="text-sm text-red-600">{errors.report}</p>}
          {errors.reportDownload && (
            <p className="text-sm text-red-600">{errors.reportDownload}</p>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {generatedDocuments.map((definition) => {
            const error = errors[getDocumentErrorKey(definition.kind)];
            const needsApprovedReport = definition.kind === "report-title-page";
            const isUnavailable = needsApprovedReport && !report?.isApproved;

            return (
              <div key={definition.kind} className="space-y-3 rounded-lg border p-4">
                <h2 className="font-medium">{definition.title}</h2>
                <Button
                  type="button"
                  className="w-full"
                  disabled={isUnavailable || downloadingKey !== null || isUploading}
                  onClick={() => handleDocumentDownload(definition.kind)}
                >
                  {downloadingKey === definition.kind ? "Формирование..." : "Сформировать DOCX"}
                </Button>
                {isUnavailable && (
                  <p className="text-sm text-slate-600">
                    Доступен после одобрения отчёта администратором.
                  </p>
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
