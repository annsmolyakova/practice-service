"use client";

import { useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";

import {
  getTasks,
  saveTasks,
} from "@/lib/task-storage";

import {
  getApplications,
} from "@/lib/application-storage";

import type { Task } from "@/types/task";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function StudentTasksPage() {
  const [taskList, setTaskList] =
    useState<Task[]>(getTasks());

  const user =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem(
            "user"
          ) || "{}"
        )
      : null;

  const applications =
    getApplications();

  const myApplication =
    applications.find(
      (application) =>
        application.userId ===
          user?.id &&
        application.status ===
          "approved"
    );

  const assignedRole =
    myApplication?.assignedRole;

  const myTasks = useMemo(
    () =>
      taskList.filter(
        (task) =>
          task.role ===
          assignedRole
      ),
    [taskList, assignedRole]
  );

  function updateTaskStatus(
    taskId: number,
    status: Task["status"]
  ) {
    const updatedTasks =
      taskList.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
            }
          : task
      );

    setTaskList(updatedTasks);

    saveTasks(updatedTasks);
  }

  function getStatusText(
    status: Task["status"]
  ) {
    switch (status) {
      case "in_progress":
        return "В работе";

      case "done":
        return "Выполнено";

      default:
        return "Не начато";
    }
  }

  return (
    <ProtectedRoute allowedRole="student">
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Мои задачи
          </h1>

          {assignedRole && (
            <p className="text-slate-500 mt-2">
              Назначенная роль:{" "}
              {assignedRole}
            </p>
          )}
        </div>

        {!assignedRole && (
          <Card>
            <CardContent className="py-10 text-center">
              Вам пока не назначили роль.
            </CardContent>
          </Card>
        )}

        {assignedRole &&
          myTasks.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center">
                Для вашей роли пока нет задач.
              </CardContent>
            </Card>
          )}

        <div className="space-y-6">
          {myTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>
                  {task.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p>
                  {task.description}
                </p>

                <p>
                  <b>Статус:</b>{" "}
                  {getStatusText(
                    task.status
                  )}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant={
                      task.status ===
                      "todo"
                        ? "default"
                        : "outline"
                    }
                    disabled={
                      task.status ===
                      "done"
                    }
                    onClick={() =>
                      updateTaskStatus(
                        task.id,
                        "todo"
                      )
                    }
                  >
                    Не начато
                  </Button>

                  <Button
                    variant={
                      task.status ===
                      "in_progress"
                        ? "default"
                        : "outline"
                    }
                    disabled={
                      task.status ===
                      "done"
                    }
                    onClick={() =>
                      updateTaskStatus(
                        task.id,
                        "in_progress"
                      )
                    }
                  >
                    В работе
                  </Button>

                  <Button
                    variant={
                      task.status ===
                      "done"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      updateTaskStatus(
                        task.id,
                        "done"
                      )
                    }
                  >
                    Выполнено
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}