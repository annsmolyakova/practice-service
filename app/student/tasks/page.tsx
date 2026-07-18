"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  canShiftWeek,
  formatTaskDate,
  formatWeekRange,
  getInitialWeekStart,
  getWorkWeekDates,
  isDateWithinCohort,
  shiftWeek,
} from "@/lib/practice-task-calendar";
import {
  isSafeArtifactLink,
  practiceTaskSchema,
  type PracticeTaskFormData,
} from "@/lib/practice-task-schema";
import { applicationsApi, tasksApi } from "@/lib/practice-api";
import type { PracticeApplication, PracticeTask } from "@/types/api";

const EMPTY_FORM: PracticeTaskFormData = {
  title: "",
  description: "",
  artifactLink: "",
};

type TaskEditorState = {
  date: string;
  task: PracticeTask | null;
};

async function getApprovedApplications() {
  const response = await applicationsApi.listMine();

  return response.items
    .filter((application) => application.status === "approved")
    .sort((left, right) => Date.parse(right.cohort.startsAt) - Date.parse(left.cohort.startsAt));
}

export default function StudentTasksPage() {
  const [applications, setApplications] = useState<PracticeApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [tasks, setTasks] = useState<PracticeTask[]>([]);
  const [editor, setEditor] = useState<TaskEditorState | null>(null);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");
  const [tasksError, setTasksError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PracticeTaskFormData>({
    resolver: zodResolver(practiceTaskSchema),
    defaultValues: EMPTY_FORM,
  });

  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId],
  );
  const selectedCohort = selectedApplication?.cohort ?? null;
  const weekDates = useMemo(
    () => (weekStart ? getWorkWeekDates(weekStart) : []),
    [weekStart],
  );
  const tasksByDate = useMemo(
    () => new Map(tasks.map((task) => [task.date, task])),
    [tasks],
  );

  const loadApplications = useCallback(async () => {
    setIsApplicationsLoading(true);
    setApplicationsError("");

    try {
      const items = await getApprovedApplications();
      const initialApplication =
        items.find((application) => application.cohort.isActive) ?? items[0] ?? null;

      setApplications(items);
      setSelectedApplicationId(initialApplication?.id ?? "");
      setWeekStart(initialApplication ? getInitialWeekStart(initialApplication.cohort) : "");
    } catch (error) {
      setApplicationsError(
        error instanceof Error ? error.message : "Не удалось загрузить потоки практики",
      );
    } finally {
      setIsApplicationsLoading(false);
    }
  }, []);

  const loadTasks = useCallback(async (cohortId: string, requestedWeekStart: string) => {
    setIsTasksLoading(true);
    setTasksError("");

    try {
      const response = await tasksApi.listMineByWeek(cohortId, requestedWeekStart);
      setTasks(response.items);
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Не удалось загрузить задачи");
    } finally {
      setIsTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    getApprovedApplications()
      .then((items) => {
        if (isCancelled) {
          return;
        }

        const initialApplication =
          items.find((application) => application.cohort.isActive) ?? items[0] ?? null;

        setApplications(items);
        setSelectedApplicationId(initialApplication?.id ?? "");
        setWeekStart(initialApplication ? getInitialWeekStart(initialApplication.cohort) : "");
        setIsTasksLoading(Boolean(initialApplication));
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setApplicationsError(
            error instanceof Error ? error.message : "Не удалось загрузить потоки практики",
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
  }, []);

  useEffect(() => {
    if (!selectedCohort || !weekStart) {
      return;
    }

    let isCancelled = false;

    tasksApi
      .listMineByWeek(selectedCohort.id, weekStart)
      .then((response) => {
        if (!isCancelled) {
          setTasks(response.items);
          setTasksError("");
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setTasksError(error instanceof Error ? error.message : "Не удалось загрузить задачи");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsTasksLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCohort, weekStart]);

  function changeApplication(applicationId: string | null) {
    const application = applications.find((item) => item.id === applicationId);

    setSelectedApplicationId(applicationId ?? "");
    setWeekStart(application ? getInitialWeekStart(application.cohort) : "");
    setTasks([]);
    setTasksError("");
    setIsTasksLoading(Boolean(application));
  }

  function changeWeek(direction: -1 | 1) {
    setTasks([]);
    setTasksError("");
    setIsTasksLoading(true);
    setWeekStart((current) => shiftWeek(current, direction));
  }

  function openEditor(date: string, task: PracticeTask | null) {
    reset(
      task
        ? {
            title: task.title,
            description: task.description,
            artifactLink: task.artifactLink ?? "",
          }
        : EMPTY_FORM,
    );
    setTasksError("");
    setEditor({ date, task });
  }

  function closeEditor() {
    if (!isSubmitting && !isDeleting) {
      setEditor(null);
      reset(EMPTY_FORM);
    }
  }

  async function saveTask(data: PracticeTaskFormData) {
    if (!editor || !selectedCohort) {
      return;
    }

    setTasksError("");

    try {
      const input = {
        title: data.title.trim(),
        description: data.description.trim(),
        artifactLink: data.artifactLink.trim() || null,
      };
      const response = editor.task
        ? await tasksApi.updateMine(editor.task.id, input)
        : await tasksApi.createMine(selectedCohort.id, { date: editor.date, ...input });

      setTasks((current) => [
        ...current.filter((task) => task.id !== response.task.id),
        response.task,
      ]);
      setEditor(null);
      reset(EMPTY_FORM);
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Не удалось сохранить задачу");
    }
  }

  async function deleteTask() {
    if (!editor?.task || !window.confirm("Удалить задачу за этот день?")) {
      return;
    }

    setIsDeleting(true);
    setTasksError("");

    try {
      await tasksApi.deleteMine(editor.task.id);
      setTasks((current) => current.filter((task) => task.id !== editor.task?.id));
      setEditor(null);
      reset(EMPTY_FORM);
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Не удалось удалить задачу");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Мои задачи</h1>
          <p className="mt-2 text-slate-600">
            Ведите журнал выполненной работы по каждому рабочему дню практики.
          </p>
        </div>

        {isApplicationsLoading && <p className="text-slate-600">Загрузка потоков...</p>}

        {!isApplicationsLoading && applicationsError && (
          <Card>
            <CardContent className="space-y-4 py-8 text-center">
              <p className="text-red-600">{applicationsError}</p>
              <Button type="button" variant="outline" onClick={loadApplications}>
                Повторить
              </Button>
            </CardContent>
          </Card>
        )}

        {!isApplicationsLoading && !applicationsError && applications.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-600">
              Задачи станут доступны после одобрения заявки на практику.
            </CardContent>
          </Card>
        )}

        {!isApplicationsLoading && !applicationsError && selectedCohort && (
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <Label>Поток практики</Label>
                  <Select value={selectedApplicationId} onValueChange={changeApplication}>
                    <SelectTrigger className="w-full sm:w-80">
                      <SelectValue placeholder="Выберите поток">
                        {selectedCohort.title}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {applications.map((application) => (
                        <SelectItem key={application.id} value={application.id}>
                          {application.cohort.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canShiftWeek(selectedCohort, weekStart, -1) || isTasksLoading}
                    onClick={() => changeWeek(-1)}
                  >
                    Предыдущая
                  </Button>
                  <span className="min-w-56 text-center text-sm font-medium">
                    {formatWeekRange(weekStart)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canShiftWeek(selectedCohort, weekStart, 1) || isTasksLoading}
                    onClick={() => changeWeek(1)}
                  >
                    Следующая
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isTasksLoading && <p className="text-slate-600">Загрузка задач...</p>}

            {!isTasksLoading && tasksError && !editor && (
              <Card>
                <CardContent className="space-y-4 py-8 text-center">
                  <p className="text-red-600">{tasksError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadTasks(selectedCohort.id, weekStart)}
                  >
                    Повторить
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isTasksLoading && (!tasksError || editor) && (
              <div className="grid gap-4 xl:grid-cols-5">
                {weekDates.map((date) => {
                  const task = tasksByDate.get(date) ?? null;
                  const isAvailable = isDateWithinCohort(selectedCohort, date);

                  return (
                    <Card key={date} className={!isAvailable ? "opacity-60" : undefined}>
                      <CardHeader>
                        <CardTitle className="text-base capitalize">{formatTaskDate(date)}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex h-full flex-col gap-4">
                        {!isAvailable ? (
                          <p className="text-sm text-slate-500">Вне периода практики</p>
                        ) : task ? (
                          <>
                            <div className="space-y-2">
                              <p className="font-medium">{task.title}</p>
                              <p className="whitespace-pre-wrap text-sm text-slate-600">
                                {task.description}
                              </p>
                              {task.artifactLink && isSafeArtifactLink(task.artifactLink) && (
                                <a
                                  className="block break-all text-sm text-blue-600 hover:underline"
                                  href={task.artifactLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Открыть результат
                                </a>
                              )}
                            </div>
                            <Button
                              type="button"
                              className="mt-auto w-full"
                              variant="outline"
                              onClick={() => openEditor(date, task)}
                            >
                              Редактировать
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-slate-500">Запись ещё не добавлена.</p>
                            <Button
                              type="button"
                              className="mt-auto w-full"
                              onClick={() => openEditor(date, null)}
                            >
                              Добавить
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {editor && (
          <Dialog open onOpenChange={(open) => !open && closeEditor()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editor.task ? "Редактирование задачи" : "Новая задача"}</DialogTitle>
                <DialogDescription className="capitalize">
                  {formatTaskDate(editor.date)}
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleSubmit(saveTask)}>
                <div className="space-y-2">
                  <Label htmlFor="task-title">Название *</Label>
                  <Input id="task-title" maxLength={200} {...register("title")} />
                  {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-description">Описание *</Label>
                  <Textarea
                    id="task-description"
                    maxLength={5000}
                    className="min-h-32"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-artifact">Ссылка на результат</Label>
                  <Input
                    id="task-artifact"
                    type="url"
                    placeholder="https://example.com/result"
                    {...register("artifactLink")}
                  />
                  {errors.artifactLink && (
                    <p className="text-sm text-red-600">{errors.artifactLink.message}</p>
                  )}
                </div>

                {tasksError && <p className="text-sm text-red-600">{tasksError}</p>}

                <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
                  <div>
                    {editor.task && (
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isSubmitting || isDeleting}
                        onClick={deleteTask}
                      >
                        {isDeleting ? "Удаление..." : "Удалить"}
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting || isDeleting}
                      onClick={closeEditor}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isDeleting}>
                      {isSubmitting ? "Сохранение..." : "Сохранить"}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
