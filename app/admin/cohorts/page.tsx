"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import CohortDateTimeFields from "@/components/admin/cohort-date-time-fields";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  cohortSchema,
  combineLocalDateTime,
  type CohortFormData,
} from "@/lib/cohort-schema";
import { cohortsApi } from "@/lib/practice-api";
import type { Cohort, Pagination } from "@/types/api";

const PAGE_SIZE = 20;

const EMPTY_FORM: CohortFormData = {
  title: "",
  description: "",
  publicSlug: "",
  applicationStartsAtDate: "",
  applicationStartsAtTime: "",
  applicationEndsAtDate: "",
  applicationEndsAtTime: "",
  startsAtDate: "",
  startsAtTime: "",
  endsAtDate: "",
  endsAtTime: "",
  isActive: true,
};

function toDateTimeParts(value: string) {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pages: 0,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);
  const [copiedCohortId, setCopiedCohortId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CohortFormData>({
    resolver: zodResolver(cohortSchema),
    defaultValues: EMPTY_FORM,
  });

  const loadCohorts = useCallback(async (requestedPage: number) => {
    try {
      const response = await cohortsApi.list(requestedPage, PAGE_SIZE);
      setCohorts(response.items);
      setPagination(response.pagination);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Не удалось загрузить когорты");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    cohortsApi
      .list(page, PAGE_SIZE)
      .then((response) => {
        if (isCancelled) {
          return;
        }

        setCohorts(response.items);
        setPagination(response.pagination);
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : "Не удалось загрузить когорты");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page]);

  function openCreateDialog() {
    setEditingCohort(null);
    setFormError("");
    reset(EMPTY_FORM);
    setIsOpen(true);
  }

  function openEditDialog(cohort: Cohort) {
    const applicationStartsAt = toDateTimeParts(cohort.applicationStartsAt);
    const applicationEndsAt = toDateTimeParts(cohort.applicationEndsAt);
    const startsAt = toDateTimeParts(cohort.startsAt);
    const endsAt = toDateTimeParts(cohort.endsAt);

    setEditingCohort(cohort);
    setCopiedCohortId(null);
    setFormError("");
    reset({
      title: cohort.title,
      description: cohort.description ?? "",
      publicSlug: cohort.publicSlug,
      applicationStartsAtDate: applicationStartsAt.date,
      applicationStartsAtTime: applicationStartsAt.time,
      applicationEndsAtDate: applicationEndsAt.date,
      applicationEndsAtTime: applicationEndsAt.time,
      startsAtDate: startsAt.date,
      startsAtTime: startsAt.time,
      endsAtDate: endsAt.date,
      endsAtTime: endsAt.time,
      isActive: cohort.isActive,
    });
    setIsOpen(true);
  }

  function handleDialogChange(open: boolean) {
    if (isSubmitting) {
      return;
    }

    setIsOpen(open);
  }

  async function submitCohort(data: CohortFormData) {
    setFormError("");

    const commonInput = {
      title: data.title,
      publicSlug: data.publicSlug,
      applicationStartsAt: combineLocalDateTime(
        data.applicationStartsAtDate,
        data.applicationStartsAtTime,
      ).toISOString(),
      applicationEndsAt: combineLocalDateTime(
        data.applicationEndsAtDate,
        data.applicationEndsAtTime,
      ).toISOString(),
      startsAt: combineLocalDateTime(data.startsAtDate, data.startsAtTime).toISOString(),
      endsAt: combineLocalDateTime(data.endsAtDate, data.endsAtTime).toISOString(),
      isActive: data.isActive,
    };

    try {
      if (editingCohort) {
        await cohortsApi.update(editingCohort.id, {
          ...commonInput,
          description: data.description || null,
        });
      } else {
        await cohortsApi.create({
          ...commonInput,
          ...(data.description ? { description: data.description } : {}),
        });
      }

      setIsOpen(false);
      reset(EMPTY_FORM);

      if (!editingCohort && page !== 1) {
        setIsLoading(true);
        setLoadError("");
        setPage(1);
      } else {
        await loadCohorts(page);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Не удалось сохранить когорту");
    }
  }

  async function toggleCohortStatus(cohort: Cohort) {
    const action = cohort.isActive ? "архивировать" : "восстановить";

    if (!window.confirm(`Вы уверены, что хотите ${action} когорту «${cohort.title}»?`)) {
      return;
    }

    setChangingStatusId(cohort.id);
    setLoadError("");

    try {
      await cohortsApi.update(cohort.id, { isActive: !cohort.isActive });
      await loadCohorts(page);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : `Не удалось ${action} когорту`,
      );
    } finally {
      setChangingStatusId(null);
    }
  }

  function changePage(nextPage: number) {
    setIsLoading(true);
    setLoadError("");
    setPage(nextPage);
  }

  function retryLoading() {
    setIsLoading(true);
    setLoadError("");
    void loadCohorts(page);
  }

  async function copyPublicLink(cohort: Cohort) {
    setCopiedCohortId(null);

    const publicUrl = new URL(
      `/apply/${encodeURIComponent(cohort.publicSlug)}`,
      window.location.origin,
    ).toString();

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API is unavailable");
      }

      await navigator.clipboard.writeText(publicUrl);
      setCopiedCohortId(cohort.id);
    } catch {
      window.prompt("Скопируйте публичную ссылку", publicUrl);
    }
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold">Когорты</h1>
          <Button onClick={openCreateDialog}>Создать когорту</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список когорт</CardTitle>
          </CardHeader>

          <CardContent>
            {loadError && (
              <div className="mb-4 flex items-center justify-between gap-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <span>{loadError}</span>
                <Button variant="outline" size="sm" onClick={retryLoading}>
                  Повторить
                </Button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left">Название</th>
                    <th className="py-3 text-left">Приём заявок</th>
                    <th className="py-3 text-left">Практика</th>
                    <th className="py-3 text-left">Статус</th>
                    <th className="py-3 text-left">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        Загрузка когорт...
                      </td>
                    </tr>
                  ) : cohorts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        Когорты пока не созданы
                      </td>
                    </tr>
                  ) : (
                    cohorts.map((cohort) => (
                      <tr key={cohort.id} className="border-b last:border-b-0">
                        <td className="py-4 pr-4">
                          <div className="font-medium">{cohort.title}</div>
                          <div className="text-sm text-slate-500">/{cohort.publicSlug}</div>
                        </td>
                        <td className="pr-4">
                          {formatDateTime(cohort.applicationStartsAt)} —{" "}
                          {formatDateTime(cohort.applicationEndsAt)}
                        </td>
                        <td className="pr-4">
                          {formatDateTime(cohort.startsAt)} — {formatDateTime(cohort.endsAt)}
                        </td>
                        <td className="pr-4">
                          <span
                            className={
                              cohort.isActive
                                ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                                : "rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                            }
                          >
                            {cohort.isActive ? "Активна" : "В архиве"}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void copyPublicLink(cohort)}
                            >
                              {copiedCohortId === cohort.id
                                ? "Ссылка скопирована"
                                : "Скопировать ссылку"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={changingStatusId !== null}
                              onClick={() => openEditDialog(cohort)}
                            >
                              Редактировать
                            </Button>
                            <Button
                              variant={cohort.isActive ? "destructive" : "outline"}
                              size="sm"
                              disabled={changingStatusId !== null}
                              onClick={() => void toggleCohortStatus(cohort)}
                            >
                              {changingStatusId === cohort.id
                                ? "Сохранение..."
                                : cohort.isActive
                                  ? "Архивировать"
                                  : "Восстановить"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!isLoading && pagination.pages > 1 && (
              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Страница {pagination.page} из {pagination.pages}. Всего: {pagination.total}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => changePage(Math.max(1, page - 1))}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() => changePage(page + 1)}
                  >
                    Далее
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {editingCohort ? "Редактирование когорты" : "Создание когорты"}
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit(submitCohort)}>
              <div>
                <Label htmlFor="title">Название когорты</Label>
                <Input
                  id="title"
                  placeholder="Например, Практика 2028"
                  aria-invalid={Boolean(errors.title)}
                  {...register("title")}
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Краткое описание когорты"
                  aria-invalid={Boolean(errors.description)}
                  {...register("description")}
                />
                <FieldError message={errors.description?.message} />
              </div>

              <div>
                <Label htmlFor="publicSlug">Публичный идентификатор</Label>
                <Input
                  id="publicSlug"
                  placeholder="practice-2028"
                  aria-invalid={Boolean(errors.publicSlug)}
                  {...register("publicSlug")}
                />
                <FieldError message={errors.publicSlug?.message} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <CohortDateTimeFields
                  label="Начало приёма заявок"
                  dateId="applicationStartsAtDate"
                  timeId="applicationStartsAtTime"
                  dateRegistration={register("applicationStartsAtDate")}
                  timeRegistration={register("applicationStartsAtTime")}
                  dateError={errors.applicationStartsAtDate?.message}
                  timeError={errors.applicationStartsAtTime?.message}
                />
                <CohortDateTimeFields
                  label="Окончание приёма заявок"
                  dateId="applicationEndsAtDate"
                  timeId="applicationEndsAtTime"
                  dateRegistration={register("applicationEndsAtDate")}
                  timeRegistration={register("applicationEndsAtTime")}
                  dateError={errors.applicationEndsAtDate?.message}
                  timeError={errors.applicationEndsAtTime?.message}
                />
                <CohortDateTimeFields
                  label="Начало практики"
                  dateId="startsAtDate"
                  timeId="startsAtTime"
                  dateRegistration={register("startsAtDate")}
                  timeRegistration={register("startsAtTime")}
                  dateError={errors.startsAtDate?.message}
                  timeError={errors.startsAtTime?.message}
                />
                <CohortDateTimeFields
                  label="Окончание практики"
                  dateId="endsAtDate"
                  timeId="endsAtTime"
                  dateRegistration={register("endsAtDate")}
                  timeRegistration={register("endsAtTime")}
                  dateError={errors.endsAtDate?.message}
                  timeError={errors.endsAtTime?.message}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4" {...register("isActive")} />
                Когорта активна
              </label>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Сохранение..."
                  : editingCohort
                    ? "Сохранить изменения"
                    : "Создать когорту"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
