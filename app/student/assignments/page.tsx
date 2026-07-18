"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api-client";
import { applicationsApi, assignmentsApi } from "@/lib/practice-api";
import type { Cohort, CohortAssignment, PracticeApplication } from "@/types/api";

type PublishedAssignment = {
  cohort: Cohort;
  assignment: CohortAssignment;
};

function uniqueApplicationsByCohort(applications: PracticeApplication[]) {
  const applicationsByCohort = new Map<string, PracticeApplication>();

  for (const application of applications) {
    if (!applicationsByCohort.has(application.cohortId)) {
      applicationsByCohort.set(application.cohortId, application);
    }
  }

  return [...applicationsByCohort.values()];
}

async function getPublishedAssignments() {
  const response = await applicationsApi.listMine();
  const applications = uniqueApplicationsByCohort(response.items);
  const assignments = await Promise.all(
    applications.map(async (application): Promise<PublishedAssignment | null> => {
      try {
        const { assignment } = await assignmentsApi.getMineByCohort(application.cohortId);

        return { cohort: application.cohort, assignment };
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }

        throw error;
      }
    }),
  );

  return {
    applicationCount: applications.length,
    assignments: assignments.filter(
      (item): item is PublishedAssignment => item !== null,
    ),
  };
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<PublishedAssignment[]>([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function loadAssignments() {
    setIsLoading(true);
    setLoadError("");

    try {
      const result = await getPublishedAssignments();
      setAssignments(result.assignments);
      setApplicationCount(result.applicationCount);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить тестовые задания",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isCancelled = false;

    getPublishedAssignments()
      .then((result) => {
        if (!isCancelled) {
          setAssignments(result.assignments);
          setApplicationCount(result.applicationCount);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить тестовые задания",
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
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Тестовые задания</h1>
          <p className="mt-2 text-slate-600">
            Опубликованные задания для когорт, в которые вы подали заявку.
          </p>
        </div>

        {isLoading && <p className="text-slate-600">Загрузка заданий...</p>}

        {!isLoading && loadError && (
          <Card>
            <CardContent className="space-y-4 py-8 text-center">
              <p className="text-red-600">{loadError}</p>
              <Button type="button" variant="outline" onClick={loadAssignments}>
                Повторить
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !loadError && applicationCount === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-600">
              У вас пока нет заявок на практику.
            </CardContent>
          </Card>
        )}

        {!isLoading && !loadError && applicationCount > 0 && assignments.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-600">
              Опубликованных тестовых заданий пока нет.
            </CardContent>
          </Card>
        )}

        {!isLoading && !loadError && assignments.length > 0 && (
          <div className="space-y-6">
            {assignments.map(({ cohort, assignment }) => (
              <Card key={assignment.id}>
                <CardHeader className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">{cohort.title}</p>
                  <CardTitle>{assignment.title}</CardTitle>
                  {assignment.description && (
                    <p className="whitespace-pre-wrap text-slate-600">
                      {assignment.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-5 text-slate-800">
                    {assignment.content}
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
