"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applicationsApi, cohortsApi, tracksApi } from "@/lib/practice-api";
import type {
  Cohort,
  CohortFormField,
  CohortTrack,
  PracticeApplication,
} from "@/types/api";

type ReviewDraft = {
  trackId: string;
  rejectionComment: string;
};

const EMPTY_REVIEW_DRAFT: ReviewDraft = {
  trackId: "",
  rejectionComment: "",
};

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

export default function AdminApplicationsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [applications, setApplications] = useState<PracticeApplication[]>([]);
  const [fields, setFields] = useState<CohortFormField[]>([]);
  const [tracks, setTracks] = useState<CohortTrack[]>([]);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>({});
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [cohortsError, setCohortsError] = useState("");
  const [applicationsError, setApplicationsError] = useState("");
  const [isCohortsLoading, setIsCohortsLoading] = useState(true);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(false);

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
        setIsApplicationsLoading(Boolean(initialCohort));
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setCohortsError(error instanceof Error ? error.message : "Не удалось загрузить когорты");
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

    Promise.all([
      applicationsApi.listByCohort(selectedCohortId),
      cohortsApi.getForm(selectedCohortId),
      tracksApi.listByCohort(selectedCohortId),
    ])
      .then(([applicationsResponse, fieldsResponse, tracksResponse]) => {
        if (isCancelled) {
          return;
        }

        setApplications(
          [...applicationsResponse.items].sort(
            (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
          ),
        );
        setFields([...fieldsResponse.fields].sort((left, right) => left.sortOrder - right.sortOrder));
        setTracks(
          tracksResponse.items
            .filter((track) => track.isActive)
            .sort((left, right) => left.sortOrder - right.sortOrder),
        );
        setReviewDrafts({});
        setApplicationsError("");
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setApplicationsError(
            error instanceof Error ? error.message : "Не удалось загрузить заявки",
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsApplicationsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCohortId, reloadKey]);

  function handleCohortChange(cohortId: string) {
    setSelectedCohortId(cohortId);
    setApplications([]);
    setFields([]);
    setTracks([]);
    setApplicationsError("");
    setIsApplicationsLoading(true);
  }

  function reloadSelectedCohort() {
    setApplicationsError("");
    setIsApplicationsLoading(true);
    setReloadKey((current) => current + 1);
  }

  function updateReviewDraft(applicationId: string, changes: Partial<ReviewDraft>) {
    setReviewDrafts((current) => ({
      ...current,
      [applicationId]: {
        ...(current[applicationId] ?? EMPTY_REVIEW_DRAFT),
        ...changes,
      },
    }));
    setActionErrors((current) => ({ ...current, [applicationId]: "" }));
  }

  function replaceApplication(updatedApplication: PracticeApplication) {
    setApplications((current) =>
      current.map((application) =>
        application.id === updatedApplication.id ? updatedApplication : application,
      ),
    );
  }

  async function approveApplication(applicationId: string) {
    const draft = reviewDrafts[applicationId] ?? EMPTY_REVIEW_DRAFT;

    if (!draft.trackId) {
      setActionErrors((current) => ({
        ...current,
        [applicationId]: "Выберите трек для одобрения",
      }));
      return;
    }

    setProcessingId(applicationId);
    setActionErrors((current) => ({ ...current, [applicationId]: "" }));

    try {
      const response = await applicationsApi.updateStatus(applicationId, {
        status: "approved",
        trackId: draft.trackId,
        rejectionComment: null,
      });
      replaceApplication(response.application);
    } catch (error) {
      setActionErrors((current) => ({
        ...current,
        [applicationId]: error instanceof Error ? error.message : "Не удалось одобрить заявку",
      }));
    } finally {
      setProcessingId(null);
    }
  }

  async function rejectApplication(applicationId: string) {
    const draft = reviewDrafts[applicationId] ?? EMPTY_REVIEW_DRAFT;
    const rejectionComment = draft.rejectionComment.trim();

    if (!rejectionComment) {
      setActionErrors((current) => ({
        ...current,
        [applicationId]: "Введите причину отказа",
      }));
      return;
    }

    setProcessingId(applicationId);
    setActionErrors((current) => ({ ...current, [applicationId]: "" }));

    try {
      const response = await applicationsApi.updateStatus(applicationId, {
        status: "rejected",
        trackId: null,
        rejectionComment,
      });
      replaceApplication(response.application);
    } catch (error) {
      setActionErrors((current) => ({
        ...current,
        [applicationId]: error instanceof Error ? error.message : "Не удалось отклонить заявку",
      }));
    } finally {
      setProcessingId(null);
    }
  }

  function getAnswerLabel(application: PracticeApplication, field: CohortFormField) {
    const answer = application.answers.find((item) => item.fieldId === field.id);

    if (!answer) {
      return "—";
    }

    if (answer.optionId) {
      return field.options.find((option) => option.id === answer.optionId)?.label ?? "—";
    }

    return answer.value || "—";
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Заявки студентов</h1>
          <p className="mt-2 text-slate-600">Выберите когорту для просмотра и обработки заявок.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="py-6">
            {isCohortsLoading ? (
              <p className="text-slate-600">Загрузка когорт...</p>
            ) : cohortsError ? (
              <div className="space-y-3">
                <p className="text-red-600">{cohortsError}</p>
                <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                  Повторить
                </Button>
              </div>
            ) : cohorts.length === 0 ? (
              <p className="text-slate-600">Когорты ещё не созданы.</p>
            ) : (
              <Select value={selectedCohortId} onValueChange={(value) => handleCohortChange(value ?? "")}>
                <SelectTrigger className="max-w-lg">
                  <SelectValue placeholder="Выберите когорту" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {isApplicationsLoading && <p className="text-slate-600">Загрузка заявок...</p>}

        {!isApplicationsLoading && applicationsError && (
          <Card>
            <CardContent className="space-y-4 py-8 text-center">
              <p className="text-red-600">{applicationsError}</p>
              <Button type="button" variant="outline" onClick={reloadSelectedCohort}>
                Повторить
              </Button>
            </CardContent>
          </Card>
        )}

        {!isApplicationsLoading && !applicationsError && selectedCohortId && applications.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-600">
              В выбранной когорте пока нет заявок.
            </CardContent>
          </Card>
        )}

        {!isApplicationsLoading && !applicationsError && applications.length > 0 && (
          <div className="space-y-6">
            {applications.map((application) => {
              const draft = reviewDrafts[application.id] ?? EMPTY_REVIEW_DRAFT;

              return (
                <Card key={application.id}>
                  <CardHeader className="flex-row items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle>{application.user?.email ?? `Студент ${application.userId}`}</CardTitle>
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

                  <CardContent className="space-y-5">
                    <dl className="grid gap-3 md:grid-cols-2">
                      {fields.map((field) => (
                        <div key={field.id}>
                          <dt className="text-sm font-medium text-slate-500">{field.label}</dt>
                          <dd className="mt-1 whitespace-pre-wrap">{getAnswerLabel(application, field)}</dd>
                        </div>
                      ))}
                    </dl>

                    {fields.length === 0 && (
                      <p className="text-sm text-slate-500">В форме не было дополнительных полей.</p>
                    )}

                    {application.track && (
                      <p>
                        <span className="font-medium">Назначенный трек:</span>{" "}
                        {application.track.title}
                      </p>
                    )}

                    {application.rejectionComment && (
                      <p className="rounded-lg bg-red-50 p-4 text-red-800">
                        <span className="font-medium">Причина отказа:</span>{" "}
                        {application.rejectionComment}
                      </p>
                    )}

                    {application.status === "pending" && (
                      <div className="space-y-3 border-t pt-5">
                        <Select
                          value={draft.trackId}
                          onValueChange={(value) =>
                            updateReviewDraft(application.id, { trackId: value ?? "" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите трек для одобрения" />
                          </SelectTrigger>
                          <SelectContent>
                            {tracks.map((track) => (
                              <SelectItem key={track.id} value={track.id}>
                                {track.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {tracks.length === 0 && (
                          <p className="text-sm text-amber-700">
                            Для одобрения сначала создайте активный трек в когорте.
                          </p>
                        )}

                        <Input
                          placeholder="Причина отказа"
                          value={draft.rejectionComment}
                          onChange={(event) =>
                            updateReviewDraft(application.id, {
                              rejectionComment: event.target.value,
                            })
                          }
                        />

                        {actionErrors[application.id] && (
                          <p className="text-sm text-red-600">{actionErrors[application.id]}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            disabled={processingId === application.id || tracks.length === 0}
                            onClick={() => approveApplication(application.id)}
                          >
                            {processingId === application.id ? "Сохранение..." : "Одобрить"}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={processingId === application.id}
                            onClick={() => rejectApplication(application.id)}
                          >
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
