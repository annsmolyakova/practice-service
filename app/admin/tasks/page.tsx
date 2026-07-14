"use client";

import { useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import ProtectedRoute from "@/components/layout/protected-route";

import {
  getTasks,
  saveTasks,
} from "@/lib/task-storage";

import type { Task } from "@/types/task";
import type { Application } from "@/types/application";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
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

import { roles } from "@/constants/roles";

export default function AdminTasksPage() {
  const [taskList, setTaskList] =
    useState<Task[]>(getTasks());

  const [isOpen, setIsOpen] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [role, setRole] =
    useState("");

  const [
    assignedUserId,
    setAssignedUserId,
  ] = useState<number | null>(
    null
  );

  const [
    assignedUserName,
    setAssignedUserName,
  ] = useState("");

  const applications: Application[] =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem(
            "applications"
          ) || "[]"
        )
      : [];

  const availableStudents =
    applications.filter(
      (application) =>
        application.status ===
          "approved" &&
        application.assignedRole ===
          role
    );

  function createTask() {
    if (
      !title ||
      !description ||
      !role ||
      !assignedUserId
    ) {
      alert(
        "Заполните все поля"
      );

      return;
    }

    const newTask: Task = {
      id: Date.now(),

      title,
      description,

      role,

      assignedUserId,
      assignedUserName,

      status: "todo",
    };

    const updatedTasks = [
      ...taskList,
      newTask,
    ];

    setTaskList(updatedTasks);

    saveTasks(updatedTasks);

    setTitle("");
    setDescription("");
    setRole("");
    setAssignedUserId(null);
    setAssignedUserName("");

    setIsOpen(false);
  }

  function deleteTask(
    id: number
  ) {
    const updatedTasks =
      taskList.filter(
        (task) =>
          task.id !== id
      );

    setTaskList(updatedTasks);

    saveTasks(updatedTasks);
  }

  function getStatusText(
    status: string
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
    <ProtectedRoute allowedRole="admin">
      <DashboardLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Задачи
          </h1>

          <Button
            onClick={() =>
              setIsOpen(true)
            }
          >
            Создать задачу
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Список задач
            </CardTitle>
          </CardHeader>

          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">
                    Название
                  </th>

                  <th className="text-left py-3">
                    Роль
                  </th>

                  <th className="text-left py-3">
                    Исполнитель
                  </th>

                  <th className="text-left py-3">
                    Статус
                  </th>

                  <th className="text-left py-3">
                    Действия
                  </th>
                </tr>
              </thead>

              <tbody>
                {taskList.map(
                  (task) => (
                    <tr
                      key={task.id}
                      className="border-b"
                    >
                      <td className="py-4">
                        <div className="font-medium">
                          {task.title}
                        </div>

                        <div className="text-sm text-slate-500">
                          {
                            task.description
                          }
                        </div>
                      </td>

                      <td>
                        {task.role}
                      </td>

                      <td>
                        {task.assignedUserName ||
                          "-"}
                      </td>

                      <td>
                        {getStatusText(
                          task.status
                        )}
                      </td>

                      <td>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            deleteTask(
                              task.id
                            )
                          }
                        >
                          Удалить
                        </Button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Dialog
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Создание задачи
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>
                  Название задачи
                </Label>

                <Input
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>
                  Описание
                </Label>

                <Input
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <Label>
                  Роль
                </Label>

                <Select
                  value={role}
                  onValueChange={(
                    value
                  ) => {
                    setRole(
                      value ?? ""
                    );

                    setAssignedUserId(
                      null
                    );

                    setAssignedUserName(
                      ""
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>

                  <SelectContent>
                    {roles.map(
                      (
                        role
                      ) => (
                        <SelectItem
                          key={
                            role
                          }
                          value={
                            role
                          }
                        >
                          {
                            role
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Исполнитель
                </Label>

                <Select
                  value={
                    assignedUserId?.toString() ||
                    ""
                  }
                  onValueChange={(
                    value
                  ) => {
                    const student =
                      availableStudents.find(
                        (
                          application
                        ) =>
                          application.userId ===
                          Number(
                            value
                          )
                      );

                    setAssignedUserId(
                      Number(
                        value
                      )
                    );

                    setAssignedUserName(
                      student?.fullName ||
                        ""
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите студента" />
                  </SelectTrigger>

                  <SelectContent>
                    {availableStudents.map(
                      (
                        student
                      ) => (
                        <SelectItem
                          key={
                            student.userId
                          }
                          value={student.userId.toString()}
                        >
                          {
                            student.fullName
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={
                  createTask
                }
              >
                Создать задачу
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}