"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  canShiftWeek,
  formatTaskDate,
  formatWeekRange,
  getInitialWeekStart,
  getWorkWeekDates,
  shiftWeek,
} from "@/lib/practice-task-calendar";
import { isSafeArtifactLink } from "@/lib/practice-task-schema";
import { cohortsApi, tasksApi } from "@/lib/practice-api";
import type { Cohort, PracticeTask, TaskParticipant } from "@/types/api";

async function getCohorts() {
  const response = await cohortsApi.list(1, 100);

  return [...response.items].sort(
    (left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt),
  );
}

function TaskCell({ task }: { task: PracticeTask | null }) {
  if (!task) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="min-w-0 space-y-2">
      <p className="break-words font-medium">{task.title}</p>
      <p className="whitespace-pre-wrap break-words text-sm text-slate-600">
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
  );
}

export default function AdminTasksPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [participants, setParticipants] = useState<TaskParticipant[]>([]);
  const [isCohortsLoading, setIsCohortsLoading] = useState(true);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  const [cohortsError, setCohortsError] = useState("");
  const [boardError, setBoardError] = useState("");

  const selectedCohort = useMemo(
    () => cohorts.find((cohort) => cohort.id === selectedCohortId) ?? null,
    [cohorts, selectedCohortId],
  );
  const weekDates = useMemo(
    () => (weekStart ? getWorkWeekDates(weekStart) : []),
    [weekStart],
  );

  const loadCohorts = useCallback(async () => {
    setIsCohortsLoading(true);
    setCohortsError("");

    try {
      const items = await getCohorts();
      const initialCohort = items.find((cohort) => cohort.isActive) ?? items[0] ?? null;

      setCohorts(items);
      setSelectedCohortId(initialCohort?.id ?? "");
      setWeekStart(initialCohort ? getInitialWeekStart(initialCohort) : "");
      setIsBoardLoading(Boolean(initialCohort));
    } catch (error) {
      setCohortsError(error instanceof Error ? error.message : "Не удалось загрузить потоки");
    } finally {
      setIsCohortsLoading(false);
    }
  }, []);

  const loadBoard = useCallback(async (cohortId: string, requestedWeekStart: string) => {
    setIsBoardLoading(true);
    setBoardError("");

    try {
      const response = await tasksApi.listCohortWeek(cohortId, requestedWeekStart);
      setParticipants(response.items);
    } catch (error) {
      setBoardError(error instanceof Error ? error.message : "Не удалось загрузить журнал задач");
    } finally {
      setIsBoardLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    getCohorts()
      .then((items) => {
        if (isCancelled) {
          return;
        }

        const initialCohort = items.find((cohort) => cohort.isActive) ?? items[0] ?? null;

        setCohorts(items);
        setSelectedCohortId(initialCohort?.id ?? "");
        setWeekStart(initialCohort ? getInitialWeekStart(initialCohort) : "");
        setIsBoardLoading(Boolean(initialCohort));
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setCohortsError(error instanceof Error ? error.message : "Не удалось загрузить потоки");
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
    if (!selectedCohort || !weekStart) {
      return;
    }

    let isCancelled = false;

    tasksApi
      .listCohortWeek(selectedCohort.id, weekStart)
      .then((response) => {
        if (!isCancelled) {
          setParticipants(response.items);
          setBoardError("");
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setBoardError(
            error instanceof Error ? error.message : "Не удалось загрузить журнал задач",
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsBoardLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCohort, weekStart]);

  function changeCohort(cohortId: string | null) {
    const cohort = cohorts.find((item) => item.id === cohortId);

    setSelectedCohortId(cohortId ?? "");
    setWeekStart(cohort ? getInitialWeekStart(cohort) : "");
    setParticipants([]);
    setBoardError("");
    setIsBoardLoading(Boolean(cohort));
  }

  function changeWeek(direction: -1 | 1) {
    setParticipants([]);
    setBoardError("");
    setIsBoardLoading(true);
    setWeekStart((current) => shiftWeek(current, direction));
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Журнал задач</h1>
          <p className="mt-2 text-slate-600">
            Просматривайте ежедневные записи участников по рабочим неделям практики.
          </p>
        </div>

        {isCohortsLoading && <p className="text-slate-600">Загрузка потоков...</p>}

        {!isCohortsLoading && cohortsError && (
          <Card>
            <CardContent className="space-y-4 py-8 text-center">
              <p className="text-red-600">{cohortsError}</p>
              <Button type="button" variant="outline" onClick={loadCohorts}>
                Повторить
              </Button>
            </CardContent>
          </Card>
        )}

        {!isCohortsLoading && !cohortsError && cohorts.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-600">
              Потоки практики ещё не созданы.
            </CardContent>
          </Card>
        )}

        {!isCohortsLoading && !cohortsError && selectedCohort && (
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <Label>Поток практики</Label>
                  <Select value={selectedCohortId} onValueChange={changeCohort}>
                    <SelectTrigger className="w-full sm:w-80">
                      <SelectValue placeholder="Выберите поток">
                        {selectedCohort.title}
                      </SelectValue>
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

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canShiftWeek(selectedCohort, weekStart, -1) || isBoardLoading}
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
                    disabled={!canShiftWeek(selectedCohort, weekStart, 1) || isBoardLoading}
                    onClick={() => changeWeek(1)}
                  >
                    Следующая
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isBoardLoading && <p className="text-slate-600">Загрузка журнала...</p>}

            {!isBoardLoading && boardError && (
              <Card>
                <CardContent className="space-y-4 py-8 text-center">
                  <p className="text-red-600">{boardError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadBoard(selectedCohort.id, weekStart)}
                  >
                    Повторить
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isBoardLoading && !boardError && participants.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-slate-600">
                  В этом потоке пока нет одобренных участников.
                </CardContent>
              </Card>
            )}

            {!isBoardLoading && !boardError && participants.length > 0 && (
              <div className="space-y-5">
                {participants.map((participant) => {
                  const tasksByDate = new Map(
                    participant.tasks.map((task) => [task.date, task]),
                  );

                  return (
                    <Card key={participant.userId} className="min-w-0">
                      <CardHeader>
                        <CardTitle className="break-words text-lg">
                          {participant.fullName ?? `Студент ${participant.userId}`}
                        </CardTitle>
                        <p className="text-sm text-slate-500">
                          {participant.track?.title ?? "Трек не назначен"}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                          {weekDates.map((date) => (
                            <section key={date} className="min-w-0 rounded-lg border p-3">
                              <h2 className="mb-3 text-sm font-medium capitalize">
                                {formatTaskDate(date)}
                              </h2>
                              <TaskCell task={tasksByDate.get(date) ?? null} />
                            </section>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
