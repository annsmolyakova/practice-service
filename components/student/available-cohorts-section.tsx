"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cohortsApi } from "@/lib/practice-api";
import { cn } from "@/lib/utils";
import type { Cohort } from "@/types/api";

type ApplicationPeriodState = "upcoming" | "open" | "closed";

function getApplicationPeriodState(cohort: Cohort, now = new Date()): ApplicationPeriodState {
  if (now < new Date(cohort.applicationStartsAt)) {
    return "upcoming";
  }

  if (now > new Date(cohort.applicationEndsAt)) {
    return "closed";
  }

  return "open";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ApplicationPeriodAction({ cohort }: { cohort: Cohort }) {
  const state = getApplicationPeriodState(cohort);

  if (state === "upcoming") {
    return (
      <p className="text-sm font-medium text-amber-700">
        Приём заявок начнётся {formatDateTime(cohort.applicationStartsAt)}
      </p>
    );
  }

  if (state === "closed") {
    return (
      <p className="text-sm font-medium text-slate-500">
        Приём заявок завершён {formatDateTime(cohort.applicationEndsAt)}
      </p>
    );
  }

  return (
    <Link
      href={`/apply/${encodeURIComponent(cohort.publicSlug)}`}
      className={cn(buttonVariants(), "w-full sm:w-auto")}
    >
      Подать заявку
    </Link>
  );
}

export default function AvailableCohortsSection() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadCohorts = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await cohortsApi.listAvailable();
      setCohorts(response.items);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Не удалось загрузить доступные когорты",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    cohortsApi
      .listAvailable()
      .then((response) => {
        if (!isCancelled) {
          setCohorts(response.items);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Не удалось загрузить доступные когорты",
          );
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
    <section className="mb-10" aria-labelledby="available-cohorts-title">
      <div className="mb-4">
        <h2 id="available-cohorts-title" className="text-2xl font-semibold">
          Доступные когорты
        </h2>
        <p className="mt-1 text-slate-600">
          Выберите когорту, чтобы подать заявку на практику.
        </p>
      </div>

      {isLoading && <p className="text-slate-600">Загрузка доступных когорт...</p>}

      {!isLoading && loadError && (
        <Card>
          <CardContent className="space-y-4 py-8 text-center">
            <p className="text-red-600">{loadError}</p>
            <Button type="button" variant="outline" onClick={loadCohorts}>
              Повторить
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !loadError && cohorts.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-slate-600">
            Сейчас нет доступных когорт.
          </CardContent>
        </Card>
      )}

      {!isLoading && !loadError && cohorts.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {cohorts.map((cohort) => (
            <Card key={cohort.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{cohort.title}</CardTitle>
                {cohort.description && <p className="text-sm text-slate-600">{cohort.description}</p>}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-5">
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium">Приём заявок</dt>
                    <dd className="text-slate-600">
                      {formatDateTime(cohort.applicationStartsAt)} —{" "}
                      {formatDateTime(cohort.applicationEndsAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium">Практика</dt>
                    <dd className="text-slate-600">
                      {formatDateTime(cohort.startsAt)} — {formatDateTime(cohort.endsAt)}
                    </dd>
                  </div>
                </dl>

                <ApplicationPeriodAction cohort={cohort} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
